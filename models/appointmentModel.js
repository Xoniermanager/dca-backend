const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    doctorId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    patientName : {
        type : String,
        required : [true, 'Patient name is required']
    },
    slotId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Slot'
    },
    prescriptionId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Prescription'
    },
    appointmentTime :  String,
    appointmentDate : Date,
    appointmentStartTime : String,
    appointmentEndTime : String,
    isPrescription :{
        type:Number,
        default : 0
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    orderStatus: String,
    joinUrl: String
});

module.exports = mongoose.model('Appointment', appointmentSchema);


