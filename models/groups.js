const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    title : String,
    members : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }] 
})

const Group = new mongoose.model('Group', groupSchema)

module.exports = Group;