var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/course', function(err, db) {
    if(err) throw err;
    
    var weather = db.collection('weather');
    var cursor = weather.find();
    cursor.sort = ([['State', 1],['Temperature', -1]]);
    var currentState = '';
    cursor.each(function(err, doc) {
       if(err) throw err;
       
       if(doc.State !== currentState){
           
           console.log(doc.State);
           
        //   var operator = { '$set' : { 'month_high' : true } };
           
        //   weather.update(doc, operator, function(err, updated){
        //       if(err) throw err;
               
        //       console.dir('Month high for ' + doc.State + ' found!');
        //   });
           
           currentState = doc.State;
       }

    });
});