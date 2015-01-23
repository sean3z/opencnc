function channel(options) {
	this.name = options.name || null;
	this.host = options.host || null;
	this.password = options.password || null;
	this.topic = options.topic || '';
	this.maxUsers = options.maxUsers || 30;
	this.tournament = options.tournament || false;
	this.flag = options.mode || 0;
	this.lobby = options.lobby || false;
	this.gsku = options.gsku || 18;
	this.users = [], this.bans = [];
	this.gameStarted = false;
}

channel.prototype.broadcast = function(user, message, alertUser) {
	alertUser = (alertUser) ? false : true; // reverse alertUser to skip continue if true
	for(var i = 0; i <= this.users.length - 1; i++) {
		var player = this.users[i];
		if (player.nick == user.nick && alertUser) continue;
		player.write(message);
	}
};

channel.prototype.names = function() {
	var names = [];
	for(var i = 0; i <= this.users.length - 1; i++) {
		var player = this.users[i], hostStatus = '';
		if (this.host != null && this.host.nick == player.nick) hostStatus = '@';
		names.push(hostStatus + player.nick +','+ player.clan.clanId +','+ ((!this.lobby) ? player.longIp() : '0'));
	}
	return names.join(' ');
};

channel.prototype.pop = function(nick) {
	for(var i = 0; i <= this.users.length - 1; i++) {
		if (this.users[i].nick == nick) return i;
	}
	return -1;
};

channel.prototype.multipop = function(nicks) {
	var indexes = [];
	for(var i = 0; i <= this.users.length - 1; i++) {
		if (indexes.length == nicks.length) break; // save a few cycles
		if (nicks.indexOf(this.users[i]) >= 0) indexes.push(i);
	}
	return indexes;
};

channel.prototype.startg = function(list) {
	var startg = [];
	for(var i = 0; i <= this.users.length - 1; i++) {
		var player = this.users[i], index = list.indexOf(player.nick);
		if (index >= 0) startg[index] = player.nick +' '+ player.socket.remoteAddress;
	}
	return startg.join(' ');
};

channel.prototype.tunnelSupport = function() {
	for(var i = 0; i <= this.users.length - 1; i++) {
		if (this.users[i].options.tunnel == false) return false;
	}
	return true;
};

module.exports = channel;