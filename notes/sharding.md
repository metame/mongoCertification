# Sharding

## Introduction
Sharding is a way of scaling out by splitting up the documents in a database between multiple shards.  Each shard is also made up of a replica set.  These shards are managed through the mongos binary, which is a router.

Sharding is done by a range-based approach based on a shard key.  Once set, the shard key is required. If an update is called without passing the shard key, each shard will be queried to find the key to update.

## Building a Sharded Environment