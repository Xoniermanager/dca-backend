const express = require('express');
const cors = require('cors');
const path = require("path");

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));

app.use(express.json());
app.use(cors());

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));


if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

// middleware for errors
const errorMiddleware = require('./middleware/error');
// routes import 
const user = require('./routes/userRoute');
const patient = require('./routes/patientRoute');
const admin = require('./routes/adminRoute');
const paymentRoute = require('./paymentRoute');
app.use('/api/v1',user);
app.use('/api/v1/patient',patient);
app.use('/api/v1/admin',admin);
app.use('/api/v1/payments',paymentRoute);


// app.use(express.static(path.join(__dirname, "../client/build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../client/build/index.html"));
// });

app.use(errorMiddleware);
module.exports = app;
