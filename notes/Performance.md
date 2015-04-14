# Performance: Storage Engines & Indexing

## Storage Engines
MongoDB 3.0 introduced the ability for plugin storage engines. The main Storage Engines available are MMAPv1 and WiredTiger.

### What is a Storage Engine?
A storage engine is a component of the DB between the driver interface (e.g. shell, node-driver, pymongo) and the physical disk storage.  It is reponsible for allocating disk space, handling database requests in terms of memory and storage.  For example, when creating a cursor of a collection, will that whole collection be stored in memory (RAM) or an indexed portion?

Because of these key behaviors, the storage engine does affect database performance.  Choosing between storage engines requires an understanding of the type of application being developed, the schema for the database, and the type of requests that will be most common.

### MMAPv1
MMAP is a Linux Operation and can be learned about through the `man mmap` command in Linux terminal.  Concisely, the `mmap` system call maps documents into memory (real or virtual).
The OS decides which pages/documents are going to be in memory, the storage engine just determines what is done with those pages and how those pages are updated.
Features of MMAPv1:
* Collection Level Locking
* In Place Updates: tries to update the doc in place in memory
* Power of Two Sizes: allocates more storage than the actual document requires 

Issue with Collection Level Locking is that two requests to the same collection cannot be completed at the same time.  This can create performance problems.

### WiredTiger
This is not turned on by default but offers interesting features and for a lot of workloads, it is faster.
Features:
* Document Level Concurrency: This isn't called locking but does provide a big win in allowing multiple updates/requests to the same collection simultaneously.
* Compression - of data, of indexed. WiredTiger itself manages the memory used to access the db file. It decides what blocks will be kept in memory and what will be back to disk. Unlike MMAPv1 which allows the OS to manage memory/disk.
* No Inplace Updates: this is an 'append-only' storage engine, meaning an update to a document will actually append that document to the collection, then delete that document later on.


## Indexes
Take an imagined collection with documents of the following form:
    {name:'Zoe',hair_color:'Brown',DOB:'2001-03-23'}
An index is simply an ordered list of things.  Indexes in Mongo are Btree[s]. An index for (name,hair\_color) would order entries first by name, then by hair color.  Queries within indexes should always include the "left-most thing", i.e. in the example (name, hair\_color, DOB) searching this index should always include name.

While indexes make reads faster, they do make writes slower because every time a write occurs the index has to be updated.

### Creating Indexes
Indexes can be created on one or more keys using the `createIndex()` method, e.g. `db.students.createIndex({student_id:1, age:-1});`.  The value for each key being indexed is analogous to the `sort()` method, viz. indexing the key's values progressively or regressively.

### Discovering Indexes
Finding the indexes that already exist on a collection is with the `getIndexes()` method, e.g. `db.students.getIndexes()`.

### Deleting Indexes
Deleting indexes requires passing the same sequence/values provided to the `createIndex()` call to the `dropIndex()` call, e.g. `db.dropIndex({student_id:1, age:-1});`.

### Multikey Indexes
A multikey index is an index created on arrays.  Restrictions on multikey indexes:
* Can't create compound indexes where more than 1 key's value is an array, i.e. parallel arrays.
This doesn't mean that two keys couldn't have array values in different documents but two keys in a compound index cannot have arrays as values in a single document. 

### Dot Notation & Multikey
You can use dot notation to create multikey indexes of values beyond just top-level keys.

### Unique Indexes
Unique indexes enforce the constraint that no two keys within an index can have the same value.
This means the create index will fail if two keys have the same value.
The call for creating a unique index passes `unique:true` as the second argument to the `createIndex` call, e.g. `db.users.createIndex({user_id: 1},{unique: true});`.

### Sparse Indexes
Sparse indexes can be used when an index key is missing from a document to be indexed.  If creating a unique index on these documents with missing values, the request would error.  Thus, the `sparse` option. `sparse` is passed as an option in the second argument of the `createIndex` call, e.g. `db.employees.createIndex({college: 1},{unique: true, sparse: true});`.

NOTE: A sparse index can't be used for sorting because there is not an entry in every document.

### Foreground vs. Background Index Creation
Foreground index creation:
* fast
* blocks writers and readers in the database
* not recommended for production

Background index creation:
* slow
* non-blocking for reader/writers
* better for production system

Foreground index creation is default. To create a background index pass `background: true` as an option in the second argument of the `createIndex` call, e.g. `db.students.createIndex({'scores.score':1},{background: true});`.

### Covered Queries
A query that can be satisfied completely with an index. An `explain` will show that no documents were scanned.

To do this, the specific keys that are indexed must be projected and (typically) the `_id` field must be projected out.

### When MongoDB uses an Index
When multiple indexes could be used to satisfy a query, MongoDB creates multiple query plans then chooses the one that returns results the quickest.  MongoDB will then cache this index as the one to be used for future queries of the same form.

