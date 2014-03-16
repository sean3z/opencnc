var net = require('net');
var clients = {};

var server = net.createServer(function (socket) {
	socket.name = socket.remoteAddress +':'+ socket.remotePort;
	if (typeof clients[socket.name] == 'undefined') {
		clients[socket.name] = {socket: socket, buffer: ''};
	}

	socket.on('data', function(data) {
		console.log(socket.name +' > '+ data);
		var client = clients[socket.name];
		client.buffer += data.toString('utf8');
		var index = client.buffer.length - 2;
		if (index >= 0) {
			// chat commands end with \r\n, ladder seach ends with \n\n
			if (client.buffer.lastIndexOf('\n\n') === index) {
				core(client, client.buffer);
				client.buffer = '';
			}
		} 
	});
});

server.listen(4007);

function core(user, data) {
	var data = data.split('\r\n');
	if (data.length > 0) {
		for(var i = 0; i <= data.length - 1; i++) {
			var cmd = data[i].split(' ');
			if (cmd.length > 0 && cmd[0].length > 0) {
				switch(cmd[0].toUpperCase()) {
					case 'LISTSEARCH': listsearch(user, cmd); break;
					case 'HIGHSCORE': highscore(user, cmd); break;
					case 'RUNGSEARCH': rungsearch(user, cmd); break;
				}
			}
		}
	}
};

function listsearch(user, cmd) {
	if (cmd.length > 5) {
		var r = ['', ''], cvers = cmd[1];
		if (typeof cmd[6] != 'undefined') {
			var nicks = cmd[6].split(':');
			for(var i = 0; i <= nicks.length - 1; i++) {
				var nick = nicks[i].toLowerCase();
				if (nick.length < 3) continue;
				r.push('NOTFOUND');
			} // ##end nicks for loop
		}
		console.log(user.socket.name +' < '+ r.join('\r\n'));
		user.socket.write(r.join('\r\n'));
		user.socket.destroy();
		delete clients[user.socket.name];
	}
};

function highscore(user, cmd) { }
function rungsearch(user, cmd) { }