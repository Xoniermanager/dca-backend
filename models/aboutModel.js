const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    aboutTitle : {
        type : String,
        required : [true, 'Title is required']
    },
    aboutDescription : {
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

module.exports = mongoose.model('About', aboutSchema);


