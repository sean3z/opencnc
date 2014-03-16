var net = require('net'), clients = {};

var server = net.createServer(function (socket) {
	socket.name = socket.remoteAddress +':'+ socket.remotePort;
	if (typeof clients[socket.name] == 'undefined') {
		clients[socket.name] = {socket: socket, buffer: ''};
	}

	socket.on('data', function(data) {
		var client = clients[socket.name];
		client.buffer += data.toString('utf8');
		var index = client.buffer.length - 2;
		if (index >= 0 && client.buffer.lastIndexOf('\r\n') === index) {
			console.log(socket.name +' > '+ client.buffer);
			core(client, client.buffer);
			client.buffer = '';
		} 
	});

	socket.on('close', function(had_error) {
		delete clients[socket.name];
	});

	function core(player, data) {
		var data = data.split('\r\n');
		if (data.length > 0) {
			for(var i = 0; i <= data.length - 1; i++) {
				var cmd = data[i].split(' ');
				if (cmd.length > 0 && cmd[0].length > 0) {
					switch(cmd[0].toUpperCase()) {
						case 'LOBCOUNT':
							socket.write(': 610 u 1\r\n');
						break;

						case 'WHERETO': 
							if (cmd.length > 4 && cmd[1].toLowerCase() == 'tibsun' && cmd[2].toLowerCase() == 'tibpass99') {
								switch(parseInt(cmd[3])) {
									case 4608: // TS
									case 4610:
									case 4611:
									case 4615:
									case 7168: // TS: FS
									case 7170:
									case 7171:
									case 7424:
									case 7426:
									case 7427:
									case 7431:
										socket.write(': 605 u :localhost 4001 \'0,1:CnC Server\' -8 36.1083 -115.0582\r\n');
										socket.write(': 608 u :localhost 4006 \'Gameres server\' -8 36.1083 -115.0582\r\n');
										socket.write(': 609 u :localhost 4007 \'Ladder server\' -8 36.1083 -115.0582\r\n');
									break;

									case 8448: // RA2
									case 8450:
									case 8451:
									case 8457:
									case 8458:
									case 8960: // RA2 WDT
									case 8962:
									case 8963:
									case 8969:
									case 8970:
									case 10496: // RA2: YR
									case 10498:
									case 10499:
									case 10505:
									case 10506:
										socket.write(': 605 u :localhost 4002 \'0,1:CnC Server\' -8 36.1083 -115.0582\r\n');
										socket.write(': 605 u :localhost 5000 \'Live chat server\' -8 36.1083 -115.0582\r\n'); // defunct. added strictly for RA2/YR support
										socket.write(': 608 u :localhost 4006 \'Gameres server\' -8 36.1083 -115.0582\r\n');
										socket.write(': 609 u :localhost 4007 \'Ladder server\' -8 36.1083 -115.0582\r\n');
										// socket.write(': 612 u :xwis.net 4321  \'Port Mangler\' -8 36.1083 -115.0582\r\n');
									break;
								}
							}
						break;

						case 'QUIT':
							socket.write(': 607\r\n');
							socket.destroy();
						break;
					}
				}
			}
		}
	} // end function core();
});

server.listen(4005);