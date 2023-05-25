const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    drugName : {
        type : String,
        required : [true, 'Drug name is required']
    },
    drugGeneric : {
        type : String,
        required : [true, 'Drug generic is required']
    },
    drugNote : {
        type : String,
        required : [true, 'Drug node is required']
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

module.exports = mongoose.model('Drug', drugSchema);


