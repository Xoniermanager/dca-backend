const mongoose = require('mongoose');

const storiesSchema = new mongoose.Schema({
    storiesTitle : {
        type : String,
        required : [true, 'Stories title is required']
    },
    storiesDescription : {
        type : String,
        required : [true, 'Stories description is required']
    },
    storiesAuthor : {
        type : String,
        required : [true, 'Stories author is required']
    },
    image : {
       public_id : String,
       url : String
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    slug : String
});

module.exports = mongoose.model('Stories', storiesSchema);


