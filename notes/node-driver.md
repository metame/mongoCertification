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

#### Field Projection
Projections are passed as the second argument to the `find()` method, e.g. `db.collection('grades').find(query,projection);` where the projection is assigned as `var projection = { 'student' : 1, '_id' : 0 };` which would only return the student field and omit the _id field.

#### Skip Limit Sort
It's important to do these in order:
1. Sort
2. Skip
3. Limit
Otherwise, we might skip things we didn't mean to or return docs we didn't want to.
The driver already puts these in order no matter what order you call them in.
You can include skip, limit and sort as an argument in the find, findOne, & findAndModify methods, pass them in the options objects, or call them on a cursor.

### Inserting & Manipulating Data
#### insert()

### Updates
#### Replacement updates
Replacing the entire document. The replacement update function accepts three arguments: document to update, updated document, and callback function with 2 arguments `(err, updated)`.

#### In Place Updates
Updating values without replacement.
The change for an inplace document simply requires passing an `operator` value using the `$set` operator in place of the updated document value from the first replacement.  

#### Multi updates
simple passing in a third argument as `options` with `{ 'multi' : true }`

### Upsert & Save
#### Upserts
Upserts are similar in structure to multi updates except the `options` object is defined as `{ 'upsert' : true }`.

#### Save
Save is a wrapper around an upsert.  It works similarly to a replacement update and requires the findOne() query, but automatically gets the _id field when the doc is passed into the save() function.

### findAndModify
The purpose of findAndModify is to atomically update and return the document, locking the document it finds in order to modify it without any possible changes in between.
findAndModify requires 4 arguments:
1. query
2. sort
3. operator
4. options

And of course a callback function at the end.