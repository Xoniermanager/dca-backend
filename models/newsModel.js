const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    newsTitle : {
        type : String,
        required : [true, 'News title is required']
    },
    newsDescription : {
        type : String,
        required : [true, 'News description is required']
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

module.exports = mongoose.model('News', newsSchema);


