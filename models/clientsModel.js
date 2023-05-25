const mongoose = require('mongoose');

const clientsSchema = new mongoose.Schema({
    clientTitle : {
        type : String,
        required : [true, 'Client title is required']
    },
    image : {
       public_id : String,
       url : String
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    
});

module.exports = mongoose.model('Client', clientsSchema);


