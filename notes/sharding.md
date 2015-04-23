# Sharding

## Introduction
Sharding is a way of scaling out by splitting up the documents in a database between multiple shards.  Each shard is also made up of a replica set.  These shards are managed through the mongos binary, which is a router.

Sharding is done by a range-based approach based on a shard key.  Once set, the shard key is required. If an update is called without passing the shard key, each shard will be queried to find the key to update.

## Building a Sharded Environment
A chunk of data which represents a certain number of documents are stored on each shard.

You can do a range based shard or a hash-based shard. The shard key doesn't have to be unique but it does have to exist in every document in the DB.

To understand how to set up sharding, look at `init_sharded_env.sh`.

Basically a `mongod` will run for each replica set on each shard, then a config server will need to be run for each shard.

## Implications of Sharding on Development
* Every doc must include the shard key.
* Shard key is immutable
* Must have index that starts wtih the shard key and is not multi-key
* On update, shard key must be specified or `multi:true`
* No shard key => scatter/gather operation
* no unique key unless unless part of the shard key (because it can't enforce uniqueness without scattering)

## Choosing a Shard Key
It's important for performance to choose a good shard key.  Some concerns:
1 Sufficient cardinality
2 Avoid Hotspotting (monotonically increasing values)

# Sharding & Replication
You should expect a shard to be a replica set because of reliability.
Everything that is applicable to write concern and replication still applies, it just is run within each shard.