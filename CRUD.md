#CRUD
## In mongoDB:
* Create : Insert
* Read : Find
* Update : Update
* Delete : Remove

## CRUD operations
### Methods on Objects vs. Separate Language
MongoDB's CRUD operations exist as methods/functions in programming language APIs, not as a separate language (like SQL).

## Create
For loop for creating many documents at once: `for (i=0; i<1000; i++) { names=["exam", "essay", "quiz"]; for (j=0;j<3;j++) {db.scores.insert({"student":i,"type":names[j],score: Math.round(Math.random()*100)});}}`

## Read
### Find
to call find in shell use `db.{collection}.find()`.
Criteria can be called using JSON notation passed as a parameter in the `find()` method.

### findOne
to return a single entry at random within a collection `db.{collection}.findOne()`
To get a single document based on key value a JSON value can be passed as a parameter just like in `find()`

### Parameters & Options
When reading, you can retrieve objects from the database that match certain values or only return certain keys.

#### Querying Key-Values: The first argument to `find()`

##### Query by Example Queries
The first argument in `find()` or `findOne()` is the key value(s), e.g. `findOne({"name" : "Michael"})`.
If two arguments/example queries are used Mongo treats these as a logical 'and', e.g. `findOne({"name" : "Michael", "age" : 29 })`.

##### Query Operators
Go to Query Operators

#### Returning Specific Keys Only: The second argument to `find()`
The second argument are the keys to retrieve/print, e.g. to get "Michael"'s email `findOne({"name" : "Michael"}, {"email": true})`
The _id field is returned by default but can be omitted in the second argument, e.g. `findOne({"name" : "Michael"},{"email": true, "_id" : false})

### Query Operators

#### Using `$gt` & `$lt`
`$gt` & `$lt` are used as queries on a subdocument within the query document, e.g. `db.scores.find( { score : { $gt : 95 } })`
Two operators can be used on the same field, e.g. `db.scores.find( {score : { $gt : 95, $lte : 98 } , type : "essay"} )`
Operators within this group include: `$gt`,`$lt`,`$gte`,`$lte`

#### Using Inequality Operators on Strings
`$gt` & `$lt` can also be used on strings, e.g. `db.people.find({ name : { $lt : "D" } } )` will return all documents whose value for the field 'name' are albhabetically less that 'D'. MongoDB is case sensitive for sorting and range comparison so in a collection where all names' first letter was capitalized `db.people.find({ name : { $lt : "d" } } )` would return no results.

#### Using $exists
To return all documents where a field exists or doesn't: `db.people.find({profession : { $exists : true } } )` or `db.people.find({profession : { $exists : false } } )`

#### Using $type
MongoDb can return documents based on the type of information in the value for a specific field using the BSON doc's data type numbers, e.g. `db.people.find( {name : { $type : 2 } } )` returns all documents whose name field's value is a string.

#### Regular expressions - $regex
To return all documents with a "a" in the name field: `db.people.find( {name: { $regex : "a" } } )`
All documents with name field beginning with A & ending with e: `db.people.find( { name : { $regex : "^A", $regex : "e$" } } )`

### Combining queries and query operators

#### Using $or
By default multiple queries are processed as logical "and", to use 'or': `db.people.find( { $or : [ {name : { $regex : "e$" } }, { age : { $exists : true } } ] } )`.
The `$or` operator cannot be used deeper within the data objects.

#### Using $and
To use an explicit "and" instead of the default "and" use `$and` in the same way as `$or`.
This can help with dynamic query operators, i.e. constructing queries that may user `$or` & `$and` based on different situations.
For example, this would only return documents with scores less than 60: `db.scores.find( {score : { $gt : 50 }, score : { $lt : 60 } } )`.  The JS parser will only take the last query and ignore the first.

### Querying within Arrays
MongoDB is polymorphic in matching both arrays and non-array values. The query `db.accounts.find( { favorites : "pretzels" } );` returns all documents whose value for the field 'favorites' is pretzels or is an array including the value 'pretzels' at the top level of the array.
Thus, MongoDB will not find values in objects or arrays within arrays.

#### Using $all for Array queries
Using $all checks for a subset within an array and does not care about order, e.g. `db.accounts.find( { favorites: { $all : [ "pretzels", "beer" ] } } );` will return docs where the 'favorites' field's value is an array that includes both "pretzels" and "beer" even if that array also contains other values.

#### Using $in for Array queries
$in is using an array as a query value to include all documents whose value matches one of the array values, e.g. db.accounts.find( { name: { $in: [ "Howard", "John" ] } } );` will return all documents where the name field's value is either "Howard" or "John".

It could be said then that $all is used to query array values within a document and $in is used to query values within a document using an array.

### Working with Nested Documents
If a field value is a document (e.g. JSON object), to use a normal find query that returns the document, it must be the exact document in the exact order for the document to be returned as it compares the query with the document byte by byte.

