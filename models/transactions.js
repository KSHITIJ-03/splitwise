const mongoose = require('mongoose');

const transactionScehma = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    group : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Group'
    },
    transaction : {
        type : [{
                    name : String,
                    owe : {
                        type : mongoose.Schema.Types.ObjectId,
                        ref : 'User'
                    },
                    amount : Number
        }],
        default : []
    }
})

const Transaction = new mongoose.model('Transaction', transactionScehma)
module.exports = Transaction;