const mongoose = require('mongoose');
require('./userModel');

const awardSchema = new mongoose.Schema({
    awardName : {
        type : String,
        required : [true, 'Award name is required']
    }, 
    awardImage : {
        type : String
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

module.exports = mongoose.model('awards', awardSchema);