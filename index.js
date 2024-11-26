const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path")
const bodyParser = require('body-parser');
const morgan = require('morgan');
app.use(morgan("dev"))
app.use(express.json())

const User = require('./models/users');
const Group = require('./models/groups');
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

// make payment

app.post('/user/:group/payment', async (req, res) => {
    try {
        let {user, payment, name} = req.body;
        let group = req.params.group;

        console.log(group);
        
        const freshUser = await User.findOne({name : user});
        const oldGroup = await Group.findOne({title : group});
        
        let credits = oldGroup.members;
        credits = credits.filter(member => member.toString() != freshUser._id.toString());

        for(let i = 0; i < credits.length; i++) {
            let transactions = await Transaction.findOneAndUpdate({user : credits[i], group : oldGroup._id}, {
                $addToSet : {
                    transaction : {
                        name,
                        owe : freshUser._id,
                        amount : payment/credits.length
                    }
                }
            },
            { 
                new : true
            })
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

app.get('/user/:group/status', async (req, res) => {
    try {
        let {user} = req.body;
        let {group} = req.params;

        const freshUser = await User.findOne({name : user});
        const oldGroup = await Group.findOne({title : group});

        //console.log(freshUser, oldGroup);
        

        // making final results // ----------------

        let dues = await Transaction.find({user : freshUser._id, group : oldGroup._id}).populate({
            path : 'transaction.owe',
            select : 'name'
        })

        dues = dues.map(due => ({
            transactions: due.transaction.map(tx => ({
                name: tx.name,
                owe: tx.owe.name,
                amount: tx.amount,
            }))
        }));

        //console.log(dues);

        let new_dues = dues[0].transactions;

        let total_dues = new_dues.reduce((acc, due) => {
            return acc + due.amount;
        }, 0)

        /*
        let total_dues = dues.reduce((acc, due) => {
            return acc + due.transactions.reduce((subAcc, tx) => subAcc + tx.amount, 0);
        }, 0);
        */
        
        res.status(200).json({
            status : 'succcess',
            message : 'all the dues',
            total_dues,
            dues
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