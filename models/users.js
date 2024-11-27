const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : String,
    password : String,
    groups : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'groups'
    }],
    payments : {
        type : [{
            group : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Group'
            },
            amount : Number
        }]
    }
})

const User = new mongoose.model('User', userSchema)

module.exports = User;