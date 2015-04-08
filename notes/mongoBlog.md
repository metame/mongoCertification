# Modeling our Blog in Mongo
## Collections
### posts
{title: "Free online Classes", body: "...", author: "erlchson", date: "...", comments: [{name: 'Joe Biden', email: "joe@whitehouse.gove", comment: "..." }], tags:['cycling', 'education','startups']}

### authors
{_id:"erlchson", password: "..."}

### Displaying blog home page
Only one collection would be needed as the author's name is in the posts collection
