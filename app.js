const express = require("express");
const app = express();
const mongodb = require('mongodb');
const bcrypt = require('bcrypt');

const path = require("path");
const url = require("url");

const port = 8080;

app.engine('pug', require('pug').__express)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "static")));

// parse urlencoded request bodies into req.body
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, function() {
    console.log("Listening to " + port);
});

app.get(/^(?!\/api\/)/, function(req, res) {
    let purl = url.parse(req.url, true);
    let pa = path.join(req.url, "index");
    pa = pa.substring(1, pa.length);
    res.render(pa, purl.query);
});

app.get('/api/users', function(req, res) {
    let MongoClient = mongodb.MongoClient;
    let url = 'mongodb://localhost:27017/';

    MongoClient.connect(url, function(err, database) {
        if(err) {
            console.err('Error connecting to database!', err);
        } else {
            console.log('Connected to database');
            let db = database.db('rogerestevedb')
            let users = db.collection('users');
            users.find({}).toArray(function(err, result) {
                if(err) {
                    res.send(err);
                } else if(result.length > 0) {
                    res.send(result);
                } else {
                    res.send('No users found!');
                }
            });
        }
        database.close();
    });
});

app.post('/api/login', function(req, res) {
    let MongoClient = mongodb.MongoClient;
    let url = 'mongodb://localhost:27017/';

    MongoClient.connect(url, function(err, database) {
        if(err) {
            console.err('Error connecting to database!', err);
        } else {
            console.log('Connected to database');
            let db = database.db('rogerestevedb')
            let users = db.collection('users');
            users.find({username:req.body.username}).toArray(function(err, result) {
                if(err) {
                    res.send('User or password do not match! Try again.');
                } else {
                    console.log(result);
                    if(bcrypt.compareSync(req.body.pass, result[0].pass)) {
                        res.send('Logged in successfully!');
                    }
                }
            });
        }
        database.close();
    });
});

app.post('/api/adduser', function(req, res) {
    let MongoClient = mongodb.MongoClient;
    let url = 'mongodb://localhost:27017/';

    MongoClient.connect(url, function(err, database) {
        if(err) {
            console.err('Error connecting to database!', err);
        } else {
            console.log('Connected to database');
            let db = database.db('rogerestevedb')
            let users = db.collection('users');
            let newuser = {username: req.body.username, pass: req.body.pass};
            newuser.pass = bcrypt.hashSync(newuser.pass, 10);
            console.log(newuser);
            users.insertOne(newuser, function(err, result) {
                if(err) {
                    res.send('Could not create user.');
                } else {
                    res.send('New user created!');
                }
            });
        }
        database.close();
    });
});

app.post('/api/users/clear', function(req, res) {
    let MongoClient = mongodb.MongoClient;
    let url = 'mongodb://localhost:27017/';

    MongoClient.connect(url, function(err, database) {
        if(err) {
            console.err('Error connecting to database!', err);
        } else {
            console.log('Connected to database');
            let db = database.db('rogerestevedb')
            let users = db.collection('users');
            users.deleteOne({username: null}, function(err, result) {
                if(err) {
                    res.send(err);
                } else {
                    res.send('Cleared rubbush users.');
                }
            });
        }
        database.close();
    });
});