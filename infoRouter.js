const express = require('express');
const router = express.Router();
const cors = require('cors');
var info = require('./info.model');

import fetch from 'node-fetch';
import http from 'http';
import redis from 'redis';

const redisClient = redis.createClient({
    host:'localhost',
    port: 6379
});

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(__dirname+'/public'));

var corsOption={
    origin:'*',
    optionsSuccessStatus:200
}

router.use((req,res,next)=>{
    console.log("Time", Date.now());
    next();
})

// router.get('/', (res,res)=>{
//     res.send("This is country search app.");
// })

router.post('/api/countries', cors(corsOption), (req,res)=>{
    info.create(req.body, (err,data)=>{
        if(err){
            throw err;
        }else{
            info.findOne(req.body).then((resolve)=>{
                res.json(resolve);
            })
        }
    })
})

router.get('/', cors(corsOption), (req,res)=>{
    res.render('country',{});
})

router.post('/searchCountry', cors(corsOption), (req,res)=>{
    let search = req.body;
    res.redirect('/' + search.country);
})

router.get('/:country', cors(corsOption), (req,res)=>{
    let country = req.params["country"].toLowerCase();
    redisClient.get(country, (err,value)=>{
        if(err){
            res.send("Couldn't connect to redis!")
        }else{
            if(value == null){
                info.findOne({"title":country}, (err,data)=>{
                    if(err){
                        res.send("Couldn't connect to DB!");
                    }else{
                        if(data == null || data === undefined){
                            fetch("https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=" + country).then(
                                response => response.json()).then(countryInfo => {
                                    console.log(countryInfo);
                                    let document = countryInfo.parse;
                                    let currInfo = {
                                        title: document.title.toLowerCase(),
                                        pageid: document.pageid,
                                        revid: document.revid,
                                        text: document.text["*"]
                                    }

                                    fetch("http://localhost:8006/api/countries",{
                                        method: 'POST',
                                        body: JSON.stringify(currInfo),
                                        headers: {'Content-Type': 'application/json'}
                                    }).then(res => res.json()).then((json)=>{
                                        console.log("Posted!");
                                        redisClient.set(country, JSON.stringify(currInfo));
                                        res.send("<h1> Rhosung Country Search </h1><br><br>" + currInfo.text);
                                    })
                                })
                        }else{
                            res.send("<h1> Rhosung Country Search </h1><br><br>" + data.text);
                        }
                    }
                })
            }else{
                let cachedInfo = JSON.parse(value);
                res.send("<h1> Rhosung Country Search </h1><br><br>" + cachedInfo.text);
            }
        }
        
    })
})


module.exports = router;

