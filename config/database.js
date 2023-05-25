const mongoose = require('mongoose');

const connectDatabase = () => {

    mongoose.connect('mongodb+srv://pmxoniertech:trJX972xHYozpJ3g@cluster0.ve46t.mongodb.net/doctor?retryWrites=true&w=majority', {useNewUrlParser : true, useUnifiedTopology: true})
    .then((data)=>{
        console.log(`Mongodb connected with server : ${data.connection.host}`);
    })
}

module.exports = connectDatabase;