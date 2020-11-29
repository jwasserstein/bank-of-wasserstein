const mongoose = require('mongoose'),
	  Users    = require('./users');

const transactionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
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
	recipient: {
		type: String,
		required: true
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
		const user = await Users.findById(this.user);
		user.transactions.push(this._id);
		await user.save();
		return next();
	} catch(err) {
		return next(err);
	}
});

transactionSchema.pre('remove', async function(next){
	try {
		const user = await Users.findById(this.user);
		user.transactions = user.transactions.filter(t => t != this.id);
		await user.save();
		return next();
	} catch(err) {
		return next(err);
	}
});

module.exports = mongoose.model('transaction', transactionSchema);