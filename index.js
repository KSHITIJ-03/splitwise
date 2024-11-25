const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path")
const bodyParser = require('body-parser');
app.use(express.json())

const User = require('./models/users');
const Group = require('./models/groups');
const balance = require('./models/balance');


const dotenv = require("dotenv")
dotenv.config({path : "./config.env"})


app.get('/', (req, res) => {
    res.send('hello from the slpitwise server!!');
})

app.post('/user', async (req, res) => {
    try {
        const user = await User.create({name, password});
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
        const freshUser = await User.find({name : user});

        newGroup.members.push(freshUser._id);
        freshUser.groups.push(newGroup._id);
        await newGroup.save();
        await freshUser.save();

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
        
        const oldGroup = await Group.find({title});
        const freshUser = await User.find({name : user});

        oldGroup.members.push(freshUser._id);
        freshUser.groups.push(oldGroup._id);
        await oldGroup.save();
        await freshUser.save();

        res.status(201).json({
            status : 'success',
            message : 'group joined',
            user
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