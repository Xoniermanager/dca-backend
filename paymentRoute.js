require("dotenv").config();
const formidable = require("formidable");
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const https = require("https");
const PaytmChecksum = require("./PaytmChecksum");

const ObjectId = require("mongodb").ObjectID;

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb+srv://pmxoniertech:Xonier2022@cluster0.ve46t.mongodb.net/";

var merchantId = "";
var merchantkey = "";

router.post("/callback", (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, file) => {
    paytmChecksum = fields.CHECKSUMHASH;

    delete fields.CHECKSUMHASH;

    var isVerifySignature = PaytmChecksum.verifySignature(
      fields,
      merchantkey,
      paytmChecksum
    );
    if (isVerifySignature) {
      var paytmParams = {};
      paytmParams["MID"] = fields.MID;
      paytmParams["ORDERID"] = fields.ORDERID;

      /*
       * Generate checksum by parameters we have
       * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
       */
      PaytmChecksum.generateSignature(paytmParams, merchantkey).then(function (
        checksum
      ) {
        paytmParams["CHECKSUMHASH"] = checksum;

        var post_data = JSON.stringify(paytmParams);

        var options = {
          /* for Staging */
          //https://securegw-stage.paytm.in/
          hostname: "securegw-stage.paytm.in",

          /* for Production */
          // hostname: 'securegw.paytm.in',

          port: 443,
          path: "/order/status",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };

        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });

          post_res.on("end", function () {
            let result = JSON.parse(response);
            //console.log('result',result);
            if (result.STATUS === "TXN_SUCCESS") {
              //store in db
              MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                // db pointing to newdb
                var dbo = db.db("doctor");
                let dts = new Date(result.TXNDATE);
                let update =
                  dts.getFullYear() +
                  "-" +
                  (dts.getUTCMonth() > 10
                    ? dts.getUTCMonth() + 1
                    : "0" + (dts.getUTCMonth() + 1)) +
                  "-" +
                  (dts.getDate() > 10 ? dts.getDate() : "0" + dts.getDate());
                var doc = {
                  $set: {
                    status: "Completed",
                    txnId: result.TXNID,
                    paymentMode: result.PAYMENTMODE,
                    bankName: result.BANKNAME,
                    gatewayName: result.GATEWAYNAME,
                    bankTxnId: result.BANKTXNID,
                    updatedDate: update,
                  },
                };
                var myquery = { orderId: result.ORDERID };
                // insert document to 'users' collection using insertOne
                dbo
                  .collection("payments")
                  .updateOne(myquery, doc, function (err, res) {
                    if (err) throw err;
                  });

                var apointQuery = { slotId: ObjectId(result.ORDERID) };
                var docQuery = {
                  $set: {
                    orderStatus: "Completed",
                    joinUrl:
                      "https://single-doctor-app-video-chat.herokuapp.com/" +
                      result.ORDERID,
                  },
                };

                dbo
                  .collection("appointments")
                  .updateOne(apointQuery, docQuery, function (err, res) {
                    if (err) throw err;

                    //console.log('update');
                    db.close();
                  });
              });
              //console.log('success');
            }

            res.redirect(
              `http://localhost:3000/payment-status/${result.ORDERID}`
            );
          });
        });

        post_req.write(post_data);
        post_req.end();
      });
    } else {
      console.log("Checksum Mismatched");
    }
  });
});

router.post("/payment", (req, res) => {
  const { amount, email, name, phone, orderId, doctorId, patientId } = req.body;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("doctor");

    dbo
      .collection("users")
      .findOne({ _id: ObjectId(doctorId) }, function (err, result) {
        if (err) throw err;

        //console.log('credentails',result);
        merchantId = result.marchantId;
        merchantkey = result.marchantKey;

        const totalAmount = JSON.stringify(amount);
        var params = {};

        /* initialize an array */
        (params["MID"] = merchantId),
          (params["WEBSITE"] = process.env.PAYTM_WEBSITE),
          (params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID),
          (params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE_ID),
          (params["ORDER_ID"] = orderId),
          (params["CUST_ID"] = process.env.PAYTM_CUST_ID),
          (params["TXN_AMOUNT"] = totalAmount),
          (params["CALLBACK_URL"] =
            "http://localhost:5000/api/v1/payments/callback"),
          (params["EMAIL"] = email),
          (params["MOBILE_NO"] = "" + phone + "");

        //console.log("param", params);

        var paytmChecksum = PaytmChecksum.generateSignature(
          params,
          merchantkey
        );
        paytmChecksum
          .then(function (checksum) {
            let paytmParams = {
              ...params,
              CHECKSUMHASH: checksum,
            };
            res.json(paytmParams);
            //console.log('checksum',paytmParams);

            MongoClient.connect(url, function (err, db) {
              if (err) throw err;
              // db pointing to newdb

              var dbo = db.db("doctor");
              //console.log("Switched to "+dbo.doctors_clone+" database");

              // document to be inserted
              var doc = {
                patientId: patientId,
                patientName: name,
                patientPhone: phone,
                doctorId: doctorId,
                status: "Pending",
                orderId: orderId,
                amount: totalAmount,
              };

              // insert document to 'users' collection using insertOne
              dbo.collection("payments").insertOne(doc, function (err, res) {
                if (err) throw err;
                //console.log("Document inserted");
                // close the connection to db when you are done with it
                db.close();
              });
            });
          })
          .catch(function (error) {
            console.log(error);
          });
        // console.log("m_key", merchantkey);
        // console.log("m_id", merchantId);
        db.close();
      });
  });

  /* import checksum generation utility */
});

