const express = require('express'),
	  router  = express.Router({mergeParams: true}),
	  db      = require('../models'),
	  bcrypt  = require('bcrypt'),
	  isUserLoggedin = require('../middleware/auth');

router.post('/signup', async function(req, res) {
	try {
		const user = await db.Users.create(req.body);
		res.json({user});
	} catch (err) {
		res.json({error: err.message});
	}
});

router.post('/signin', async function (req, res) {
	try {
		const user = await db.Users.findOne({username: req.body.username});
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