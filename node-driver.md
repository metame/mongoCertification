# MongoDB Driver for Node.js

## Setting up the driver in Node
To start a Mongo instance in a Node app, the mongo module must be required and the app must connect to the database.

    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect('{mongod server/dbname}', function(err, db){
    // check for errors
    // do stuff
    });

## Methods using the Node.js Driver

### findOne()
`db.collection('grades').findOne(query, function(err, doc) { // do stuff });`

### find()
`db.collection('grades').find(query).toArray(function(err, docs) { // do stuff });`
The find method like in the shell returns a cursor so instead of using a callback on find, we use a method to tell the cursor what to do with the documents, in this case the `toArray()` method.

#### A note about cursors
Creating a cursor object does not perform the query until something is done with that object.