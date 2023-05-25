const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    patientId : {
        type : String,
        required : [true, 'Patient Id is required']
    },
    doctorId : {
        type : String,
        required : [true, 'Doctor Id is required']
    },
    status : {
        type : String,
        required : [true, 'Status is required']
    },
    orderId : {
        type : String,
        required : [true, 'Order Id is required']
    },
    amount : {
        type : Number,
        required : [true, 'Amount is required']
    },
    orderId : {
        type : String,
        required : [true, 'Order Id is required']
    },
    amount : {
        type : Number,
        required : [true, 'Amount is required']
    },
    createdAt : {
        type : Date,
        default : Date.now
    } 
});

module.exports = mongoose.model('Payment', paymentSchema);