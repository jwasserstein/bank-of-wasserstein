const express = require('express');
const router = express.Router({mergeParams: true});
const db = require('../models');
const {isUserLoggedIn} = require('../middleware/auth');
const {checkMissingFields} = require('../utils/');

router.get('/', isUserLoggedIn, async function(req, res){
    try {
        const user = await db.Users.findById(res.locals.user.id).populate('accounts').exec();
        return res.json(user.accounts);
    } catch(err) {
        return res.status(500).json({error: err.message});
    }
});

router.post('/', isUserLoggedIn, async function(req, res){
    try {
        const missingFields = checkMissingFields(req.body, ['type']);
        if(missingFields.length){
            return res.status(400).json({error: `Missing the following fields: ${missingFields}`});
        }
        if(!['Checking', 'Savings', 'Investing'].includes(req.body.type)){
            return res.status(400).json({error: 'Type must be one of the following: Checking, Savings, Investing'});
        }

        const type = req.sanitize(req.body.type);

        const user = await db.Users.findById(res.locals.user.id).populate('accounts').exec();
        for(let i = 0; i < user.accounts.length; i++){
            if(user.accounts[i].type === type){
                return res.status(400).json({error: `You already have a ${type} account`});
            }
        }

        const account = await db.Accounts.create({
            type: type,
            user: res.locals.user.id,
            transactions: [],
            accountBalance: 0
        });

        user.accounts.push(account);
        await user.save();
        return res.json(user.accounts);
    } catch(err) {
        return res.status(500).json({error: err.message});
    }
});

router.delete('/:accountId', isUserLoggedIn, async function(req, res){
    try {
        const accountId = req.sanitize(req.params.accountId);

        const account = await db.Accounts.findById(accountId);
        if(!account){
            return res.status(400).json({error: "That account doesn't exist"});
        }
        if(account.user.toString() !== res.locals.user.id){
			return res.status(401).json({error: "You're not authorized to access that account"});
        }

        const user = await db.Users.findById(res.locals.user.id);
        user.accounts = user.accounts.filter(a => a != accountId);
        await user.save();
        await db.Transactions.deleteMany({_id: {$in: account.transactions}});
        account.remove();
        return res.json(account);
    } catch(err) {
        return res.status(500).json({error: err.message});
    }
});

module.exports = router;