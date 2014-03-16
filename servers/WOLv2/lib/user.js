function user(options) {
	this.nick = options.nick || null;
	this.apgar = options.apgar || null;
	this.serial = options.serial || null;
	this.isLoggedIn = false;
	this.clan = {clanId: 0, name: '', abbreviation: ''};
	this.channel = null;
	this.cvers = null;
	this.options = {codepage: 1252, locale: 0, find: true, page: true};
	this.stats = {position: 0, wins: 0, losses: 0, disconnects: 0, points: 0};
	this.buffer = '';
	this.socket = options.socket;
}

user.prototype.login = function(apgar) {
	this.apgar = apgar;
	if (this.nick !== null && apgar != null) {
		// TODO: verify login, return boolean
		this.isLoggedIn = true;
		if (this.isLoggedIn = true) {
			// grab clan information
		}
		return true;
	}
	return false;
};

user.prototype.write = function(data) {
	if (this.socket.writable == true) {
		console.log(this.socket.name +' < '+ data);
		this.socket.write(data +'\r\n');
	}
};

user.prototype.longIp = function() {
	// TODO: add IPv6 support
	var ipa = this.socket.remoteAddress.split('.');
	if (ipa.length == 4) {
		return ((((((+ipa[0])*256)+(+ipa[1]))*256)+(+ipa[2]))*256)+(+ipa[3]);
	}
	return '2130706433';
};

user.prototype.destroy = function() {
	this.socket.destroy();
};

user.prototype.queue = function(data) {
	this.buffer += data;
};

user.prototype.flush = function() {
	this.buffer = '';
};

module.exports = user;