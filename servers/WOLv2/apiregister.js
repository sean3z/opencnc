var net = require('net'), registrant = require('./lib/registrant.js');
var clients = {};

var server = net.createServer(function (socket) {
	socket.name = socket.remoteAddress +':'+ socket.remotePort;
	if (typeof clients[socket.name] == 'undefined') {
		clients[socket.name] = new registrant({socket: socket, buffer: ''});
	}

	socket.on('close', function(had_error) {
		delete clients[socket.name];
		console.log('client died. error: '+ had_error.toString());
	});

	socket.on('data', function(data) {
		var client = clients[socket.name];
		client.buffer += data.toString('utf8');
		var index = client.buffer.length - 5;
		if (index >= 0) {
			if (client.buffer.lastIndexOf('END\r\n') === index) {
				core(client, client.buffer);
				client.buffer = '';
			}
		} 
	});
});

server.listen(5400);

function core(client, data) {
	console.log(client.socket.name +' > '+ data);
	var data = data.split('\r\n');
	if (data.length > 0) {
		for(var i = 0; i <= data.length - 1; i++) {
			var cmd = data[i].split('=');
			if (cmd.length > 0 && cmd[0].length > 0) {
				switch(cmd[0].toUpperCase()) {
					case 'EMAIL': client.email = cmd[1]; break;
					case 'BMONTH': client.dob.month = cmd[1]; break;
					case 'BDAY': client.dob.day = parseInt(cmd[1]); break;
					case 'BYEAR': client.dob.year = parseInt(cmd[1]); break;
					case 'LANGCODE': client.langcode = parseInt(cmd[1]); break;
					case 'SKU': client.sku = cleanInput(cmd[1].split(',')); break;
					case 'VER': client.ver = cleanInput(cmd[1].split(',')); break;
					case 'SERIAL': client.serial = cleanInput(cmd[1].split(',')); break;
					case 'SYSID': client.sysid = cmd[1].toUpperCase(); break;
					case 'SYSCHECK': client.syscheck = cmd[1]; break;
					case 'OLDNICK': client.nicks.old = cleanInput(cmd[1].split(',')); break;
					case 'OLDPASS': client.pass.old = cleanInput(cmd[1].split(',')); break;
					case 'NEWNICK': client.nicks['new'] = cmd[1]; break;
					case 'NEWPASS': client.pass['new'].push(cmd[1]); break;
					case 'NEWPASS2': client.pass['new'].push(cmd[1]); break;
					case 'NEWSLETTER': client.newsletter = parseInt(cmd[1]); break;
					case 'SHAREINFO': client.shareinfo = parseInt(cmd[1]); break;
					case 'REQUEST': client.request = cmd[1]; break;
					case 'END': processRequest(client); break;
				}
			}
		}
	}
};

function processRequest(client) {
	switch(client.request) {
		case 'apireg_getnick':
		/*
			// TODO: need to do something with newletter and old nick & pass information
			var params = [client.getNick(), client.getPass(), client.apgar(client.getPass()), client.email, client.getSku(), client.getSerial(), client.getSysId()];
			db.query('CALL spInsertUser(?, ?, ?, ?, ?, ?, ?)', params, function(error, rows, fields) {
				client.write('HRESULT='+ rows[0][0].code +'\nMessage='+ rows[0][0].message +'\nNewNick='+ client.getNick() +'\nNewPass='+ client.getPass() +'\nAge='+ client.getAge() +'\nConsent='+ client.shareinfo +'\nEND\r');
				client.destroy();
			});
		*/
		break;

		case 'apireg_ageverify':
			client.write('HRESULT=0\nAge='+ client.getAge() +'\nEND\r');
			client.destroy();
		break;
	}
};

function cleanInput(input) {
	// removing empty strings and such
	switch(typeof input) {
		case 'object':
			return input.filter(function(n){return n});
		break;

		case 'string':
			return input.trim();
		break;
	}
};