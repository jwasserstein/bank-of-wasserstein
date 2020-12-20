const express = require('express');
const router = express.Router({mergeParams: true});
const db = require('../models');
const {isUserLoggedIn, doesUserOwnResource} = require('../middleware/auth');
const {checkMissingFields} = require('../utils/');

router.get('/', isUserLoggedIn, doesUserOwnResource, async function(req, res){
    const user = await db.Users.findById(req.params.userId);
    return res.json(user.accounts);
});

router.post('/', isUserLoggedIn, doesUserOwnResource, async function(req, res){
    const missingFields = checkMissingFields(req.body, ['name', 'type']);
    if(missingFields.length){
        return res.status(400).json({error: `Missing the following fields: ${missingFields}`});
    }
    if(!['Checking', 'Savings', 'Investing'].includes(req.body.type)){
        return res.status(400).json({error: 'Type must be one of the follwing: Checking, Savings, Investing'});
    }

    const account = await db.Accounts.create({
        name: req.body.name,
        type: req.body.type,
        user: req.params.userId,
        transactions: []
    });
    return res.json(account);
});

module.exports = router;