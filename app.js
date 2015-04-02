var express = require('express'),
    app = express();
    cons = require('consolidate');
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + "/views");

// this just defines the connection but doesn't create a callback
var mongoclient = new MongoClient(new Server('localhost', 27017, { 'native_parser' : true }));

var db = mongoclient.db('course');

app.get('/', function(req, res) {

  db.collection('hello_mongo_express').findOne({}, function (err, doc) {
    res.render('hello', doc);
  });  
});

app.get('/:name', function(req, res, next) {
  var name = req.params.name;
  var getvar1 = req.query.getvar1;
  var getvar2 = req.query.getvar2;
  res.render('name', { name : name, getvar1 : getvar1, getvar2: getvar2 });
});

app.get('*', function(req, res) {
  res.send("Page not found", 404)
});


mongoclient.open(function (err, mongoclient) {
  if(err) throw err;
  app.listen(8080);
  console.log("server was started");
});
