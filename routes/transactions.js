const express = require('express'),
	  router  = express.Router({mergeParams: true}),
	  db      = require('../models'),
	  {isUserLoggedIn, doesUserOwnResource} = require('../middleware/auth');

router.get('/', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const user = await db.Users.findById(req.params.userId).populate('transactions').exec();
		res.json(user.transactions);
	} catch(err) {
		res.json({message: err.message});
	}
});

router.post('/', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const transaction = await db.Transactions.create({user: req.params.userId, ...req.body});
		res.json(transaction);
	} catch(err) {
		res.json({message: err.message});
	}
});

router.get('/:transactionId', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const transaction = await db.Transactions.findById(req.params.transactionId);
		res.json(transaction);
	} catch(err) {
		res.json({message: err.message});
	}
});

router.delete('/:transactionId', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const transaction = await db.Transactions.findById(req.params.transactionId);
		transaction.remove();
		res.json(transaction);
	} catch(err) {
		res.json({message: err.message});
	}
});

module.exports = router;