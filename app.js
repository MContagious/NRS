
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var authorize = require('./routes/authorize');
var restrict = authorize.restrict;
var http = require('http');
var path = require('path');
var bootstrap = require('bootstrap3-stylus');
var stylus = require('stylus');
var db = require('./DB');
var UserC = require('./User');
var User = new UserC (db);

function compile(str, path) {
	return stylus(str)
	.set('filename', path)
	.use(bootstrap());
}

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(stylus.middleware({
  src: __dirname + '/resources',
  dest: __dirname + '/public',
  debug: true,
  force: true,
  compile : compile
}));

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

//app.use(express.bodyParser());
app.use(express.cookieParser('kishore123relangi321'));
app.use(express.session());

//development only
if ('development' == app.get('env')) {	
	app.use(express.errorHandler());
	app.locals.pretty = true;
	app.set('view options', { debug: true });
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', restrict, routes.index);
app.get('/Home', restrict, routes.index);
app.get('/Login', authorize.login);
app.get('/login', authorize.login);
app.get('/NewUser', authorize.newuser);
app.get('/newuser', authorize.newuser);
app.get('/logout', authorize.logout);
app.get('/Logout', authorize.logout);

var handle_login = function(req, res, next) {
//	console.dir(User);
	User.authenticate(req.body.email, req.body.password, function(err, user){
		if (err) {
			req.session.error = err.message;
			res.redirect('/login');
			return;
		}
		else {
			req.session.error = '';
			req.session.user = user;
			next();
		}
	});
};

app.post('/login', handle_login, authorize.to_prev_page);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
