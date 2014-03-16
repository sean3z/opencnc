var net = require('net');
var chat = require('./lib/commands.js'), user = require('./lib/user.js'), channel = require('./lib/channel.js');
var clients = {}, channels = {}, users = {}, motds = {};

var gameId = (function(id) {
	return {	inc: function () { return ++id; }, id: function () { return id; }, set: function (x) { id = x; } };
})(1);

// red alert 2
channels['#Lob_33_0'] = new channel({name: '#Lob_33_0', lobby: true, gsku: 33, password: 'zotclot9'});
channels['#Lob_33_1'] = new channel({name: '#Lob_33_1', lobby: true, gsku: 33, password: 'zotclot9'});
channels['#Lob_33_2'] = new channel({name: '#Lob_33_2', lobby: true, gsku: 33, password: 'zotclot9'});
channels['#Lob_35_0'] = new channel({name: '#Lob_35_0', lobby: true, gsku: 33, password: 'zotclot9'});
channels['#Lob_38_0'] = new channel({name: '#Lob_38_0', lobby: true, gsku: 33, password: 'zotclot9'});
// yuri's revenge
channels['#Lob_41_0'] = new channel({name: '#Lob_41_0', lobby: true, gsku: 41, password: 'zotclot9'});
channels['#Lob_41_1'] = new channel({name: '#Lob_41_1', lobby: true, gsku: 41, password: 'zotclot9'});
channels['#Lob_41_2'] = new channel({name: '#Lob_41_2', lobby: true, gsku: 41, password: 'zotclot9'});

var server = net.createServer(function (socket) {
	socket.name = socket.remoteAddress +':'+ socket.remotePort;
	if (typeof clients[socket.name] == 'undefined') {
		clients[socket.name] = new user({socket: socket});
	}

	socket.on('data', function(data) {
		console.log(socket.name +' > '+ data);
		var client = clients[socket.name];
		client.queue(data.toString('utf8'));
		var index = client.buffer.length - 2;
		if (index >= 0) {
			if (client.buffer.lastIndexOf('\r\n') === index) {
				core(client, client.buffer);
				client.flush();
			}
		} 
	});

	socket.on('close', function(had_error) {
		var player = clients[socket.name], cmd = ['PART', player.channel];
		if (player.channel != null) chat.part(player, cmd, channels[player.channel], channels);
		delete users[player.nick];
		delete clients[socket.name];
		console.log('client died. error: '+ had_error.toString());
	});

	socket.on('error', function(){
		console.log('cliend died. error: true');
	});

});

server.listen(4002);

function core(player, data) {
	var data = data.split('\r\n');
	if (data.length > 0) {
		for(var i = 0; i <= data.length - 1; i++) {
			var cmd = data[i].split(' ');
			if (cmd.length > 0 && cmd[0].length > 0) {
				switch(cmd[0].toUpperCase()) {
					case 'CVERS': chat.cvers(player, cmd); break;
					case 'PASS': chat.pass(player, cmd); break;
					case 'NICK': chat.nick(player, cmd); break;
					case 'APGAR': chat.apgar(player, cmd, users); break;
					case 'SERIAL': chat.serial(player, cmd); break;
					case 'USER': chat.user(player, cmd, motds); break;
					case 'VERCHK': chat.verchk(player, cmd); break;
					case 'SETOPT': chat.setopt(player, cmd); break;
					case 'SETCODEPAGE': chat.setcodepage(player, cmd); break;
					case 'SETLOCALE': chat.setlocale(player, cmd); break;
					case 'SQUADINFO': chat.squadinfo(player, cmd); break;
					case 'GETLOCALE': chat.getlocale(player, cmd); break;
					case 'GETCODEPAGE': chat.getcodepage(player, cmd); break;
					case 'LIST': chat.list(player, cmd, channels); break;
					case 'JOIN': chat.joinlobby(player, cmd, channels[cmd[1]]); break;
					case 'PART': chat.part(player, cmd, channels[cmd[1]], channels); break;
					case 'TOPIC': chat.topic(player, cmd, channels[cmd[1]]); break;
					case 'STARTG': chat.startg(player, cmd, channels[cmd[1]], http, gameId); break;
					case 'GAMEOPT': chat.gameopt(player, cmd, channels[cmd[1]], channels); break;
					case 'PRIVMSG': chat.privmsg(player, cmd, channels[cmd[1]], channels[player.channel]); break;
					case 'PAGE': chat.page(player, cmd); break;
					case 'KICK': chat.kick(player, cmd, channels[cmd[1]]); break;
					case 'MODE': chat.mode(player, cmd, channels[cmd[1]]); break;
					case 'JOINGAME': chat.joingame(player, cmd, channels, channel); break;
					case 'FINDUSEREX': chat.finduserex(player, cmd); break;
					case 'QUIT': chat.quit(player, cmd); break;
					case 'GETBUDDY': chat.getbuddy(player, cmd); break;
					case 'ADDBUDDY': chat.getbuddy(player, cmd); break;
					case 'DELBUDDY': chat.getbuddy(player, cmd); break;
					case 'TUNNEL': chat.tunnel(player, cmd); break;
					default:
						console.log('unknown cmd: '+ cmd.join(' '));
				}
			}
		}
	}
}; // end function core()