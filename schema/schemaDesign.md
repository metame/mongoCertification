# MongoDB Schema Design

## Application-Driven Schema
In Mongo, it's more important to keep the data in a way that the application is using the data.  This is different from relational DBs as they are built to be application-agnostic.

## Some features/limitations of Mongo
* Rich Documents (not just tabular data)
* Pre Join/Embed Data as there are no mongo joins
* No constraints
* Atomic operations
* No Declared Schema

## Understanding 3rd Normal Form
Third normal form: every column in the table must be about the key, the whole key, and nothing but the key.
Goals of normalization:
* free the database of modification anomalies
* minimize redesign when extending
* avoid bias toward any particular access pattern

The last point is the most *disregarded* by MongoDB schema design.

## Blog Example

## Living Without Constraints
One of the things Relational is good at it is having foreign key constraints.  These constraints keep data consistent throughout the database.  MongoDB doesn't have any guaranteed constraints. It's up to the programmer to make this happen.

The answer to no Constraints : *Embedding*
Also referred to as pre-joining, it makes it a lot easier to keep the data in tact and consistent.

## Living Without Transactions
In the relational world, transactions offer atomicitiy, consistency, isolation, and durability.

The answer to no Transactions: *Atomic Operations*
Three approaches to overcoming transactions:
1. Restructure documents to be embedded/pre-joined.
2. Implement locking in software.
3. Tolerate a little bit of inconsistency.

## 1:1 Relations
1:1 Relations are where one item corresponds exactly to one item.
E.g.:
* Employee : Resume
* Building : Floor plan
* Patient : Medical History

Example of modeling an Employee : Resume relation:
1. Could model with two collections, one for employee & resume, with a key in each document linking the documents between collections.
2. We could embed one of the documents within the other.

### When to link and when to embed
Consider:
* Frequency of access
* Size of items
* Atomicity of data

## 1:Many
e.g. city : person
With a city like NYC with 8MM people, the best way to do it is with true linking

### True Linking
NYC & People
* People colletion with name & city
* city collection with all city attributes

But in one to few there could be something simpler

### One to Few
e.g. blog post : comments
In this case, it's feasible to have a collection of one, with an array of the other, i.e. embedding the few within the one.

## Many to Many Relations
There aren't many truly large many:many but instead often few:few.

### Books : Authors
In this case, two separate collections books and authors could work well with index references in one or both collections to the others. That is a book with _id : 12 would be referenced as book : 12 within the author's document.

### Students : Teachers
Still, two collections would make sense with array indices in each or just one depending on access patterns.

## Multikey Indexes
Taking the Students : Teachers example, there are two questions that may come up:
* What teachers have what students?
* What students have what teachers?
Basically, a multikey index is creating an index of a particular key within a document (which is an addition to the default index of _id).  This allows for efficient querying when links are built between collections.  Taking our example, if an index was created of the 'teachers' key within the 'students' collection, then querying what students had what teachers becomes very easy and efficient simply by using the linked indexes.

## Benefits of Embedding
The main benefit: *Improved Read Performance*
Disk reads are typically high latency and high bandwidth, meaning a single read request is better than multiple read requests.

## Trees
How to represent trees.
e.g. ecommerce site categories
Home : outdoors : Winter : Snow
Instead of referencing trees, use children and ancestors.
As children can be verbose, it may be much more concise to list ancestors in a single key as an array.  It's important to always keep access patterns in mind and how these trees are to be displayed within the application.

## When to Denormalize
* 1 : 1 - Embed
* 1 : Many - Embed (from the many to the one)
* Many : Many - Link
These general rules help mitigate risk of modification anamolies.


