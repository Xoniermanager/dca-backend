const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    doctorId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    mon : Number,
    tue : Number,
    wed : Number,
    thu : Number,
    fri : Number,
    sat : Number,
    sun : Number,
    interval : Number,
    slotStartDate: Date,
    slotEndDate : Date,
    monIn: String,
    monOut: String,
    tueIn: String,
    tueOut: String,
    wedIn: String,
    wedOut: String,
    thuIn: String,
    thuOut: String,
    friIn: String,
    friOut: String,
    satIn: String,
    satOut: String,
    sunIn: String,
    sunOut: String,
    manageSlots:[
        {
           slotDate : Date,
           slots : [{
               slot : String
           }]
        }
    ],
    createdAt : {
        type : Date,
        default : Date.now
    } 
});

module.exports = mongoose.model('Slot', slotSchema);


