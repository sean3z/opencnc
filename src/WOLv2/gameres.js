var net = require('net'), clients = {};

var server = net.createServer(function (socket) {
	socket.name = socket.remoteAddress +':'+ socket.remotePort;
	if (typeof clients[socket.name] == 'undefined') {
		clients[socket.name] = {socket: socket, buffer: ''};
	}

	console.log('socket', socket.name);

	socket.on('data', function(data) {
		console.log('data', data);
		var client = clients[socket.name];
		client.buffer += data;
		if (data.toString().indexOf("\r\n") >= 0) {
			core(client, client.buffer);
			client.buffer = '';
		} 
	});

	function core(client, data) {
		console.log(client.socket.name +' > '+ data);
	}

});

server.listen(4006);