const express               = require('express'),
	  router                = express.Router({mergeParams: true}),
	  db                    = require('../models'),
	  {isUserLoggedIn}      = require('../middleware/auth'),
	  faker                 = require('faker'),
	  {checkMissingFields}  = require('../utils');

router.get('/', isUserLoggedIn, async function(req, res){
	try {
		const accountId = req.sanitize(req.params.accountId);
		const account = await db.Accounts.findById(accountId).populate('transactions').populate('user').exec();
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

		const amount = req.sanitize(req.body.amount);
		const type = req.sanitize(req.body.type);
		const description = req.sanitize(req.body.description);
		const counterparty = req.sanitize(req.body.counterparty);
		const accountType = req.sanitize(req.body.accountType);
		const accountId = req.sanitize(req.params.accountId);

		if(isNaN(amount) || +amount === 0){
			return res.status(400).json({error: 'Amount must be a non-zero number'});
		}
		if(!['Transfer', 'Deposit', 'Withdrawal'].includes(type)){
			return res.status(400).json({error: 'Type must be either Transfer, Deposit, or Withdrawal'});
		}
		if(!String(description).length){
			return res.status(400).json({error: 'The description field cannot be empty'});
		}
		if(type === 'Transfer' && +amount >= 0){
			return res.status(400).json({error: 'Your transfer amount must be negative'});
		}
		
		const account = await db.Accounts.findById(accountId).populate('transactions').populate('user').exec();
		if(account.user.id !== res.locals.user.id){
			return res.status(401).json({error: "You're not authorized to access that resource"});
		}
		
		if(type === 'Transfer'){
			const userCP = await db.Users.findOne({username: counterparty}).populate('accounts').exec();
			if(!userCP){
				return res.status(400).json({error: "That user doesn't exist"});
			}
			let cPAccount = userCP.accounts.find(a => a.type === accountType);
			if(!cPAccount){
				return res.status(400).json({error: `That user doesn't have a ${accountType} account`});
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
			const amountCP = -1*(+amount);
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
			amount: +amount,
			description: description,
			counterparty: counterparty,
			transactionNumber: lastTransaction.transactionNumber + 1,
			accountBalance: lastTransaction.accountBalance + (+amount),
			account: accountId
		});
		return res.status(201).json([...account.transactions, transaction]);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

router.post('/generate/:num', isUserLoggedIn, async function(req, res){
	try {
		const num = req.sanitize(req.params.num);
		const accountId = req.sanitize(req.params.accountId);

		if(isNaN(num) || Math.round(+num) !== +num){
			return res.status(400).json({error: 'Number of transactions must be an integer'});
		}
		if(+num < 1){
			return res.status(400).json({error: 'Number of transactions must be greater than or equal to 1'});
		}
		
		const account = await db.Accounts.findById(accountId).populate('transactions').populate('user').exec();
		if(account.user.id !== res.locals.user.id){
			return res.status(401).json({error: "You're not authorized to access that resource"});
		}

		let lastTransaction; 
		if(account.transactions.length){
			lastTransaction = account.transactions.reduce((acc, next) => next.transactionNumber > acc.transactionNumber ? next : acc);
		} else {
			lastTransaction = {transactionNumber: -1, accountBalance: 0};
		}
		
		let transactions = [];
		let cumulativeNewAmount = 0;
		for(let i = 0; i < num; i++){
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
				accountBalance: +(lastTransaction.accountBalance + cumulativeNewAmount).toFixed(2),
				account: account._id
			});
		}
		transactions = await db.Transactions.create(transactions);
		return res.status(201).json([...account.transactions, ...transactions]);
	} catch(err) {
		return res.status(500).json({error: err.message});
	}
});

module.exports = router;