var application_root = __dirname,
	express = require('express'),
	path = require('path'),
	config = require('./configuration.js'),
	mongoose = require('mongoose'),
	marked = require('marked');

// Create the server.

var app = express.createServer();

app.configure(function() {
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser(config.cookieSecret));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(application_root, "public"), { maxAge: 0 }));
});

app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
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
	return ChapterModel.find(function (err, entries) {
		if(!err)
			return res.send(entries);
		else
			console.log(err);
			return next(err);
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
			return res.send(chapter);
		else
			console.log(err);
			return next(err);
	});
});

app.put('/api/chapters/:id', function(req, res, next) {
	return ChapterModel.findById(req.params.id, function (err, chapter) {
		console.log(req.body);
		chapter.title = req.body.title;
		chapter.text = req.body.text;
		return chapter.save(function (err) {
			if (!err) {
				console.log("updated");
			} else {
				console.log(err);
				return next(err);
			}
			return res.send(chapter);
		});
	});
});


app.post('/api/marked', function(req, res, next) {
	res.send(marked.parse(req.body.data));
});

// Launch the server.
app.listen(4242); 
