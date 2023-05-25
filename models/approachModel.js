const mongoose = require('mongoose');

const approachSchema = new mongoose.Schema({
    Title : {
        type : String,
        required : [true, 'Title is required']
    },
    Description : {
        type : String,
        required : [true, 'Description is required']
    },
    image : {
       public_id : String,
       url : String
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('Approach', approachSchema);


