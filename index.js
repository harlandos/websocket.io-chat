var env = require('dotenv').config()
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');
const moment = require('moment');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/chat.html');
});

app.get('/main.css', function(req, res){
  res.sendFile(__dirname + '/main.css');
});

app.get('/chat.js', function(req, res){
  res.sendFile(__dirname + '/chat.js');
});

var dict = new Object();

function currentLoggedIn() {
	var activeLoginString = '';

	for (var key in dict) {
		if (dict[key] !== null) {
			activeLoginString += '<li class="NotTyping" id="' + dict[key] + '">' + dict[key] + '</li>';
		}
	}

	return activeLoginString;
}


io.on('connection', function(socket){
    socket.on('handshake', function(username){
	dict[socket.id] = username;
	
	var loggedIn = currentLoggedIn();
	
	console.log('user ' +  username + ' connected');
	io.emit('chat message', "===== " + username + " HAS JOINED THE CHAT. =====");
	io.emit('show users', loggedIn);
    });

    socket.on('disconnect', function () {
        console.log(dict[socket.id] + " disconnected.");
	io.emit('chat message', "===== " + dict[socket.id] + " HAS LEFT THE CHAT. =====");
	dict[socket.id] = null;
	var loggedIn = currentLoggedIn();
	io.emit('show users', loggedIn);
    });

    socket.on('chat message', function(msg){
	var messageTime = moment().format('MMMM Do YYYY, h:mm:ss a');
	var messagePost = messageTime + " === " + dict[socket.id] + " ::: " + msg;
	console.log('message: ' + messagePost );
	socket.broadcast.emit('chat message', messagePost);
	socket.broadcast.emit('user not typing', dict[socket.id]);
    });

    socket.on('user is typing', function(){
	console.log(dict[socket.id] + " is typing");
	socket.broadcast.emit('user is typing', dict[socket.id]);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});