#### Dot Notation
Much like accessing objects in JavaScript, mongo allows you to use dot notation to find an embedded document within a field value by the nested key. e.g. Supposing a document with an email field with a nested document with both personal and work emails, `db.users.find({"email.work" : "richard@10gen.com" } );` will return the document no matter what other emails are within the email field's nested document.

### Querying backend & Cursor Objects
When you execute a query using `find()` it returns a cursor, which means mongo iterates over every value that matches the query and prints it out.

You can store that cursor by storing the query as a value, e.g. `cur = db.people.find();`.  To keep from printing the results of the query ` null;` can be appended to the end of the query.

#### Cursor Methods
Common cursor methods include `hasnext()` returning a boolean value and `next()` returning the next object in the cursor.

Using `limit()` you can limit the amount of documents in a cursor, e.g. `cur.limit(5)`.

Using `sort()` allows sorting documents, e.g. `cur.sort({name: -1 } );` returns documents in reverse ordering alphabetically where a value of `1` would sort alphabetically.

`limit()` and `sort()` do their work server-side, not client-side so it helps with server memory and database calls.

`skip()` also allows for skipping documents in a cursor, e.g. `cur.skip(2)` would skip the first 2 documents in the cursor, returning the remaining documents.

IMPORTANT: sort, skip, & limit must be applied before the first document is called including checking for empty cursors using the `hasnext()` method.  This is due to the server-side nature of these calls.

### Counting Results
The `count()` command has a similar syntax as `find()`, e.g. `db.scores.count()` would count all documents in the scores collection and `db.scores.count({type: "essay"});` would count all documents in the count collection whose type was essay.

## Updating Documents
The API for updating does four different things in the Mongo shell.  Wholesale Replacement, Manipulate Individual Fields, Upserts, or Update Multiple Documents.

### Wholesale Replacement
Updates take two arguments.  The first argument is a query, the second argument is a document. `db.people.update( { name: "Smith" } , { name: "Thompson", salary : 50000 } );` will update documents with the name "Smith" and replace all information in that document besides the "_id" with whatever is passed as the second argument.  This is a wholesale replacement of the document.

### Using $set to update a field
`$set` can be used to update or add a field and value to an existing document. e.g. `db.people.update( { name: "Alice" } , { $set : { age : 30 } } );` will find the document with the name "Alice" and set `age` to 30 whether or not the field age already exists.

### Using $inc to increment
`$inc` can be used to increment, e.g. `db.people.find( { name : "Alice" } , { $inc : { age : 1 } } );` increased Alice's age in the DB by one.  If the age field did not exist, this command would create it and set its value to 1.

### Using the $unset command to remove a field
db.people.update( { name: "Jones" } , { $unset : { profession : 1 } } );` will delete the profession field. Any value will work for the key that is being `$unset`.

### Manipulating Arrays inside Documents

$set can be used to update an array using the value's index in the array, e.g. `db.arrays.update({_id:0},{$set: {"a.2" : 5}});` would update the array value of the key 'a' or a[2] in JavaScript.

$push and $pop can be used just as the javascript array methods `push()` and `pop()` to add/remove the rightmost element in the array. $pop with a negative argument will remove the leftmost element in the array, e.g. `$pop : { a : -1 }`.

$pull will remove the element of a certain value no matter where it is in the array, e.g. `$pull : { a : 5 }` will remove the value 5 from the array 'a'.

$pushAll and $pullAll will add/remove an array of elements to the array and is called as would be expected, e.g. `$pushall : { a : [ 7, 8, 9 ]}` would add 7,8,9 to the existing array 'a'.

$addToSet is like $push with idempotency. That is, it will only add the value to the array if it doesn't already exist.


### Upserts
To update an existing document or create a new document, i.e. update/insert, there is the Upsert method.
`db.people.update({ name : "Charlie " }, { $set : { age : 50 } }, { upsert : true } );` would find all documents with the name "Charlie" and set the age to 50. If there were no documents that match the update, then a new document would be inserted.

### Updating Multiple documents
As in `find()` you can update all documents in the collection by not passing parameters in the first argument and specifying `{ multi : true }`.  If the multi option is not specified, Mongo will just update the first document it retrieves.  This is an important difference between Mongo and SQL/relational databases, as where calls in SQL will update all records by default.

Another important point about multiple document updates is that they are processed as separate transactions, meaning that they do not lock all documents to be updated at the point of making the update call/command.  It will lock each document as it is updating to ensure there are no other concurrent updates, but it is possible that another user could update a document that completes before your update even if they submitted the update after you have issued an update method using `multi : true`.


## Delete
MongoDB calls this 'remove'.

`db.people.remove({ name : "Alice" });` removes all documents with the name Alice.
`db.people.remove();` does nothing while `db.people.remove({});` removes all documents in the collection

You can also drop a collection using `db.people.drop();`, the main difference between drop and remove is remove acts one-by-one and drop removes the whole data structure including indexes and metadata.  This makes drop faster.

Like multi-updates, the `remove()` method, does not lock all documents at the time the command is passed.