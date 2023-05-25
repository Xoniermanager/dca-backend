const mongoose = require('mongoose');
require('./userModel');

const experienceSchema = new mongoose.Schema({
    experience : {
        type : String,
        required : [true, 'Experience is required']
    }, 
    expYear : {
        type : String,
        required : [true, 'Experience year is required']
    },
    doctorId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'userModel'
    },
    createdAt :{
        type : Date,
        default : Date.now
    },
})

module.exports = mongoose.model('experiences', experienceSchema);