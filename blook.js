var application_root = __dirname,
	express = require("express"),
	path = require("path"),
	config = require("./configuration.js");

// Create the server.

var app = express.createServer();

app.configure(function() {
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser(config.cookieSecret));
	app.use(express.session());
	app.use(app.router);
});

app.configure('development', function() {
	app.use(express.static(path.join(application_root, "public")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
	var oneYear = 31557600000;
	app.use(express.static(path.join(application_root, "public"), { maxAge: oneYear }));
	app.use(express.errorHandler());
});

// REST API

app.get('/section/:id', function(req, res, next) {
	var file = req.params.id;
	res.send(file);
});

app.get('*', function(req, res, next) {
	
});

// Launch the server.

app.listen(4242); 
