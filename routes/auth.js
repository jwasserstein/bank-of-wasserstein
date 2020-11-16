const express = require('express'),
	  router  = express.Router({mergeParams: true}),
	  db      = require('../models'),
	  bcrypt  = require('bcrypt'),
	  isUserLoggedin = require('../middleware/auth'),
	  jwt     = require('jsonwebtoken');

router.post('/signup', async function(req, res) {
	try {
		const user = await db.Users.create(req.body);
		const token = jwt.sign({
			id: user._id,
			username: user.username,
			email: user.email
		}, process.env.SECRET_KEY);
		res.json({
			id: user._id,
			username: user.username,
			email: user.email,
			token
		});
	} catch (err) {
		res.json({error: err.message});
	}
});

router.post('/signin', async function (req, res) {
	try {
		const user = await db.Users.findOne({username: req.body.username});
		if(!user){
			return res.json({error: 'Invalid username/password'});
		}
		const isMatch = await bcrypt.compare(req.body.password, user.password);
		if(isMatch){
			const token = jwt.sign({
				id: user._id,
				username: user.username,
				email: user.email
			}, process.env.SECRET_KEY);
			res.json({
				id: user._id,
				username: user.username,
				email: user.email,
				token
			});
		} else {
			res.json({error: 'Invalid username/password'});
		}
	} catch (err) {
		res.json({error: err.message});
	}
});

module.exports = router;