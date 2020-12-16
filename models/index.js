const mongoose = require('mongoose'),
	  Users     = require('./users'),
	  Transactions = require('./transactions');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/bank-of-wasserstein', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, keepAlive: true});
mongoose.set('useCreateIndex', true);

module.exports = {Users, Transactions};