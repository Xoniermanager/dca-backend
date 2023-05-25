const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Name is required']
    },
    email : {
        type : String,
        required : [true, 'Email is required']
    },
    phone : {
        type : Number,
        required : [true, 'Phone no is required']
    },
    department : {
        type : String,
        required : [true, 'Department is required']
    },
    status : {
        type : Number,
        default : 0
    },
    message : {
        type : String,
        required : [true, 'Message is required']
    },
    createdAt : {
        type : Date,
        default : Date.now
    } 
});

module.exports = mongoose.model('Enquiry', enquirySchema);


