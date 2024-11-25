const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    group : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Group'
    },
    balance : Number
})

const Balance = new mongoose.model('Balance', balanceSchema)
module.exports = Balance;