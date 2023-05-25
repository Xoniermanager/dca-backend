const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    departmentName : {
        type : String,
        required : [true, 'Department name is required']
    },
    departmentDescription : {
        type : String,
        required : [true, 'Department description is required']
    },
    icon : {
       public_id : String,
       url : String
    },
    createdAt : {
        type : Date,
        default : Date.now
    } 
});

module.exports = mongoose.model('Department', departmentSchema);


