const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    testName : {
        type : String,
        required : [true, 'Test name is required']
    },
    testDescription : {
        type : String,
        required : [true, 'Test description is required']
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

module.exports = mongoose.model('Test', testSchema);


