const mongoose = require('mongoose');

const servicesSchema = new mongoose.Schema({
    serviceTitle : {
        type : String,
        required : [true, 'Service title is required']
    },
    serviceDescription : {
        type : String,
        required : [true, 'Service description is required']
    },
    image : {
       public_id : String,
       url : String
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    slug : String
});

module.exports = mongoose.model('Service', servicesSchema);


