const http = require("http")
const express = require('express')
const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const bodyparser = require("body-parser")
const sharedsession = require("express-socket.io-session")
const fs = require('fs')
const ejs = require('ejs')
const session = require('express-session')	// session module
const mysql = require('mysql')
const path = require('path')

// var connection = mysql.createConnection({
// 	host: "localhost",
// 	user: "root",
// 	password: "",
// 	database: "atp12a"
// });

app.use(bodyparser.urlencoded({ 'extended': 'true' }))	// you should write this
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs')
app.use(session({
	'secret': 'session',
	'resave': 'true',
	'saveUninitialized': 'true'
}))
/*
//	use with mysql 
var pool = mysql.createPool({
	connectionLimit: 100,
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'atp12a',
	debug: false
});
*/

app.use(express.static(__dirname + '/public'));

username = null

// app.get('*', function (req, res) {
// 	res.render('maintenance')
// })

app.get('/', function (req, res) {	// home redirects
	if (req.session.username) {
		res.redirect('/chat')
	}
	else {
		res.redirect('/login')
	}
	if (req.session.loginstatus == "false") { // wrong login
		//		console.log('req.session.loginstatus: false')
		res.write('username or password wrong');
		req.session.loginstatus = "";
		res.end()
	}
})


app.route('/login')
	.get((req, res) => {	// if /submit is sent with get
		if (req.session.username) {
			res.redirect('/chat')
		}
		else {
			res.render('index')
		}
	})
	.post((req, res) => {
		if (req.session.username) {
			res.redirect('/chat')
		}
		else if (req.body.username) {
			req.session.username = req.body.username;
			req.session.userpass = req.body.userpass;
			username = req.session.username
			res.redirect('/chat')
		}
		else {
			res.render('index', { message: 'Bir isim yazmalısın.' })
		}

		/*
			//	use with mysql
			var sql = "SELECT * FROM `admins` WHERE `adminname` = '" + `${username}` + "' AND `adminpass` = '" + `${userpass}` + "'";
			connection.query(sql, function (err, result, fields) {
				try {
					var row = result.length;
					//			console.log('row:'+row)
				} catch (error) {
					//			console.log('catch: -' + error)
				}
				if (row > 0) {
					if (req.body) {
						req.session.username = username;
						req.session.userpass = userpass;
						myvar = req.session.username; //
						req.session.loginstatus = "true";
						//			console.log('login-status: 1')
						res.redirect('/chat')
						res.end()
					} else {
						req.session.loginstatus = "false";
						//			console.log('login-status: 0')
						res.redirect('/')
					}
				}
			})
		*/
	})


app.get('/chat', function (req, res) {
	if (req.session.username) {
		username = req.session.username
		res.render('chat', { username })
	}
	else {
		res.redirect('/login')
	}
})


// /logout
app.get('/logout', function (req, res) {
	delete req.session.username
	username = null
	//	req.session.destroy() // deletes all sessions
	delete req.session.userpass
	//	console.log('session deleted')
	res.redirect('/')
})
var connectedguys = new Array();
/*  This is auto initiated event when Client connects to Your Machien.  */
io.on('connection', function (socket) {

	console.log(username + ' is connected');
	socket.on('me', function (status) {

		var text = status.text;
		var user = username;
		//		var user = status.user;
		if (username) {
			io.emit('refresh feed', { text, user });
		}
		else {
			io.emit('not logged');
		}
		/* 
		//	use with mysql 
		add_status({ text, user }, function (res) {
			if (res) {
				io.emit('refresh feed', { text, user });
	
			} else {
				io.emit('error');
			}
		});
		*/
	});
	socket.on('disconnect', function () { // when user disconnect
		console.log(username + ' is disconnected');
	})

});


app.use(function (req, res) {
	res.render('404')
})

const port = process.env.PORT || 80;
if (port == null || port == "") {
	port = 80;
}
server.listen(port);
console.log('Server working at http://localhost:' + port)



/*
//	use with mysql
var add_status = function (status, callback) {
	pool.getConnection(function (err, connection) {
		if (err) {
			callback(false);
			return;
		}
		var sql = "INSERT INTO `fbstatus` (`s_user`, `s_text`) VALUES ('" + `${myvar}` + "','" + `${status.text}` + "')";
		//    var sql = "Select* from admins";
		connection.query(sql, function (err, result, rows) {
			connection.release();
			//	console.log(result)
			if (!err) {
				callback(true);
			}
		});
		connection.on('error', function (err) {
			callback(false);
			return;
		});
	});
}
*/