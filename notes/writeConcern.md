# Write Concern
Making sure the writes we make to the database persist so we can read them.

## What happens on the server
On the server, the DB is mostly stored on Disk.  When making a DB call, the Pages in memory(RAM) will be updated, which wiill at some point write to the disk.  The update/write is also going to be written in the Journal (also stored in memory).

When doing an update in MongoDB, the update is being done in Memory and at some point (maybe a few seconds later) it will be written to disk.  If the server crashed before it was written to disk, then that data would not persist to disk and would be lost.

## The Write Concern
The w value & j value.
By default `w:1,j:0`. This means we're going to wait for the write to be acknowledged but we're not going to wait for the journal to sync to disk.  If we want to wait for the journal to sync, we can by setting `j:1` which would be slower but would increase persistence.

# Network Errors
If you don't get an affirmative response back from your call, the operation could have still completed.  This is becuase of network errors. It is possible to guard against this with an insert by having built-in idempotency, but through an update there is that chance (e.g. with `$inc`).

To avoid all network errors at all costs you should change your updates to inserts.



