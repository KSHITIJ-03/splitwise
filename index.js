const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path = require("path")
const bodyParser = require('body-parser');
const morgan = require('morgan');

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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


//-----------------------------------------------------------------------------------

app.post('/user/:group/current-status', async (req, res) => {
    try {
        let {user, payment, name} = req.body;
        let group = req.params.group;

        console.log(group);
        
        const freshUser = await User.findOne({name : user});
        const oldGroup = await Group.findOne({title : group});
        
        let credits = oldGroup.members;
        credits = credits.filter(member => member.toString() != freshUser._id.toString());


        // total payments done by freshuser - total payments done by each user for this freshuser

        // on transactions schema
        

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
            transactions : due.transaction.map(tx => ({
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

app.get('/user/groups/:group', async(req, res) => {
    try {
        const members = await Group.findOne({title : req.params.group}).populate({
            path : 'members',
            select : 'name'
        })
        console.log(members);
        res.status(200).json({
            status : 'succcess',
            members
        })
        
    } catch(err) {
        res.status(500).json({
            status : 'fail',
            message : 'server internal error!'
        })
    }
})

async function grouping(user, group) {

    const dues = await Transaction.findOne({user, group});

    let transactions = dues.transaction;

    const grouped_tx = transactions.reduce((acc, item) => {
        const oweId = item.owe;

        if (!acc[oweId]) {
            acc[oweId] = { owe: oweId, amount: 0 };
        }

        acc[oweId].amount += item.amount;
        
        return acc;
    }, {});

    const result = Object.values(grouped_tx);

    return result
}

app.get('/user/:group/final-status', async(req, res) => {
    try {
        let user = await User.findOne({name : req.body.name});

        let group = await Group.findOne({title : req.params.group});
        let members = group.members;

        members = members.filter(member => member.toString() != user._id.toString());

        let grouped_txs = await grouping(user._id, group._id)

        for(let i = 0; i < grouped_txs.length; i++) {

            let g2_txs = await grouping(grouped_txs[i].owe, group._id)
            
            let f = {amount : 0};

            for(let j = 0; j < g2_txs.length; j++) {
                
                if(g2_txs[j].owe.toString() === user._id.toString()) {
                    
                    f = g2_txs[j];
                    break;
                }
            }

            let t_user1 = await User.findById(grouped_txs[i].owe)
            let t_user2 = await User.findById(f.owe)
            

            if(f.amount > grouped_txs[i].amount) {
                console.log(t_user1.name + ' will give : ' + (f.amount - grouped_txs[i].amount) + ' to ' +  t_user2.name);
            } else if(f.amount < grouped_txs[i].amount) {
                console.log(t_user1.name + ' will take : ' + Math.abs(f.amount - grouped_txs[i].amount) + ' from ' +  t_user2.name);
            } else {
                console.log('no one will give anything to anyone')
            }

        }

        
          
        //console.log(transactions);
        
        res.status(200).json({
            status : 'success',
            message : 'final settelement',
            grouped_txs
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
    console.log("database connected");
})