### Index Sizes
It's important to be able to fit the working set into memory, otherwise information will have to be pulled from disk regularly which will signicantly hinder performance.
This can be checked in several different ways:
* `db.collection.stats()` has a value for `index sizes`
* `db.collection.totalIndexSize()` which gives the total index size.

### Index Cardinality
How many index points are created for each type of index?
* Regular Index - 1:1
* Sparse Index - <= docs
* MultiKey Index - > docs

### Geospatial Indexes
A 2D index uses x,y values stored as an array for the same key, e.g. `location: [x,y]`. The index would be created by `createIndex({"location": "2d",type:1});`, where 2d is a reserved index type.

To then query based on this geospatial index, you would then query as `db.stores.find({location:{$near:[50,50]}});` which returns the results in order of increasing distance.

### Geospatial Spherical Indexes
This is a 3d index, also called a 2dsphere. MongoDB takes a longitude,latitude to map this.  It's based on GeoJSON[geojson.org].

This is done by using two reserved keys `type` and `coordinates` which can be stored at the top level as subdocuments.  To create an index on this, use `db.places.createIndex({location: '2dsphere'});`.

To query, again use the `$near` operator and then nesting the `$geometry` operator whose value is the `type` and `coordinates` to query against along with the `$maxDistance` operator whose value is in meters, e.g. `db.stores.find({loc:{$near:{$geometry:{"type":"Point","coordinates":[-130,39]},$maxDistance: 1000000}}});`

### Text Indexes
A full text search index or text index for short allows for searching documents for a partial string to return a full document.  This is created as `db.sentences.createIndex({'words':'text'});` then a query can be made as `db.sentences.find({{$text:{$search:'dog'}});`

These queries are not case-sensitive, do not require punctuation, and will omit some helper words like a, an, the.  The `$search` is a logical 'or' so a query of multiple words will return documents with any of those words.

### Efficiency of Index Use
Goal : Efficient Read/Write Operations
* Selectivity - minimize records scanned
* Other ops - How are sorts handled?

Selectivity is the biggest factor to determine index efficiency.  Sort is also important, especially if the sort has to happen in memory.

MongoDB does provide a way to force the db to use a specific index using the `hint()` method which is called after the cursor and any cursor operators.  The name or form of the index you want to use may be passed into the `hint()` call.

To enhance efficiency, it's generally advisable to create an index with the leftmost value being an equality field.

# Explain
Explain is used to understand what's happening during a particular query.  It's very useful to understandd performance and how the db requests are done. The explain option was called using `explain()` after the call in mongo versions prior to 3.0.  Starting in 3.0, it's preferable to use explain after the collection instead, then add the call.

The results of `explain()` returns the first action in the innermost document and can be traced up from there.

## Explainable objects
Creating an explainable object allows for explainable operations to be called on it.  Creating an explainable object is simply `exp = db.collection.explain()`.  `exp.help` would then show all potential operations for an explainable option.

## Explain Modes
1. query planner - the default mode explains what plan was used to fill the query
2. executionStats - includes the query planner mode and also tells what the result would have been if the planned query was run.
3. allPlansExecution - shows results as if all possible plans were executed.

# Logging and Profiling
## Logging
Mongo automatically logs slow queries (above 100ms) in a default file. This will show in the running mongod instance.

## Profiler
The profiler will log anything over a specified time to a system.profile file.  The profiler looks at three levels.
0 - profiler is off
1 - logs slow queries
2 - logs all queries (great for general debugging)

The profiler is run using the mongod command with `--profile 1 --slowms 2` which would turn on profiler level 1 and log any queries that take over 2ms.  These documents are logged in the `system.profile` collection which can then have queries ran against it.  E.g. `db.system.profile.find({millis:{$gt:1000}}).sort({ts:-1});`

You can check the profiling level in the mongo shell using `db.getProfilingLevel()`.
You can get profiling status using `db.getProfilingStatus()` and set profiling status using `db.setProfilingLevel(1,4)` which would turn on Profiling at level 1 logging any query that takes over 4ms to complete.  It can be turned off from the shell using `db.setProfilingLevel(0)`.


# Review on performance
1. Indexes are critical to performance.
2. Use explain to see how the DB is performing queries.
3. Use hint command to make the DB use a specific query plan.
4. Use profiling to understand slow queries.

# Mongotop
Mongotop is run using a time parameter as the command `mongotop 3` which would run mongotop every 3 seconds.  Mongotop will let you see how much time is being spent on certain types of operations within each database.

# Mongostat
The `mongostat` command is a performance tuning command.  It will sample the database in a 1 second increment and will give information on inserts, queries, updates, and deletes.  It will give different information based on the storage engine (mmap or wiredtiger).

#Sharding
Sharding is a technique for splitting up a large collection among multiple servers. In sharding, the application talke to `mongos`, which is a router, that then talks to several `mongod` servers. `mongos` is a range-based system based on a shard key.  To work with sharded databases, the insert command must include the shard key.  Also, if update/remove/find is used without the shard key, `mongos` will broadcast the request to all shards.  Performance is better if the shard key is included.

The `mongos` service is usually colocated on the same server as the application.
