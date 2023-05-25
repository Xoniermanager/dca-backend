const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
    diseaseName : {
        type : String,
        required : [true, 'Disease name is required']
    },
    diseaseDescription : {
        type : String,
        required : [true, 'Disease description is required']
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    createdAt : {
        type : Date,
        default : Date.now
    } 
});

module.exports = mongoose.model('Disease', diseaseSchema);


