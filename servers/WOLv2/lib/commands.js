/*jshint forin:false, noarg:true, noempty:true, eqeqeq:false, bitwise:true, undef:true, unused:true, curly:true, browser:true, devel:true, node:true, indent:false, maxerr:50 */

exports.cvers = function (user, cmd) {
	if (cmd.length > 2) {
		user.cvers = parseInt(cmd[2]);
	}
};

exports.pass = function (user, cmd) {
	if (cmd.length > 1) {
		if (cmd[1] != 'supersecret') user.destroy();
	}
};

exports.nick = function (user, cmd) {
	user.nick = cmd[1];
	// console.log(user);
};

exports.apgar = function (user, cmd, users) {
	if (!user.login(cmd[1])) {
		// deny access to server
		user.write('ERROR :closing link: (Password needed for that nickname.)');
		user.destroy();
	} else {
		// successful login
		if (user.cvers != null) {
			// if (typeof users[user.cvers] == 'undefined') users[user.cvers] = {};
			users[user.nick.toLowerCase()] = user.socket.name;
		}
	}
};

exports.serial = function (user, cmd) {
	if (user.isLoggedIn && cmd.length > 1) {
		user.serial = parseInt(cmd[1]);
		// if serial availble, use to track player
	}
};

exports.user = function (user, cmd, motds) {
	// if verified send MOTD
	if (user.isLoggedIn && cmd.length > 1) {
		var motd = [': 375 u :- Welcome to C&C Online!'];
		motd.push(': 372 u :- -', ': 376 u');
		user.write(motd.join('\r\n'));
	}
};

exports.verchk = function (user, cmd) {
	if (user.isLoggedIn && cmd.length > 1) {
		// we're never publishing an update, so notify client
		user.write(': 379 u :none none none 1 '+ cmd[1] +' NONREQ');
	}
};

exports.setopt = function (user, cmd) {
	if (user.isLoggedIn && cmd.length > 1) {
		var options = cmd[1].split(',');
		if (options.length > 1) {
			user.options.find = ((parseInt(options[0]) == 17) ? true : false);
			user.options.page = ((parseInt(options[1]) == 33) ? true : false);
		}
	}
};

exports.setcodepage = function(user, cmd) {
	if (user.isLoggedIn && cmd.length > 1) {
		user.options.codepage = parseInt(cmd[1]);
		user.write(': 329 u '+ cmd[1]);
	}
};

exports.setlocale = function(user, cmd) {
	if (user.isLoggedIn && cmd.length > 1) {
		user.options.locale = parseInt(cmd[1]);
		user.write(': 310 u '+ cmd[1]);
	}
};

exports.getlocale = function(user, cmd) {
	if (user.isLoggedIn && cmd.length > 1) {
		// can't complete until we have a method to get user object by game nick
		// sending fake getlocale for now, since no resoponse apparently lags the game client
		var nicks = cmd.splice(1, cmd.length-1), reply = [];
		for(var i in nicks) {
			reply.push(nicks[i] +'`1');
		}
		user.write(': 309 u '+ reply.join('`'));
	}
};

exports.getcodepage = function(user, cmd) {
	if (user.isLoggedIn && cmd.length > 1) {
		// can't complete until we have a method to get user object by game nick
		// sending fake codepage for now, since no response apparently lags the game client
		var nicks = cmd.splice(1, cmd.length-1), reply = [];
		for(var i in nicks) {
			reply.push(nicks[i] +'`1252');
		}
		user.write(': 328 u '+ reply.join('`'));
	}
};

exports.squadinfo = function(user, cmd) {
	if (user.isLoggedIn && cmd.length > 1) {
		user.write(': 439'); // no squads atm
	}
};

exports.list = function(user, cmd, channels) {
	if (user.isLoggedIn && cmd.length > 1) {
		user.write(': 321 u:');
		for(var i in channels) {
			var channel = channels[i];
			switch(cmd[1]) {
				case '0':
					if (channel.lobby == true && channel.gsku == parseInt(cmd[2])) {
						user.write(': 327 u '+ channel.name +' '+ channel.users.length +' 0 388');
					}
				break;

				default:
					if (channel.lobby == false && channel.gsku == parseInt(cmd[2]) && channel.gameStarted == false) {
						var string = [
							channel.name, 
							channel.users.length, 
							0, 
							channel.gsku,
							(channel.tournament == true) ? 1 : 0,
							channel.flag,
							channel.host.longIp(),
							((channel.password != null) ? 384 : 128) +':'+ channel.topic
						];
						user.write(': 326 u '+ string.join(' '));
					}
			}
		}
		user.write(': 323 u:');
	}
};

