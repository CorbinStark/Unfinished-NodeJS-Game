//requirements
var express = require('express');
var session = require('express-session');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var mysql = require('mysql');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var formidable = require('formidable');
var http = require('http');

//game vars
var players = {};
var tokens = {};

app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'noOneWillGuessThis',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/login.html');
});

//socket connections
io.on('connection', function(socket) {
    console.log('a user connected');

    players[socket.id] = {
        playerId: socket.id,
    };
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', function() {
        console.log('a user disconnected');

        io.emit('disconnect', socket.id);
        delete players[socket.id];
    });
});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});
app.listen(8080);

//database mySql
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "game"
});

con.connect(function(err) {
    if(err) throw err;

    var query = "SELECT * FROM users";
    con.query(query, function(err, result, fields) {
        if(err) throw err;
        console.log(result);
    });
});

//handle login POST request from form
app.post('/login', function(req, res) {
    var user = req.body.username;
    var pass = req.body.password;
    if(user && pass) {
        con.query('SELECT * FROM users WHERE username = ?', [user], function(err, results, fields) {
            if(results.length > 0 && bcrypt.compareSync(pass, results[0].Password)) {
                req.session.loggedin = true;
                req.session.username = user;
                res.redirect('/game');
            } else {
                res.send('Username/Password was incorrect');
            }
            res.end();
        });
    } else {
        res.send('Please enter your Username and Password');
        res.end();
    }
});

//handle create new account POST request
app.post('/register', function(req, res) {
    var user = req.body.username;
    var pass = req.body.password;
    var pass2 = req.body.passConfirm;
    if(pass === pass2) {
        if(user && pass && pass2) {
            insert_if_unique(req, res, user, pass);
        } else {
            res.send('Please fill out all forms');
            res.end();
        }
    } else {
        res.send('Passwords do not match');
        res.end();
    }
});

function insert_if_unique(req, res, user, pass) {
    con.query('SELECT * FROM users WHERE username = ?', [user], function(err, results, fields) {
        var unique = true;

        if(err) {
            throw err;
            unique = false;
        }
        if(results.length > 0) {
            unique = false;
        }

        if(unique) {
            let hash = bcrypt.hashSync(pass, 10);
            var records = [
                [user, hash]
            ];
            con.query('INSERT INTO users (username, password) VALUES ?', [records], function(err, result, fields) {
                if(err) throw err;
                res.redirect('login.html');
            });
        } else {
            res.send('Username already taken. Try a different one');
            res.end();
        }
    });
}

app.get('/game', function(req, res) {
    if(req.session.loggedin) {
        res.sendFile('game.html', {root: __dirname });
    } else {
        res.send('Please login to view this page');
		 res.end();
    }

});
