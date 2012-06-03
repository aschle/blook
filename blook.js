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
	return ChapterModel.find(function (err, entries) {
		if(!err) {
			var es = [];
			for (idx in entries) {
				var e = new Object();
				e['_id'] = entries[idx]['_id'];
				e['title'] = entries[idx]['title'];
				e['date'] = entries[idx]['date'];
				e['text'] = entries[idx]['text'];
				e['html'] = marked.parse(e['text']);
				es.push(e);
			}
			return res.send(es);
		} else {
			console.log(err);
			return next(err);
		}
	});
});

app.post('/api/chapters', function(req, res, next) {
	chapter = new ChapterModel({
		title: req.body.title,
		text: req.body.text
	});

	chapter.save(function(err) {
		if(!err) {
			var e = new Object();
			e['_id'] = chapter['_id'];
			e['title'] = chapter['title'];
			e['date'] = chapter['date'];
			e['text'] = chapter['text'];
			e['html'] = marked.parse(e['text']);
			return res.send(e);
		} else {
			console.log(err);
			return next(err);
		}
	});
});

app.put('/api/chapters/:id', function(req, res, next) {
	return ChapterModel.findById(req.params.id, function (err, chapter) {
		chapter.title = req.body.title;
		chapter.text = req.body.text;
		return chapter.save(function (err) {
			if (!err) {
				var e = new Object();
				e['_id'] = chapter['_id'];
				e['title'] = chapter['title'];
				e['date'] = chapter['date'];
				e['text'] = chapter['text'];
				e['html'] = marked.parse(e['text']);
				return res.send(e);
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
