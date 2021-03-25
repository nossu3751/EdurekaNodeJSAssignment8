import express from 'express';
import http from 'http';
import redis, { RedisClient } from 'redis';
import mongoose from 'mongoose';
import request from 'request';

const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const connection = mongoose.connection;

const redisClient = redis.createClient({
    host:'localhost',
    port: 6379
});

redisClient.set('noOfVisits', 0);

const InfoRoutes = require('./infoRouter');
app.use('/', InfoRoutes);


app.get('/other', (req,res)=>{
    redisClient.get('otherValue', (err,value)=>{
        if(err)res.send("no value");
        res.send("value is:" + value);
    })
})

mongoose.connect('mongodb://localhost:27017/assignment8',{
    useUnifiedTopology:true,
    useNewUrlParser:true
});

connection.once('open', ()=>{
    console.log("Successfully connected to mongoose db!");
})



app.set('port', 8006);
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', './views');

let server = http.createServer(app).listen(app.get('port'), ()=>{
    console.log("Express server listening on port " + app.get('port'));
});

