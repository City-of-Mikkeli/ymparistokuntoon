var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var database = require('./config/database.js');
var bodyParser = require('body-parser');
var multer = require('multer');

var SERVER_ROOT = '/ymparistokuntoon';

mongoose.connect(database.getConnectionUrl());
var datastore = mongoose.connection;

datastore.on("error", function(err) {
	console.error('Failed to connect to DB, exiting...');
});

datastore.on('disconnected', function () {
	console.error('Mongoose connection to DB disconnected');
});

var closeConnection = function(){
	datastore.close(function () {
		console.log('Mongoose default connection with DB disconnected, because application was closed.');
		process.exit(0);
	});
};

process.on('SIGINT', closeConnection).on('SIGTERM', closeConnection);

datastore.once('open', function() {
	
	var app = express();

	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.json({limit: '50mb'}));
	app.use(bodyParser.urlencoded({limit: '50mb'}));
	app.use(multer({inMemory: true}));
	
	require('./routes')(app);

	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
});