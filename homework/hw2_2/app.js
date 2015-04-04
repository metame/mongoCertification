var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/weather', function(err, db) {
    if(err) throw err;
    
    var weather = db.collection('data');
    var cursor = weather.find();
    cursor.sort([['State', 1],['Temperature', -1]]);
    var currentState = '';
    cursor.each(function(err, doc) {
      if(err) {
        console.log(err.message);
      };
       
       if(!doc){
        console.log('no doc found');
       }

       else if(doc.State !== currentState){
           
          var operator = { '$set' : { 'month_high' : true } };
           
          weather.update(doc, operator, function(err, updated){
              if(err) throw err;
               
              console.dir('Month high for ' + doc.State + ' is ' + doc.Temperature + '!');
          });
           
          currentState = doc.State;

       }

    });

});