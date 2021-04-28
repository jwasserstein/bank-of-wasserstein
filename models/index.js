const mongoose     = require('mongoose'),
	  Users        = require('./users'),
	  Transactions = require('./transactions'),
	  Accounts     = require('./accounts');

mongoose.set('useCreateIndex', true);

module.exports = {Users, Transactions, Accounts};