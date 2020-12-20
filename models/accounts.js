const mongoose = require('mongoose');
const Users = require('./users');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction'
    }]
});

accountSchema.pre('save', async function(next){
    try {
        const user = await Users.findById(this.user);
        user.accounts.push(this._id);
        await user.save();
        return next();
    } catch(err) {
        return next(err);
    }
});

accountSchema.pre('remove', async function(next){
    try {
        const user = await Users.findById(this.user);
        user.accounts = user.accounts.filter(a => a != this.id);
        await user.save();
        return next();
    } catch(err) {
        return next(err);
    }
});

module.exports = mongoose.model('account', accountSchema);