exports.joinlobby = function(user, cmd, channel) {
	// all lobbies have passwords
	if (user.isLoggedIn && cmd.length > 2 && typeof channel != 'undefined') {
		if (channel.password != null && typeof cmd[2] != 'undefined' && channel.password == cmd[2]) {
			if (user.channel == null) {
				channel.users.push(user);
				user.channel = channel.name;
				channel.broadcast(user, ':'+ user.nick +'!u@h JOIN :'+ user.clan.clanId +',0 '+ channel.name, true);
				var write = [];
				write.push(': 353 u * '+ channel.name +' :'+ channel.names());
				write.push(': 366 u '+ channel.name +' :');
				user.write(write.join('\r\n'));
			}
		}
	}
};

exports.joingame = function(user, cmd, channels, channel) {
	if (user.isLoggedIn && cmd.length > 2) {
		var target = channels[cmd[1]], chan, write = [];
		switch(typeof target) {
			case 'undefined':
				// creating channel
				if (cmd.length > 8 && user.channel == null) {
					var params = {
						name: cmd[1], 
						// cmd[2]: 1 (always 1?)
						host: user, 
						maxUsers: parseInt(cmd[3]), 
						gsku: parseInt(cmd[4]),
						// cmd[5]: 3 (always 3?)
						// cmd[6]: 1 (always 1?)
						tournament: ((parseInt(cmd[7]) == 1) ? true : false), 
						flag: parseInt(cmd[8]),
						password: ((typeof cmd[9] != 'undefined' && cmd[9].length > 0) ? cmd[9] : null)
					};

					chan = channels[params.name] = new channel(params);
					user.channel = chan.name;
					chan.users.push(user);
					write.push(':'+ user.nick +'!u@h JOINGAME 1 '+ chan.maxUsers +' '+ chan.gsku +' 1 '+ user.clan.clanId +' '+ user.longIp() +' 0 :'+ chan.name);
					write.push(': 332 u '+ chan.name +' :'+ chan.topic);
					write.push(': 353 u = '+ chan.name +' :'+ chan.names());
					write.push(': 366 u '+ chan.name +' :');
					user.write(write.join('\r\n'));
				}
			break;

			default:
				// joining existing channel
				if (target.password != null && typeof cmd[3] != 'undefined') {
					if (target.password != cmd[3]) {
						user.write(': 475 u '+ target.name); // bad password
					}

				} else if (target.users.length >= target.maxUsers) {
					user.write(': 471 u '+ target.name); // channel full

				} else if (target.users.length < 1 || target.gameStarted == true) {
					user.write(': 478 u '+ target.name); // channel closed

				} else if (target.bans.indexOf(user.nick) >= 0) {
					user.write(': 474 u '+ target.name); // user banned

				} else {
					// all clear, user can join
					target.users.push(user);
					user.channel = target.name;
					target.broadcast(user, ':'+ user.nick +'!u@h JOINGAME 1 '+ target.users.length +' '+ target.gsku +' 1 '+ user.clan.clanId +' '+ user.longIp() +' 0 :'+ target.name, true);
					write.push(': 332 u '+ target.name +' '+ target.topic);
					write.push(': 353 u = '+ target.name +' :'+ target.names());
					write.push(': 366 u '+ target.name +' :');
					user.write(write.join('\r\n'));
				}
		}
	}
};

exports.privmsg = function(user, cmd, channel, userChannel) {
	// TODO: support backslash commands
	if (user.isLoggedIn && cmd.length > 2) {
		var msg = cmd.splice(2).join(' ');
		if (typeof channel != 'undefined') { // messaging channel
			var index = channel.users.indexOf(user);
			if (index >= 0 && msg.length > 0) {
				channel.broadcast(user, ':'+ user.nick +'!u@h PRIVMSG '+ channel.name +' '+  msg, false);
			}
		} else {
			// messaging player or players
			var nicks = cmd[1].split(','), indexes = userChannel.multipop(nicks);
			for(var i = 0; i <= indexes.length - 1; i++) {
				var index = indexes[i], player = userChannel.users[index];
				player.write(user, ':'+ user.nick +'!u@h PRIVMSG '+ player.nick +' '+ msg, false);
			}
		}
	}
};

