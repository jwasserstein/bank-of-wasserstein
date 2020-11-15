const mongoose = require('mongoose'),
	  Users     = require('./users'),
	  Transactions = require('./transactions');

mongoose.connect('mongodb://localhost/bank-of-wasserstein', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, keepAlive: true});

module.exports = {Users, Transactions};