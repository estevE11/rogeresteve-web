const express = require("express");
const app = express();
const session = require('express-session');
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectID;
const bcrypt = require('bcrypt');
const request = require('request');

const path = require("path");
const url = require("url");

const port = process.argv[2] || 8080;

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

app.use(session({
    secret: 'stfu',
    resave: false,
    saveUninitialized: true
}));

app.get("/", function(req, res) {
    console.log(req.url);
    let _url = req.url;
    if(req.session && req.session.userId) {
        _url = '/games';

    }
    let purl = url.parse(_url, true);
    let pa = path.join(_url, "index");
    pa = pa.substring(1, pa.length);
    res.render(pa, purl.query);
});

app.get(/^(?!\/api\/)/, mid_requires_login, function(req, res) {
    let purl = url.parse(req.url, true);
    let pa = path.join(req.url, "index");
    pa = pa.substring(1, pa.length);
    let user_data = req.session.user_data;
    delete user_data["pass"];
    console.log('On get :D');
    console.log(user_data);
    res.render(pa, {user_data: user_data});
});


app.get('/api/users/', function(req, res) {
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
                    res.send('Are you searching for our database? Its not your lucky day then.');
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
                        req.session.userId = result[0]._id;
                        req.session.user_data = result[0];
                        res.redirect('/games');
                    } else {
                        res.send('User or password do not match! Try again.');
                    }
                }
            });
        }
        database.close();
    });
});

app.post('/api/logout', mid_requires_login, function(req, res, next) {
    req.session.destroy(function(err) {
        if(err) {
            return next(err);
        }
        res.redirect('/');
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
            db.collection('users').deleteOne({username: null}, function(err, result) {
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


app.get('/api/games/laderboards/:game', function(req, res) {
    let MongoClient = mongodb.MongoClient;
    let url = 'mongodb://localhost:27017/';

    let game = req.params.game;

    MongoClient.connect(url, function(err, database) {
        if(err) {
            console.err('Error connecting to database!', err);
        } else {
            console.log('Connected to database');
            let db = database.db('rogerestevedb')
            db.collection('laderboards').find({name: game}).toArray(function(err, result) {
                if(err) {
                    res.send(err);
                } else if(result.length > 0) {
                    res.send(result[0].ranking);
                } else {
                    res.send('No users found!');
                }
            });
        }
        database.close();
    });
});

app.post('/api/games/hiscore/:game', mid_requires_login, function(req, res) {
    let MongoClient = mongodb.MongoClient;
    let url = 'mongodb://localhost:27017/';

    let to_update;
    let game = req.params.game;
    switch(game) {
        case "tetris":
            to_update = {$set: {tetris: req.body.score}};
            break;
        case "minesweeper":
            to_update = {$set: {minesweeper: req.body.score}};
            break;
        default:
            console.err('Error! Not valid game.');
            return;
            break;
    }


    MongoClient.connect(url, function(err, database) {
        if(err) {
            console.err('Error connecting to database!', err);
        } else {
            console.log('Connected to database');
            let db = database.db('rogerestevedb')
            db.collection('users').updateOne({_id: ObjectId(req.body.user_id)}, to_update);
            db.collection('users').find({_id: ObjectId(req.body.user_id)}).toArray(function(err, result) {
                if(err) console.log('caca');
                else {
                    let new_user_data = result[0];
                    delete new_user_data["pass"];
                    req.session.user_data = new_user_data;
                    res.send('Session updated correctly.');
                }
            });
            /*let ranking = [];
            db.collection('laderboards').find({name: game}).toArray(function(err, result) {
                console.log(result);
                ranking = result[0].ranking;
            });
            ranking.push(req.body.score);
            ranking = bubbleSort(ranking);
            console.log(ranking);
            db.collection('laderboards').updateOne({name: game}, {ranking: ranking});*/
        }
        database.close();
    });
});

function mid_requires_login(req, res, next) {
    if(req.session && req.session.userId) {
        return next(); 
    } else {
        let err = new Error("You must be logged in to view this page");
        err.status = 401;
        res.redirect('/');
        return next(err);
    }
}

function bubbleSort(list)
{
    let swapped
    let n = list.length-1
    do {
        swapped = false
        for (let i=0; i < n; i++)
        {
            // compare pairs of elements
            // if left element > right element, swap
            if (list[i] > list[i+1])
            {
               const temp = list[i]
               list[i] = list[i+1]
               list[i+1] = temp
               swapped = true
            }
        }
    } 
  // continue swapping until sorted
  while (swapped) 

  return list
}
