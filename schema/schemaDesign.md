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

