var hash = require('./pass').hash;
var email   = require("./Email");

function User (connection) {
	this.connection = connection;
}

User.prototype.get_user = function (email, cb)
{
	"use strict";
	var Self = this;
	Self.connection.query('select up.Email, up.hash, up.salt, ed.fname, ed.lname, ed.gender from User_Pwds up, empdetails ed  where up.Confirmed = \'Y\' and Email = ?',
			[email],
			function(err, result){
				if (err) 
				{
					console.log(err);
					cb(err, null);
				}
				else
				{				
					cb(null, result[0]);
				}
	});
};

User.prototype.authenticate = function (name, pass, fn) {
	"use strict";
	var Self = this;
	if (!module.parent) console.log('authenticating %s:%s', name, pass);
	Self.get_user(name, function (err, user) {
		if (!user) return fn(new Error('cannot find user'));
		if (user.gender == 'M'){
			user.title = 'Mr. ';
		}
		else {
			user.title = 'Ms. ';
		}
		hash(pass, user.salt, function(err, hash){
			if (err) return fn(err);
			if (hash == user.hash) return fn(null, user);
			fn(new Error('invalid password'));
		});
	});
};


User.prototype.register_new_user = function (user_email, password, next)
{
	var cb = next;
	var Self = this;
	
	hash( password, function (err, salt, hash){
		if (err) cb (err);
		var data = {
				'Email' : user_email,
				'Salt'  : salt,
				'Hash'  : hash,
				'Confirmed' : 'N'
		};
		Self.connection.query('insert into User_Pwds SET ? ', data, function(err, result){
			if (err) {
				console.error('Failed inserted a record into database for email-id:' + data.Email);
				cb(err);
			}
			else {
				console.info('Successfully inserted a record into database for email-id:' + data.Email);
				email.acknowledge("Employee Details : Confirm registration",
						'User : ' + user_email + '<br>' +
						'Password : ' + password + '<br>' +
						'Please open the link in browser (or click) the following link <br>' + 
						'<a href="http://192.168.3.86:8080/confirm_email/salt/' + 
						encodeURIComponent(salt) + '/email/' + encodeURIComponent(user_email) + '">' +
						'Confirm</a>', data.Email);
				cb();
			}
		});
	});
};

User.prototype.confirm_user_registration  = function ( user_email, salt, next)
{
	var Self = this;
	var cb = next;
	var data = {
			'Email' : user_email,
			'Salt'  : salt,
			'Confirmed' : 'Y'
	};
	Self.connection.query('update User_Pwds SET Confirmed = ? where Email = ? and Salt = ?',
			['Y', user_email, salt],
			function(err, result){
		if (err) {
			console.error('Failed inserted a record into database for email-id:' + data.Email);
			cb(err);
		}
		else {
			console.info('Successfully inserted a record into database for email-id:' + data.Email);
			email.acknowledge("Employee Details : Registration Confirmed",
					'Please use the following link to update your details <br>' + 
					'<a href="http://192.168.3.86:8080/">Login</a>', data.Email);
			cb();
		}
	});
};

module.exports = User;