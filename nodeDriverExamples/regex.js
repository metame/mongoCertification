var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/course', function(err, db) {
    if(err) throw err;
    
    var query = { 'title' : { '$regex' : 'Internet' } };
    
    var projection = { 'title' : 1, '_id' : 0 };
    
    // this creates the cursor object, but does not perform the query
    var cursor = db.collection('reddit').find(query,projection);
    
    cursor.each(function(err, doc) {
        if(err) throw err;
        
        if(doc == null) {
            return db.close();
        }
        
        console.dir(doc.title);
    });
});