//doctor payment

router.post("/paymentByDoctor", (req, res) => {
  const { amount, email, name, phone, orderId, doctorId, patientId } = req.body;

  /* import checksum generation utility */
  const totalAmount = JSON.stringify(amount);
  var params = {};

  /* initialize an array */
  (params["MID"] = process.env.PAYTM_MID),
    (params["WEBSITE"] = process.env.PAYTM_WEBSITE),
    (params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID),
    (params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE_ID),
    (params["ORDER_ID"] = orderId),
    (params["CUST_ID"] = process.env.PAYTM_CUST_ID),
    (params["TXN_AMOUNT"] = totalAmount),
    (params["CALLBACK_URL"] =
      "http://localhost:5000/api/v1/payments/callbackByDoctors"),
    (params["EMAIL"] = email),
    (params["MOBILE_NO"] = phone);

  //console.log("param", params);

  /**
   * Generate checksum by parameters we have
   * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
   */
  var paytmChecksum = PaytmChecksum.generateSignature(
    params,
    process.env.PAYTM_MERCHANT_KEY
  );
  paytmChecksum
    .then(function (checksum) {
      let paytmParams = {
        ...params,
        CHECKSUMHASH: checksum,
      };
      res.json(paytmParams);
      //console.log('checksum',paytmParams);

      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        // db pointing to newdb

        var dbo = db.db("doctor");
        //console.log("Switched to "+dbo.doctors_clone+" database");

        // document to be inserted
        var doc = {
          patientId: patientId,
          patientName: name,
          patientPhone: phone,
          doctorId: doctorId,
          status: "Pending",
          orderId: orderId,
          amount: totalAmount,
        };

        // insert document to 'users' collection using insertOne
        dbo.collection("payments").insertOne(doc, function (err, res) {
          if (err) throw err;
          //console.log("Document inserted");
          // close the connection to db when you are done with it
          db.close();
        });
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post("/callbackByDoctors", (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, file) => {
    paytmChecksum = fields.CHECKSUMHASH;

    delete fields.CHECKSUMHASH;

    var isVerifySignature = PaytmChecksum.verifySignature(
      fields,
      process.env.PAYTM_MERCHANT_KEY,
      paytmChecksum
    );
    if (isVerifySignature) {
      var paytmParams = {};
      paytmParams["MID"] = fields.MID;
      paytmParams["ORDERID"] = fields.ORDERID;

      /*
       * Generate checksum by parameters we have
       * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
       */
      PaytmChecksum.generateSignature(
        paytmParams,
        process.env.PAYTM_MERCHANT_KEY
      ).then(function (checksum) {
        paytmParams["CHECKSUMHASH"] = checksum;

        var post_data = JSON.stringify(paytmParams);

        var options = {
          /* for Staging */
          //https://securegw-stage.paytm.in/
          hostname: "securegw-stage.paytm.in",

          /* for Production */
          // hostname: 'securegw.paytm.in',

          port: 443,
          path: "/order/status",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };

        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });

          post_res.on("end", function () {
            let result = JSON.parse(response);
            //console.log("result", result);
            if (result.STATUS === "TXN_SUCCESS") {
              //store in db
              MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                // db pointing to newdb
                var dbo = db.db("doctor");
                let dts = new Date(result.TXNDATE);
                let update =
                  dts.getFullYear() +
                  "-" +
                  (dts.getUTCMonth() > 10
                    ? dts.getUTCMonth() + 1
                    : "0" + (dts.getUTCMonth() + 1)) +
                  "-" +
                  (dts.getDate() > 10 ? dts.getDate() : "0" + dts.getDate());
                var doc = {
                  $set: {
                    status: "Completed",
                    txnId: result.TXNID,
                    paymentMode: result.PAYMENTMODE,
                    bankName: result.BANKNAME,
                    gatewayName: result.GATEWAYNAME,
                    bankTxnId: result.BANKTXNID,
                    updatedDate: update,
                  },
                };
                var myquery = { orderId: result.ORDERID };
                // insert document to 'users' collection using insertOne
                dbo
                  .collection("payments")
                  .updateOne(myquery, doc, function (err, res) {
                    if (err) throw err;
                    //console.log("Document Updated");
                    // close the connection to db when you are done with it
                    db.close();
                  });
              });
              //console.log('success');
            }

            res.redirect(
              `http://localhost:3000/payment-status/${result.ORDERID}`
            );
          });
        });

        post_req.write(post_data);
        post_req.end();
      });
    } else {
      console.log("Checksum Mismatched");
    }
  });
});

module.exports = router;
