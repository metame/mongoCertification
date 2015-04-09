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





