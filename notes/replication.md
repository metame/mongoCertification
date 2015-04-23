# Replication
How do we get availability and fault tolerance?

## Replica Set
A replica set is a set of mongo nodes that act together and mirror each other in terms of data. There is 1 primary and the secondary will replicate asynchronously. All the writes will go to the primary node. If the primary goes down, a new primary will be elected automatically and start taking all writes.

The minimum number of original nodes for a replica set is three.  This is so primary election can be accomplished if the original primary node goes down.

### Elections
The different types of nodes that can exist in a replica set:
* Regular (can be primary/secondary)
* Arbiter (no data on it; just for voting purposes)
* Delayed/Regular (often a disaster recovery node; can't be primary)
* Hidden (often used for analytics; never primary)

All these nodes can vote for new primary.

### Write Consistency
The writes always go to the primary where the reads can go to the secondary.  If you allow reads to go to the secondary nodes, you can read stale data because the replication is async. To ensure strong consistency that reads will be accurate, direct all reads to the primary.  

NOTE: During a failover/primary election (usually under 3 seconds), writes will not complete as there is no primary.

### Creating a replica set
A replica set is created by passing `--replSet name` to the `mongod` startup command, then running the `rs.initiate()` command with a config with all nodes entered.  If not entered in config, nodes can be added using `rs.add()`.

In the shell, `rs.status()` gives information about the replica set.  

When connected to secondary shells, write commands will never work.  Read commands will not work by default. To change this behavior enter `rs.slaveOk()` in the shell.

### Replica Set Internals
Each node in a replica set has an oplog, which will be kept in sync by mongo.  The secondaries will constantly read the oplog of the primary.  When a write is done, it will be in the oplog and the secondary will query the primary oplog to see what has changed.

The oplog is a capped collection, meaning that old entries will roll off.  The size of the oplog should be determined by how often the oplog will be updated on the primary.  If you have a lot of writes, then your oplog may need to be large.

You can have mixed mode storage engines on replica nodes.

### Failover and Rollback
Failover can result in rollback of data previously submitted if those writes were completed on the primary node but haven't been replicated yet.  When this happens, once the original primary is reestablished, the writes that do not show in the new primary are put into a rollback file.  This can be mostly prevented by setting `w=majority`.

### Connecting to a Replica Set in the Node.js Driver
Using the node driver to connect to a replica set requires passing all nodes within the `MongoClient.connect()` call, e.g.:
    MongoClient.connect("mongodb://localhost:30001,localhost:30002,localhost:30003/course", function(err, db) {
        <!--do stuff-->
    });
    
If you miss a node, the driver will automatically detect that the node listed is part of a replica set and will automatically discover the rest of the nodes.

### Replica Set Failover in the Node.js Driver
If the primary node is unavailable, the driver will buffer all writes and reads until the failover is complete.

### Read Preferences
The read preference is what node you want to read from.  There are several options for this:
* Primary
* Primary Preferred (primary, then secondary)
* Secondary
* Secondary Preferred (secondary, then primary)
* Nearest (based on ping time)

If you choose secondary, you will not have a strongly consistent read. You will have an eventually consistent read, which means you will eventually have the data on the secondary but may not be when you read it.

## Implications of Replication
* Seed Lists
* Write Concern
* Read Preferences
* Errors can happen
