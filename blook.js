var application_root = __dirname,
	express = require("express"),
	path = require("path"),
	config = require("./configuration.js"),
	mongoose = require('mongoose');

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

// Database stuff

mongoose.connect('mongodb://localhost/blook');

var Chapter = new mongoose.Schema({
	title: { type: String, required: true},
	date: { type: Date, required: true, default: Date.now},
	text: { type: String, required: true}
});
var ChapterModel = mongoose.model('Chapter', Chapter);

// REST API

app.get('/api/chapters', function(req, res, next) {
	console.log("Ok");
	return EntryModel.find(function (err, entries) {
		console.log("Hier nie")
		if(!err)
			return res.send(entries);
		else
			console.log(err);
			next(err);
	});
});

app.post('/api/chapters', function(req, res, next) {
	console.log("Create a new chapter!")
	console.log(req.body);
	chapter = new ChapterModel({
		title: req.body.title,
		text: req.body.text
	});

	chapter.save(function(err) {
		if(!err)
			res.send(chapter);
		else
			next(err);
	});
});

// Launch the server.

console.log("TEEST");

app.listen(4242); 
