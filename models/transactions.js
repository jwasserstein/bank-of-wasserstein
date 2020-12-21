const mongoose = require('mongoose'),
	  Accounts = require('./accounts');

const transactionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
		required: true
	},
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'account',
		required: true
	},
	description: {
		type: String,
		required: true
	},
	amount: {
		type: Number,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	counterparty: {
		type: String
	},
	transactionNumber: {
		type: Number,
		required: true
	},
	accountBalance: {
		type: Number,
		required: true
	}
});

transactionSchema.pre('save', async function(next){
	try {
		const account = await Accounts.findById(this.account);
		account.transactions.push(this._id);
		account.accountBalance = this.accountBalance;
		await account.save();
		return next();
	} catch(err) {
		return next(err);
	}
});

transactionSchema.pre('remove', async function(next){
	try {
		const account = await Accounts.findById(this.account);
		account.transactions = account.transactions.filter(t => t != this.id);
		await account.save();
		return next();
	} catch(err) {
		return next(err);
	}
});

module.exports = mongoose.model('transaction', transactionSchema);