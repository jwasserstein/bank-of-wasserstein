const express                = require('express'),
	  router                 = express.Router({mergeParams: true}),
	  db                     = require('../models'),
	  bcrypt                 = require('bcrypt'),
	  {isUserLoggedIn, 
		doesUserOwnResource} = require('../middleware/auth'),
	  jwt                    = require('jsonwebtoken'),
	  {checkMissingFields}   = require('../utils');

router.post('/signup', async function(req, res) {
	try {
		const missingFields = checkMissingFields(req.body, ['username', 'password', 'email']);
		if(missingFields.length){
			return res.status(400).json({error: 'Missing the following fields: ' + missingFields});
		}
		
		const user = await db.Users.create(req.body);
		const token = jwt.sign({
			id: user._id,
			username: user.username,
			email: user.email,
			joinDate: user.joinDate
		}, process.env.SECRET_KEY);
		return res.status(201).json({
			id: user._id,
			username: user.username,
			email: user.email,
			joinDate: user.joinDate,
			token
		});
	} catch (err) {
		return res.status(500).json({error: err.message});
	}
});

router.post('/signin', async function (req, res) {
	try {
		const missingFields = checkMissingFields(req.body, ['username', 'password']);
		if(missingFields.length){
			return res.status(400).json({error: 'Missing the following fields: ' + missingFields});
		}
		
		const user = await db.Users.findOne({username: req.body.username});
		if(!user){
			return res.status(401).json({error: "That username doesn't exist"});
		}
		const isMatch = await bcrypt.compare(req.body.password, user.password);
		if(isMatch){
			const token = jwt.sign({
				id: user._id,
				username: user.username,
				email: user.email,
				joinDate: user.joinDate
			}, process.env.SECRET_KEY);
			return res.json({
				id: user._id,
				username: user.username,
				email: user.email,
				joinDate: user.joinDate,
				token
			});
		} else {
			return res.status(401).json({error: 'Incorrect password'});
		}
	} catch (err) {
		return res.status(500).json({error: err.message});
	}
});

router.get('/profile/:userId', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	const user = await db.Users.findById(req.params.userId);
	const joinDate = user.joinDate || 'Unknown';
	return res.json({
		username: user.username, 
		email: user.email, 
		joinDate: joinDate});
});

module.exports = router;