const mongoose = require('mongoose');

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
    createdDate: {
        type: Date,
        default: Date.now
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction',
        required: true
    }],
    accountBalance: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('account', accountSchema);