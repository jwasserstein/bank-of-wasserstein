const express               = require('express'),
	  router                = express.Router({mergeParams: true}),
	  db                    = require('../models'),
	  {isUserLoggedIn,
	   doesUserOwnResource} = require('../middleware/auth'),
	  faker                 = require('faker'),
	  {checkMissingFields}  = require('../utils');

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
		const missingFields = checkMissingFields(req.body, ['amount', 'counterparty', 'type', 'description']);
		if(missingFields.length){
			return res.status(400).json({error: 'Missing the following fields: ' + missingFields});
		}
		if(isNaN(req.body.amount) || +req.body.amount === 0){
			return res.status(400).json({error: 'Amount must be a non-zero number'});
		}
		if(!['Transfer', 'Deposit', 'Withdrawal'].includes(req.body.type)){
			return res.status(400).json({error: 'Type must be either Transfer, Deposit, or Withdrawal'});
		}
		if(!String(req.body.description).length){
			return res.status(400).json({error: 'The description field cannot be empty'});
		}
		
		const user = await db.Users.findById(req.params.userId).populate('transactions').exec();
		
		if(req.body.type === 'Transfer'){
			const userCP = await db.Users.findOne({username: req.body.counterparty}).populate('transactions').exec();
			if(!userCP){
				return res.status(400).json({error: "That user doesn't exist"});
			}
			
			let lastTransactionCP;
			if(userCP.transactions.length){
				lastTransactionCP = userCP.transactions.reduce((acc, next) => next.transactionNumber > acc.transactionNumber ? next : acc);
			} else {
				lastTransactionCP = {transactionNumber: -1, accountBalance: 0};
			}
			const amountCP = -1*(+req.body.amount);
			await db.Transactions.create({
				description: 'Transfer from ' + user.username,
				amount: amountCP,
				user: userCP.id, 
				counterparty: user.username,
				transactionNumber: lastTransactionCP.transactionNumber + 1,
				accountBalance: lastTransactionCP.accountBalance + amountCP
			});
		}
		
		
		let lastTransaction;
		if(user.transactions.length){
			lastTransaction = user.transactions.reduce((acc, next) => next.transactionNumber > acc.transactionNumber ? next : acc);
		} else {
			lastTransaction = {transactionNumber: -1, accountBalance: 0};
		}	
		const transaction = await db.Transactions.create({
			user: req.params.userId, 
			amount: +req.body.amount,
			description: req.body.description,
			counterparty: req.body.counterparty,
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
		if(!transaction){
			return res.status(400).json({error: "That transaction doesn't exist"});
		}
		if(transaction.user.toString() !== req.params.userId){
			return res.status(401).json({error: "You're not authorized to access that transaction"});
		}
		return res.json(transaction);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.delete('/:transactionId', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		const transaction = await db.Transactions.findById(req.params.transactionId);
		if(!transaction){
			return res.status(400).json({error: "That transaction doesn't exist"});
		}
		if(transaction.user.toString() !== req.params.userId){
			return res.status(401).json({error: "You're not authorized to access that transaction"});
		}
		transaction.remove();
		return res.json(transaction);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.post('/generate/:num', isUserLoggedIn, doesUserOwnResource, async function(req, res){
	try {
		if(isNaN(req.params.num) || Math.round(+req.params.num) !== +req.params.num){
			return res.status(400).json({error: 'Number of transactions must be an integer'});
		}
		if(+req.params.num < 1){
			return res.status(400).json({error: 'Number of transactions must be greater than or equal to 1'});
		}
		
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
			const amount = +(Math.random()*2000-700).toFixed(2);
			const counterparty = faker.finance.transactionDescription().match(/at (.*) using/)[1];
			const description = amount >= 0 ? 'Payment from ' + counterparty : 'Payment to ' + counterparty;

			cumulativeNewAmount += amount;
			transactions.push({
				user: req.params.userId,
				description: description,
				amount: amount,
				counterparty: counterparty,
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