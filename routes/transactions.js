const express               = require('express'),
	  router                = express.Router({mergeParams: true}),
	  db                    = require('../models'),
	  {isUserLoggedIn}      = require('../middleware/auth'),
	  faker                 = require('faker'),
	  {checkMissingFields}  = require('../utils');

router.get('/', isUserLoggedIn, async function(req, res){
	try {
		const account = await db.Accounts.findById(req.params.accountId).populate('transactions').populate('user').exec();
		if(account.user.id !== res.locals.user.id){
			return res.status(401).json({error: "You're not authorized to access that resource"});
		}
		return res.json(account.transactions);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.post('/', isUserLoggedIn, async function(req, res){
	try {
		let missingFields = checkMissingFields(req.body, ['amount', 'type', 'description']); // check general field types
		if(missingFields.length){
			return res.status(400).json({error: 'Missing the following fields: ' + missingFields});
		}
		if(req.body.type === 'Transfer'){
			missingFields = checkMissingFields(req.body, ['counterparty', 'accountType']); // check field types specific to transfers
			if(missingFields.length){
				return res.status(400).json({error: 'Missing the following fields: ' + missingFields});
			}
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
		if(req.body.type === 'Transfer' && +req.body.amount >= 0){
			return res.status(400).json({error: 'Your transfer amount must be negative'});
		}
		
		const account = await db.Accounts.findById(req.params.accountId).populate('transactions').populate('user').exec();
		if(account.user.id !== res.locals.user.id){
			return res.status(401).json({error: "You're not authorized to access that resource"});
		}
		
		if(req.body.type === 'Transfer'){
			const userCP = await db.Users.findOne({username: req.body.counterparty}).populate('accounts').exec();
			if(!userCP){
				return res.status(400).json({error: "That user doesn't exist"});
			}
			let cPAccount = userCP.accounts.find(a => a.type === req.body.accountType);
			if(!cPAccount){
				return res.status(400).json({error: `That user doesn't have a ${req.body.accountType} account`});
			}
			if(cPAccount.id === account.id){
				return res.status(400).json({error: "You can't transfer from an account to itself"});
			}

			cPAccount = await db.Accounts.findById(cPAccount.id).populate('transactions').exec();
			
			let lastTransactionCP;
			if(cPAccount.transactions.length){
				lastTransactionCP = cPAccount.transactions.reduce((acc, next) => next.transactionNumber > acc.transactionNumber ? next : acc);
			} else {
				lastTransactionCP = {transactionNumber: -1, accountBalance: 0};
			}
			const amountCP = -1*(+req.body.amount);
			await db.Transactions.create({
				description: 'Transfer from ' + account.user.username,
				amount: amountCP,
				user: userCP._id, 
				counterparty: account.user.username,
				transactionNumber: lastTransactionCP.transactionNumber + 1,
				accountBalance: lastTransactionCP.accountBalance + amountCP,
				account: cPAccount._id
			});
		}
		
		
		let lastTransaction;
		if(account.transactions.length){
			lastTransaction = account.transactions.reduce((acc, next) => next.transactionNumber > acc.transactionNumber ? next : acc);
		} else {
			lastTransaction = {transactionNumber: -1, accountBalance: 0};
		}	
		const transaction = await db.Transactions.create({
			user: res.locals.user.id, 
			amount: +req.body.amount,
			description: req.body.description,
			counterparty: req.body.counterparty,
			transactionNumber: lastTransaction.transactionNumber + 1,
			accountBalance: lastTransaction.accountBalance + (+req.body.amount),
			account: req.params.accountId
		});
		return res.status(201).json([...account.transactions, transaction]);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.get('/:transactionId', isUserLoggedIn, async function(req, res){
	try {
		const transaction = await db.Transactions.findById(req.params.transactionId);
		if(!transaction){
			return res.status(400).json({error: "That transaction doesn't exist"});
		}
		if(transaction.user.toString() !== res.locals.user.id){
			return res.status(401).json({error: "You're not authorized to access that transaction"});
		}
		return res.json(transaction);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.delete('/:transactionId', isUserLoggedIn, async function(req, res){
	try {
		const transaction = await db.Transactions.findById(req.params.transactionId);
		if(!transaction){
			return res.status(400).json({error: "That transaction doesn't exist"});
		}
		if(transaction.user.toString() !== res.locals.user.id){
			return res.status(401).json({error: "You're not authorized to access that transaction"});
		}
		transaction.remove();
		return res.json(transaction);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.post('/generate/:num', isUserLoggedIn, async function(req, res){
	try {
		if(isNaN(req.params.num) || Math.round(+req.params.num) !== +req.params.num){
			return res.status(400).json({error: 'Number of transactions must be an integer'});
		}
		if(+req.params.num < 1){
			return res.status(400).json({error: 'Number of transactions must be greater than or equal to 1'});
		}
		
		const user = await db.Users.findById(res.locals.user.id).populate('transactions').exec();
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
				user: res.locals.user.id,
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