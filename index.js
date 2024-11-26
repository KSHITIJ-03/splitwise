const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path")
const bodyParser = require('body-parser');
app.use(express.json())

const User = require('./models/users');
const Group = require('./models/groups');
const Balance = require('./models/balance');
const Transaction = require('./models/transactions')


const dotenv = require("dotenv")
dotenv.config({path : "./config.env"})


app.get('/', (req, res) => {
    res.send('hello from the slpitwise server!!');
})

app.post('/user', async (req, res) => {
    try {
        const user = await User.create(req.body);

        //const transacrion = await Transaction.create()

        res.status(201).json({
            status : 'success',
            message : 'user created',
            user
        })
    } catch(err) {
        res.status(500).json({
            status : 'fail',
            message : 'server internal error!'
        })
    }
})

app.post('/user/create-group', async (req, res) => {
    try {
        let { user, title } = req.body;
        
        const newGroup = await Group.create({title});
        const freshUser = await User.findOne({name : user});

        console.log(newGroup, freshUser);
        
        newGroup.members.push(freshUser._id);
        freshUser.groups.push(newGroup._id);
        await newGroup.save();
        await freshUser.save();

        const transacrion = await Transaction.create({
            user : freshUser._id,
            group : newGroup._id
        })


        res.status(201).json({
            status : 'success',
            message : 'group created',
            group : newGroup
        })
    } catch(err) {
        res.status(500).json({
            status : 'fail',
            message : 'server internal error!'
        })
    }
})

app.post('/user/join-group', async (req, res) => {
    try {
        let { user, title } = req.body;
        
        const oldGroup = await Group.findOne({title});
        const freshUser = await User.findOne({name : user});

        oldGroup.members.push(freshUser._id);
        freshUser.groups.push(oldGroup._id);
        await oldGroup.save();
        await freshUser.save();

        const transaction = await Transaction.create({
            user : freshUser._id,
            group : oldGroup._id
        })

        console.log(transaction);
        

        res.status(201).json({
            status : 'success',
            message : 'group joined',
            freshUser
        })
    } catch(err) {
        res.status(500).json({
            status : 'fail',
            message : 'server internal error!'
        })
    }
})

app.post('/user/:group/balance', async (req, res) => {
    try {
        let {user} = req.body;
        let group = req.params.group;

        console.log(group);
        
        let {payment} = req.body;
        
        const freshUser = await User.findOne({name : user});
        const oldGroup = await Group.findOne({title : group});

        console.log(freshUser, oldGroup);
        

        const balance = await Balance.create({
            user : freshUser._id,
            group : oldGroup._id,
            balance : payment
        })

        res.status(201).json({
            status : 'success',
            message : 'balance created',
            balance
        })
    } catch(err) {
        res.status(500).json({
            status : 'fail',
            message : 'server internal error!'
        })
    }
})

// make payment

app.post('/user/:group/payment', async (req, res) => {
    try {
        let {user, payment, name} = req.body;
        let group = req.params.group;

        console.log(group);
        
        const freshUser = await User.findOne({name : user});
        const oldGroup = await Group.findOne({title : group});

        console.log(freshUser, oldGroup);
        
        let credits = oldGroup.members;

        console.log(credits, payment);


        for(let i = 0; i < credits.length; i++) {
            let transactions = await Transaction.findById(credits[i]);
            transactions.transaction.push({
                name,
                owe : freshUser._id,
                amount : payment/credits.length
            })
            await transactions.save();
        }
        

        // const balance = await Balance.create({
        //     user : freshUser._id,
        //     group : oldGroup._id,
        //     balance : payment
            
        // })

        res.status(201).json({
            status : 'success',
            message : 'balance created'
            //balance
        })
    } catch(err) {
        res.status(500).json({
            status : 'fail',
            message : 'server internal error!'
        })
    }
})


app.listen(3005, () => {
    console.log('splitwise server on port : 3005');
})

const DB = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD)

//console.log(DB);

mongoose.connect(DB).then(con => {
    //console.log(con.connections);
    console.log("databse connected");
})