exports.part = function(user, cmd, channel, channels) {
	if (user.isLoggedIn && cmd.length > 1 && typeof channel != 'undefined') {
		var index = channel.users.indexOf(user);
		if (index >= 0) {
			channel.broadcast(user, ':'+ user.nick +'!u@h PART '+ channel.name, true);
			channel.users.splice(index, 1);
			user.channel = null;

			// if host parts channel, boot users and destroy channel
			if (channel.lobby == false && user.nick == channel.host.nick && channel.gameStarted == false) {
				for(var i = 0; i <= channel.users.length - 1; i++) {
					var player = channel.users[i];
					player.channel = null;
					player.write(':'+ player.nick +'!u@h PART '+ channel.name);
					delete channel.users[i];
				}
				delete channels[channel.name];
			}

			// this should only be hit when gameStarted == true
			if (channel.lobby == false && channel.users.length < 1) {
				delete channels[channel.name];
			}
		}
	}
};

exports.page = function(user, cmd) {
	if (user.isLoggedIn && cmd.length > 2) {
		// check if target.options.page == true
		// can't complete until we have a method to get user object by game nick
	}
};

exports.topic = function(user, cmd, channel) {
	if (user.isLoggedIn && cmd.length > 2 && typeof channel != 'undefined') {
		if (channel.lobby == false && channel.host.nick == user.nick) {
			channel.topic = cmd[2];
			channel.broadcast(user, ': 332 u '+ channel.name +' '+ channel.topic, false);
		}
	}
};

exports.kick = function(user, cmd, channel) {
	if (user.isLoggedIn && cmd.length > 2 && typeof channel != 'undefined') {
		if (channel.lobby == false && channel.host.nick == user.nick) {
			var index = channel.pop(cmd[2]), target = channel.users[index]; // kicked player
			if (typeof target != 'undefined') {
				var string = ':'+ user.nick + '!u@h KICK '+ channel.name +' '+ target.nick +' :'+ user.nick;
				channel.broadcast(user, string, true);
				target.channel = null;
				delete channel.users[index];
			}
		}
	}
};

exports.mode = function(user, cmd, channel) {
	if (user.isLoggedIn && cmd.length > 2 && typeof channel != 'undefined') {
		if (channel.lobby == false && channel.host.nick == user.nick) {
			if (typeof cmd[3] != 'undefined') {
				switch(cmd[2]) {
					case '+b':
						channel.bans.push(cmd[3]);
					break;

					case '+l':
						channel.maxUsers = parseInt(cmd[3]);
					break;
				}
			}
		}
	}
};

exports.startg = function(user, cmd, channel, http, gameId) {
	if (user.isLoggedIn && cmd.length > 2 && typeof channel != 'undefined') {
		if (channel.lobby == false && channel.host.nick == user.nick) {
			var list = cmd[2].split(','), startg = channel.startg(list);
			channel.broadcast(channel.host, ':'+ channel.host.nick +'!u@h PAGE u :Game Started!', true);

			var string = ':'+ channel.host.nick +'!u@h STARTG u :'+ startg +' :'+ gameId.inc(); +' '+ Math.round(+new Date()/1000);
			channel.broadcast(user, string, true);
			channel.gameStarted = true;
		}
	}
};

exports.gameopt = function(user, cmd, channel, channels) {
	if (user.isLoggedIn && cmd.length > 1 && user.channel != null) {
		if (typeof channel == 'undefined') { channel = channels[user.channel]; }

		if (typeof channel != 'undefined' && channel.lobby == false) {
			var gameopt = ':'+ user.nick +'!u@h GAMEOPT '+ cmd[1] +' '+ cmd.splice(2, cmd.length-1).join(' ');
			// http://jsperf.com/js-startswith/6
			if (cmd[1].substr(0, 1) == '#') {
				// sending to channel
				if (user.channel == channel.name) channel.broadcast(user, gameopt, false);
			} else {
				// sending to user
				var index = channel.pop(cmd[1]);
				if (index >= 0) channel.users[index].write(gameopt);
			}
		} // ##end channel.lobby == false
	}
};

exports.finduserex = function(user, cmd) {
	// check if target.options.find == true
};

exports.getbuddy = function(user, cmd) {
	
};

exports.addbuddy = function(user, cmd) {
	
};

exports.delbuddy = function(user, cmd) {
	
};

exports.quit = function(user, cmd) {
	user.destroy();
};