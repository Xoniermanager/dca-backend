const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    faqQues : {
        type : String,
        required : [true, 'Faq question is required']
    },
    faqDescription : {
        type : String,
        required : [true, 'Faq description is required']
    },
    createdAt : {
        type : Date,
        default : Date.now
    } 
});

module.exports = mongoose.model('Faq', faqSchema);


