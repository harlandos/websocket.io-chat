var getUrlParameter = function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;
		
	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');
		
		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

$(function () {
	var socket = io();

	$('form').submit(function(){
		socket.emit('chat message', $('#m').val());
		$('#messages').append($('<li>').text($('#m').val()));
		$('#m').val('');
		userIsTyping = false;
		return false;
	});

	socket.on('chat message', function(msg){
	    $('#messages').append($('<li>').text(msg));
	});

	socket.on('show users', function(users){
		var updatedUserList = '<ul id="userList">' + users + '</ul>'
		$('#userList').replaceWith(updatedUserList);
		userIsTyping = false;
	});
	
	socket.on('user is typing', function(user){
		$('#' + user).removeClass('NotTyping').addClass('typing');
	});
	socket.on('user not typing', function(user){
		$('#' + user).removeClass('typing').addClass('Nottyping');
	});
	
	$('#m').keypress(function() {
		if (!userIsTyping) {
			userIsTyping = true;
			socket.emit('user is typing');
		}
	});
	
	var username = getUrlParameter('username');
	socket.emit('handshake', username);
	
	var userIsTyping = false;
});