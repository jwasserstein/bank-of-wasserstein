const express = require('express'),
	  router  = express.Router({mergeParams: true}),
	  db      = require('../models'),
	  {isUserLoggedIn, doesUserOwnResource} = require('../middleware/auth'),
	  faker   = require('faker');

router.get('/', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const user = await db.Users.findById(req.params.userId).populate('transactions').exec();
		return res.json(user.transactions);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.post('/', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const user = await db.Users.findById(req.params.userId).populate('transactions').exec();
		
		let lastTransaction;
		if(user.transactions.length){
			lastTransaction = user.transactions.reduce((acc, next) => next.transactionNumber > acc.transactionNumber ? next : acc);
		} else {
			lastTransaction = {transactionNumber: -1, accountBalance: 0};
		}
			
		const transaction = await db.Transactions.create({
			...req.body, 
			user: req.params.userId, 
			transactionNumber: lastTransaction.transactionNumber + 1,
			accountBalance: lastTransaction.accountBalance + (+req.body.amount)
		});
		return res.status(201).json([...user.transactions, transaction]);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.get('/:transactionId', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const transaction = await db.Transactions.findById(req.params.transactionId);
		return res.json(transaction);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.delete('/:transactionId', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const transaction = await db.Transactions.findById(req.params.transactionId);
		transaction.remove();
		return res.json(transaction);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.post('/generate/:num', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const user = await db.Users.findById(req.params.userId).populate('transactions').exec();
		let lastTransaction; 
		if(user.transactions.length){
			lastTransaction = user.transactions.reduce((acc, next) => next.transactionNumber > acc.transactionNumber ? next : acc);
		} else {
			lastTransaction = {transactionNumber: -1, accountBalance: 0};
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
		return res.status(201).json([...user.transactions, ...transactions]);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

module.exports = router;