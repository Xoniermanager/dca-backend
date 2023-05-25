const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const { sendEmail } = require('../middleware/sendEmail');
const cloudinary = require('cloudinary');
const Appointment = require('../models/appointmentModel');
const Prescription = require('../models/prescriptionModel');
const mongoose = require('mongoose');
const moment= require('moment') 
const Report = require('../models/reportModel');
 
  // add create patient
  exports.createPatient = catchAsyncErrors(async( req, res) => {
    try {
        let docts = [];
        const user = await User.findById(req.user._id);
        const password = 'Xonier@'+Math.floor(1000 + Math.random() * 9000);
        const patientData = req.body;
        patientData.password = password;
        docts.push(req.user._id);
        patientData.doctors = docts;
        const patient = await User.create(patientData);
        user.patients.push(patient._id);
        await user.save();
      const message = `Your login credential is given below: \n\n Email : ${patientData.email} \n\n Password : ${patientData.password}`;
      try {
        await sendEmail({
          email: patientData.email,
          subject: "Login creadential",
          message,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }

        res.status(200).json({
            success : true,
            message : 'Patient added successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });


    // update patient
    exports.updatePatient = catchAsyncErrors(async( req, res) => {
      try {
        const {userValue, patientId, profileImage} = req.body;
        const user = await User.findById(patientId);
         if(userValue.name){
          user.name = userValue.name
         }
         if(userValue.birthday){
          user.birthday = userValue.birthday
         }
         if(userValue.phone){
          user.phone = userValue.phone
         }
         if(userValue.gender){
          user.gender = userValue.gender
         }
         if(userValue.bloodgroup){
          user.bloodgroup = userValue.bloodgroup
         }
         if(userValue.address){
          user.address = userValue.address
         }
         if(userValue.weight){
          user.weight = userValue.weight
         }
         if(userValue.height){
          user.height = userValue.height
         }
        if(profileImage && Object.keys(profileImage).length !== 0){
          if(user.profileImage)
          await cloudinary.v2.uploader.destroy('mymedia/'+user.profileImage.public_id);
          const myCloud = await cloudinary.v2.uploader.upload(profileImage.avatar, {
            folder: "mymedia",
          });
          user.profileImage = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
      }
         await user.save();
         res.status(200).json({
              success : true,
              message : 'Patient updated successfully.'
          });
        } catch (error) {
          res.status(500).json({
            success : false,
            message : error.message
        })
        }
    });

    // add update language details
    exports.getPatient = catchAsyncErrors(async( req, res) => {
      try {
         const patient = await User.find({ $and: [
            {status:1}, 
            {role:'patient'},
            { doctors: { $in: [ req.user._id ] } }
        ]}).sort({_id:-1});
         res.status(200).json({
             success : true,
             patient
         });
       } catch (error) {
         res.status(500).json({
           success : false,
           message : error.message
        })
       }
    });

  
   // doctor list
      exports.getDoctors = catchAsyncErrors(async( req, res) => {
        try {
           const doctors = await User.find({ role : 'doctor'}).select('_id name');
           res.status(200).json({
               success : true,
               doctors
           });
         } catch (error) {
           res.status(500).json({
             success : false,
             message : error.message
          })
         }
      });

      
   // appointments list
   exports.getAppointments = catchAsyncErrors(async( req, res) => {
    try {
        const ObjectId = mongoose.Types.ObjectId;
       let userId = req.params.userId ?  ObjectId(req.params.userId) : req.user._id;
       const patientAppointments = await Appointment.aggregate([
        { $match: {  patientId : userId} },
        {
          $lookup: {
            from: "users",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctors"
          }
        },{$sort : {createdAt : -1}}
      ])

       res.status(200).json({
           success : true,
           patientAppointments
       });
     } catch (error) {
       res.status(500).json({
         success : false,
         message : error.message
      })
     }
  });

  //upcomming appointments list
  exports.getUpcommingAppointments = catchAsyncErrors(async( req, res) => {
    try {
        let now = new Date();
        let yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);
       const patientAppointments = await Appointment.aggregate([
        {$match: {"$and": [{  patientId : req.user._id}, {isPrescription: 0},{appointmentDate: {$gt: yesterday}}]}},
        {
          $lookup: {
            from: "users",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctors"
          }
        },{$sort : {appointmentDate : -1}}
      ])

       res.status(200).json({
           success : true,
           patientAppointments
       });
     } catch (error) {
       res.status(500).json({
         success : false,
         message : error.message
      })
     }
  });
  //completed appointments list
  exports.getCompletedAppointments = catchAsyncErrors(async( req, res) => {
    try {
       let dt = moment(new Date()).format('YYYY-MM-DD')+'T00:00:00.000+00:00';
       const patientAppointments = await Appointment.aggregate([
       {$match: {"$and": [{ patientId : req.user._id}, {isPrescription : { $eq: 1}} ]}},
        {
          $lookup: {
            from: "users",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctors"
          }
        },{$sort : {appointmentDate : -1}}
      ])

       res.status(200).json({
           success : true,
           patientAppointments
       });
     } catch (error) {
       res.status(500).json({
         success : false,
         message : error.message
      })
     } 
  });
    // get Prescriptions details
    exports.getPrescriptions = catchAsyncErrors(async( req, res) => {
    try {
      const patientAllPrescription =  await Prescription.aggregate([
        { $match : { $and: [{patientId : req.user._id}]}},
        {
          $lookup: {
            from: "users",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorDetail"
          }
        }
      ])

      await Prescription.populate(patientAllPrescription, {path: "drugs.drugId tests.testId"});

        if(!patientAllPrescription){
          return res.status(404).json({
              success : false,
              message : 'No prescriptions found'
          });
        }
        res.status(200).json({
            success : true,
            patientAllPrescription
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });


   // get prescription details by id
   exports.getPrescriptionDetails = catchAsyncErrors(async( req, res) => {
    try {
        const ObjectId = mongoose.Types.ObjectId;
        const prescriptions = await Prescription.aggregate([
          { $match : { $and: [{patientId : req.user._id}, {_id : ObjectId(req.params.presId) }]}},
          {
            $lookup: {
              from: "users",
              localField: "doctorId",
              foreignField: "_id",
              as: "doctorDetail"
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "patientId",
              foreignField: "_id",
              as: "patientDetail"
            }
          },
        ])

        await Prescription.populate(prescriptions, {path: "drugs.drugId tests.testId"});
        if(!prescriptions){
          return res.status(404).json({
              success : false,
              message : 'No prescription found'
          });
        }
        res.status(200).json({
            success : true,
            prescription : prescriptions[0]
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  // create report
  exports.createReport = catchAsyncErrors(async( req, res) => {
    try {
      let {formData, reportDocument} = req.body;
        let document = {};
        if(reportDocument && Object.keys(reportDocument).length !== 0){
          const myCloud = await cloudinary.v2.uploader.upload(reportDocument.document, {
            folder: "mymedia",
          });
          document = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
      }
      const reportData = {
        ...formData,
        patientId : req.user._id,
        document
      }
      //res.status(200).json({reportData});

      await Report.create(reportData);
      res.status(200).json({
        success : true,
        message : 'Report created successfully.'
    });
    } catch (error) {
       res.status(500).json({
        success : false,
        message : error.message
       })
    }
  });

   // reports list
   exports.getReports = catchAsyncErrors(async( req, res) => {
    try {
       const patientReports = await Report.find({patientId : req.user._id}).sort({reportDate:-1});
       res.status(200).json({
           success : true,
           patientReports
       });
     } catch (error) {
       res.status(500).json({
         success : false,
         message : error.message
      })
     }
  });

     // dashboard data
     exports.getDashboard = catchAsyncErrors(async( req, res) => {
      try {
         let dt = new Date();
         //console.log('dt',dt);
        let now = new Date();
        let yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);
        // var today = new Date().toISOString();
        // var today_last = new Date().toISOString();
        
        // const today = dt.toLocaleDateString(`fr-CA`).split('/').join('-');
        // console.log(today);

         const todayApp = await Appointment.aggregate([
          { $match:{patientId : req.user._id,appointmentDate: {$gt: yesterday}}},
          {
            $lookup: {
              from: "users",
              localField: "doctorId",
              foreignField: "_id",
              as: "doctors"
            }
          },{$sort: {_id: -1}} 
        ]);

        console.log(todayApp);
        
        const allApp = await Appointment.find({patientId : req.user._id});
        const allDoct = await User.find({_id : req.user._id}).select('doctors');
        const allPres = await Prescription.find({patientId : req.user._id});

        //console.log('todayApp',todayApp);
      
        let patientDashBoard = {
          allApp : allApp.length,
          allDoctors : allDoct.length,
          allPres : allPres.length,
          todayApp
        }

         res.status(200).json({
             success : true,
             patientDashBoard
         });
       } catch (error) {
         res.status(500).json({
           success : false,
           message : error.message
        })
       }
    });
 
    // submit reports
  exports.submitTestReport = catchAsyncErrors(async(req, res) => {
    try {
      let {formData} = req.body;
      let indexId = formData.indexId;
      let prescription = await Prescription.findOne({_id : formData.prescriptionId});
      await Report.deleteOne({prescriptionId : { $eq: formData.prescriptionId }, testId : { $eq: formData.testId }});
     
      let testArr = [];
      if(prescription && prescription.tests){
        testArr = prescription.tests.map((test)=> test.testId.toString());
      }

        let datas = {...formData};
        let myCloud = {};
        if(datas.report){
          if(datas.docs.public_id)
          await cloudinary.v2.uploader.destroy('report/'+datas.docs.public_id);
          myCloud = await cloudinary.v2.uploader.upload(datas.report, {
            folder: "report",
          });
          datas.document = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };

          if(testArr.includes(datas.testId)){
            prescription.tests[indexId] =  { testId : datas.testId, testDescription : datas.testDescription,
              _id : datas.presTestId, report : { public_id: myCloud.public_id, url: myCloud.secure_url}}
            await prescription.save();
          } 
        }else if(datas.report === '' && datas.docs){
          datas.document = {
            public_id: datas.docs.public_id,
            url: datas.docs.url,
          };

          if(testArr.includes(datas.testId)){
            prescription.tests[indexId] = { testId : datas.testId, testDescription : datas.testDescription, _id : datas.presTestId, report : {public_id: datas.docs.public_id, url: datas.docs.url}}
            await prescription.save();
          } 
        }
        await Report.create(datas);

      res.status(200).json({
        success : true,
        message : 'Report created successfully.'
    });
    } catch (error) {
       res.status(500).json({
        success : false,
        message : error.message
       })
    }
  });
