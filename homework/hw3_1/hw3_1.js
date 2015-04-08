var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/school', function(err, db) {
    if(err) console.error('Connect error:' + err);

    var students = db.collection('students');

    var cursor = students.find();

    cursor.each(function(err, student) {
        if(err) console.error('Cursor error:' + err);

        var cursorExhausted = false;

        if(student == null) {
            cursorExhausted = true;
        } else {

            var scores = student.scores;
        
            var hwScores = [];
    
            for(var i=0; i<scores.length; i++){
                if(scores[i].type == 'homework') {
                    hwScores.push({ 'index' : i, 'score' : scores[i].score });
                }
            }
    
            var hwDrop;
    
            if(hwScores[0].score <= hwScores[1].score){
                hwDrop = hwScores[0].index;
            } else {
                hwDrop = hwScores[1].index;
            }
    
            scores.splice(hwDrop,1);
    
            student['scores'] = scores;
    
            students.update({'_id' : student['_id']},student, function(err, updated) {
                if(err) console.error('Update error:' + err);
                
                console.log('successfully updated');
                if(cursorExhausted) {
                    return db.close();
                }
            });
        }

    });


});