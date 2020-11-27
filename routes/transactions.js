const express = require('express'),
	  router  = express.Router({mergeParams: true}),
	  db      = require('../models'),
	  {isUserLoggedIn, doesUserOwnResource} = require('../middleware/auth'),
	  faker   = require('faker');

router.get('/', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const user = await db.Users.findById(req.params.userId).populate('transactions').exec();
		res.json(user.transactions);
	} catch(err) {
		res.status(500).json({message: err.message});
	}
});

router.post('/', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const transaction = await db.Transactions.create({user: req.params.userId, ...req.body});
		res.status(201).json(transaction);
	} catch(err) {
		res.status(500).json({message: err.message});
	}
});

router.get('/:transactionId', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const transaction = await db.Transactions.findById(req.params.transactionId);
		res.json(transaction);
	} catch(err) {
		res.status(500).json({message: err.message});
	}
});

router.delete('/:transactionId', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const transaction = await db.Transactions.findById(req.params.transactionId);
		transaction.remove();
		res.json(transaction);
	} catch(err) {
		res.status(500).json({message: err.message});
	}
});

router.post('/generate/:num', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const existingTransactions = (await db.Users.findById(req.params.userId).populate('transactions').exec()).transactions;
		let lastTransaction = {transactionNumber: -1, accountBalance: 0};
		if(existingTransactions.length > 0){
			lastTransaction = existingTransactions.reduce((acc, next) => next.transactionNumber > acc.transactionNumber ? next : acc);
		}
		
		let transactions = [];
		let cumulativeNewAmount = 0;
		for(let i = 0; i < req.params.num; i++){
			let amount = +(faker.finance.amount().toFixed(2));
			const description = faker.finance.transactionDescription();
			if(description.split(' ')[0] !== 'deposit'){
				amount = amount * -1;
			}
			cumulativeNewAmount += amount;
			transactions.push({
				user: req.params.userId,
				description: description.split(' using ')[0],
				amount: amount,
				receivingAccount: faker.finance.account(),
				receivingRouting: faker.finance.routingNumber(),
				transactionNumber: lastTransaction.transactionNumber + i + 1,
				accountBalance: +(lastTransaction.accountBalance + cumulativeNewAmount).toFixed(2)
			});
		}
		transactions = await db.Transactions.create(transactions);
		res.status(201).json(transactions);
	} catch(err) {
		res.status(500).json({message: err.message});
	}
});

module.exports = router;