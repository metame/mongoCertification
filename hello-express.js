var express = require('express'),
    app = express();

app.get('/', function(req, res) {
  res.send("Hello, World!");
});

app.get('*', function(req, res) {
  res.send("Page not found", 404)
});

app.listen(8080);
console.log("server was started");