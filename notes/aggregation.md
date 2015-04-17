# Aggregation
The aggregation framework has its roots in the world of SQL's 'group by' clause.

## Simple Example of Aggregation
Taking a collection whose docs have keys for product name, manufacturer, price, etc, an aggregation function would look like this in the shell:
    db.products.aggregate([
        {$group:
            {
                _id:"$manufacturer",
                num_products:{$sum:1}
            }
        }
    ])

This command would return the manufacturer and the number of products by grouping all documents with the manufacturer and returning the sum of those docs.  The key to group by is preceded by the `$` and surrounded with double quotes and assigned the key `_id`. The results key can be named any valid key name, in this case `num_products`.  A result for this aggregation would be something like `{_id:Amazon,num_products:4}`.

## Aggregation Pipeline
collection | $project | $match | $group | $sort | result

Each item in the array within the aggregate function is one step in the pipeline.

### $project - reshape - 1 : 1

### $match - filter - n : 1

### $group - aggregate - n : 1

### $sort - sort - 1 : 1

### $skip - skips - n : 1

### $limit - limits - n : 1

### $unwind - normalize - 
e.g. `tags:["red","blue","green"]` would become normalized in separate documents as `{tags:red}` & `{tags:blue}` & `{tags:green}`

### $out - output - 1 : 1

### checkout in docs
$redact
$geonear

## Simple Aggregation Example Expanded
Taking the same example as far, we're going to go through what happens logically. 
The `$group` call goes through each document and creates a new collection from it with the output/schema specified in the call.  In this way, it kind of behaves like an upsert in that it's creating documents if they don't already exist but instead of updating/inserting in the current collection, it creates a new collection.

## Compound Grouping
Grouping by multiple keys.  Taking the same products/manufacturer example, we can create a compound grouping by creating a subdocument for the _id field, e.g.
    db.products.aggregate([
        {$group:
         {
            _id: {
                'manufacturer':"$manufacturer",
                'products':"$products"
                },
            num_products:{$sum:1}
         }
        }
    ])

There is no limit to how many group keys you can use for the `$group` call.

NOTE: This also brings up another general truth about mongoDB is that the `_id` field can be a document.  The only requirement is that it has to be unique.


## Aggregation Expressions
These are the valid aggregation expressions that can be used in the $group stage:
* $sum - counts number of docs with group key
* $avg - average values of a key across documents
* $min - finds minimum value of key across documents
* $max - finds maximum value of key across documents
* $push - pushes defined values to an array
* $addToSet - adds defined values to an array only if they don't already exists (like push with idempotency)
* $first - returns first value
* $last - returns last value
note: $first and $last are arbitrary if done before $sort stage.

### $group on null
Sometimes it's useful to use a $group stage expression on the entire collection set or the result set from another stage of the aggregation pipeline.  To do this simply set the $group key as `null`, e.g. `{$group:{_id:null, num_products:{$sum:1}}}`.

### Using $sum
$sum can be used to count like in the simple example or be used to retrieve the sum of integer values across docs.  In the simple example, the sum of the price of all the products in the group could be found by adding `sum_prices:{$sum:"$price"}` as a key to the $group stage document.

### Using $avg
$avg is used similar to sum with a key added to the simple example like `avg_prices:{$avg:"$price"}`

### Using $addToSet
If we wanted to find what categories each manufacturer sells in the simple example, we could add a key to the $group stage like `categories:{$addToSet:"$category"}` which would add each category listed in a document for each manufacturer and add that category value to an array if it doesn't already exist.

### Using $push
Like $addToSet you can use $push to create an array which will have duplicate entries if they happen to exist in the dataset.

### Using $max and $min
Like $sum or $avg, $max and $min will return the maximum or minimum value of a specific key, e.g. `maxprice:{$max:"$price"}`.

### Using $first and $last
This makes the most sense after the $sort stage.  Within the group call, a key could be added like `city: {$first: "$_id.city"}` which would return the first city value for each group.

## Double Group Stages
Within an aggregation pipeline, the $group stage can be called more than once.  Here's an example: `db.fun.aggregate([{$group:{_id:{a:"$a", b:"$b"}, c:{$max:"$c"}}}, {$group:{_id:"$_id.a", c:{$min:"$c"}}}])`

## Using $project
Some things $project can do:
* remove keys
* add new keys
* reshape keys
* use some simple functions on keys
    * $toUpper
    * $toLower
    * $add
    * $multiply

Example:
    db.products.aggregate([
        {$project:
         {
             _id:0,
             'maker':{$toLower:"$manufacturer"},
             'details':{'category': "$category",
                 'price':{"$multiply":["$price",10]}
             },
             'item':'$name'
         }
        }
    ])

A note about projection: Like in the shell to include or exclude keys from a $project result, a 0 or 1 can be used.  Only the _id key is included by default.

## Using $match
$match filters based on parameters.  Two reasons you may want to filter:
1. pre-agg filter
2. post-agg filter

Example:
    db.zips.aggregate([
        {$match:
         {
            state:"CA"
         }
        }
    ])

Note about $match and $sort: these two can use indexes but only if done at the beginning of the aggregation pipeline.

## Using $sort
$sort is called as you would expect within the aggregate array `{$sort:{city:-1}}`.

## Using $skip and $limit
Skip and limit should be used after $sort. Otherwise they're arbitrary.
Limit will most likely be used after skip.
They're used similarly: `{$skip:10},{$limit:5}`.

## Using $unwind
Unwind is used to reshape documents or unjoin data so that it can be used by other stages in the aggregation pipeline, most often $group.
This is called by `{$unwind:"$c"}` where the key "c" has a value which is an array.  This will result in a new document created for each value of "c".

Note: A grouping operator to reverse the effects of an $unwind would be $push.

### Double $unwind
A double $unwind can be used as two separate $unwind stages, e.g. `{$unwind: "$sizes"},{$unwind: "$colors"}`.

## Common SQL Examples
The mongo docs have some common SQL examples mapped to the MongoDB aggregation framework.

## Limitations in Aggregation
* 100 MB limit for pipeline stages. This can be circumvented through the `allowDiskUse` option for aggregation.
* 16MB limit if returning results in one document (which is the default in Python)
* sharded systems will collect all results from the aggregation pipeline if using $group or $sort which can hurt scalability. These limitations can be overcome by using a tool like Hadoop or the map/reduce functionality built into MongoDB for very simple tasks.


