const express = require('express'),
	  router  = express.Router({mergeParams: true}),
	  db      = require('../models'),
	  bcrypt  = require('bcrypt'),
	  isUserLoggedin = require('../middleware/auth'),
	  jwt     = require('jsonwebtoken');

router.post('/signup', async function(req, res) {
	try {
		if(!req.body.username) {
			return res.status(401).json({error: 'Username is required'});
		}
		if(!req.body.password) {
			return res.status(401).json({error: 'Password is required'});
		}
		if(!req.body.email) {
			return res.status(401).json({error: 'Email is required'});
		}
		
		const user = await db.Users.create(req.body);
		const token = jwt.sign({
			id: user._id,
			username: user.username,
			email: user.email
		}, process.env.SECRET_KEY);
		return res.status(201).json({
			id: user._id,
			username: user.username,
			email: user.email,
			token
		});
	} catch (err) {
		return res.status(500).json({error: err.message});
	}
});

router.post('/signin', async function (req, res) {
	try {
		if(!req.body.username) {
			return res.status(401).json({error: 'Username is required'});
		}
		if(!req.body.password) {
			return res.status(401).json({error: 'Password is required'});
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
				email: user.email
			}, process.env.SECRET_KEY);
			return res.json({
				id: user._id,
				username: user.username,
				email: user.email,
				token
			});
		} else {
			return res.status(401).json({error: 'Incorrect password'});
		}
	} catch (err) {
		return res.status(500).json({error: err.message});
	}
});

module.exports = router;