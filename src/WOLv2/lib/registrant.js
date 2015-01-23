function registrant(options) {
	this.buffer = options.buffer || '';
	this.socket = options.socket;
	this.email = null;
	this.dob = {month: null, day: null, year: null};
	this.langcode = 0;
	this.request = null;
	this.sku = null;  /* here are SKUs of all installed games */
	this.ver = null;  /* same as with SKU - versions of all installed games */
	this.serial = null;   /* also serials of all installed games */
	this.sysid = null;
	this.syscheck = null;
	this.age = 0;
	this.nicks = {old: [], 'new': null};
	this.pass = {old: [], 'new': []};
	this.newsletter = 0;
	this.shareinfo = 0;
}

registrant.prototype.write = function(data) {
	if (this.socket.writable == true) {
		console.log(this.socket.name +' < '+ data);
		this.socket.write(data +'\r\n');
	}
};


registrant.prototype.apgar = function(s) {
	if (s.length != 8) {  return false; }
	var s = s.split(''), o = new Array();
	var u = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./';
	for( var i = 0; i <= 7; i++ ) {
		var a = s[(8 - i)], r = ( (i == 0) ? 0 : a.charCodeAt(0));
		var j = s[i].charCodeAt(0), x = ( (j & 1) ? (j << 1) & r : j ^ r);
		var k = (x & 0x3f), f = u.substring(k, (k + 1));
		o.push(f);
	}
	return o.join('');
};

registrant.prototype.destroy = function() {
	this.socket.destroy();
};

registrant.prototype.getNick = function() {
	return this.nicks['new'];
};

registrant.prototype.getPass = function() {
	return this.pass['new'][0];
};

registrant.prototype.getAge = function() {
	if (this.age < 1) {
		//## http://jsperf.com/birthday-calculation/2
		var birthday = +new Date(this.dob.year +'-'+ this.dob.month +'-'+ this.dob.day);
		this.age = ~~((Date.now() - birthday) / (31557600000));
	}
	return this.age;
};

registrant.prototype.getSku = function() {
	if (typeof this.sku == 'object' && this.sku.length > 0) {
		var skus = []; // list of valid skus
		skus.push(4608, 4610, 4611, 4615); // tiberian sun
		skus.push(7168, 7170, 7171, 7175, 7424, 7426, 7427, 7431); // tiberian sun: firestorm
		skus.push(8448, 8450, 8451, 8457, 8458, 8960, 8962, 8963, 8969, 8970); // red alert 2
		skus.push(10496, 10498, 10499, 10505, 10506);  // red alert 2: yuri's revenge
		skus.push(3072, 3074, 3075, 3078, 3081, 3082); // renegade
		skus.push(32512); // wol api

		for(var i = 0; i <= this.sku.length - 1; i++) {
			var s = this.sku[i], x = skus.indexOf(s);
			if (x > -1) return parseInt(s);
		}
	}
	return 4610;
};

registrant.prototype.getSerial = function() {
	if (typeof this.serial == 'object' && this.serial.length > 0) {
		for(var i = 0; i <= this.serial.length - 1; i++) {
			var s = this.serial[i];
			if (s.length > 10) return parseInt(s);
		}
	}
	return 0; // if no serial, return 0
};

registrant.prototype.getSysId = function() {
	// TODO: base sysid on ip or something trackable
	// some clients are missing sysId, in such case - we make one up.
	if (this.sysid == null) {
		return Math.random().toString(36).slice(2).toUpperCase();
	}
	return this.sysid;
};

module.exports = registrant;