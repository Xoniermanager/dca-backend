const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    doctorName : {
        type : String,
        required : [true, 'Doctor name is required']
    },
    reportDate : {
        type : Date,
        required : [true, 'Report date is required']
    },
    diagnosis : {
        type : String,
        required : [true, 'Diagnosis is required']
    },
    patientId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    testId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Test'
    },
    prescriptionId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Prescription'
    },
    document : {
        public_id : String,
        url :String
    },
    createdAt : {
        type : Date,
        default : Date.now
    } 
});

module.exports = mongoose.model('Report', reportSchema);


