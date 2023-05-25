const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const Drug = require('../models/drugModel');
const Test = require('../models/testModel');
const Payment = require('../models/paymentModel');
const Slot = require('../models/slotsModel');
const Enquiry = require('../models/enquiryModel');
const Appointment = require('../models/appointmentModel');
const Prescription = require('../models/prescriptionModel');
const { sendEmail } = require('../middleware/sendEmail');
const News = require('../models/newsModel');
const cloudinary = require('cloudinary');
const moment = require('moment');

const mongoose = require('mongoose');

//  user enquiry
exports.userEnquiry = catchAsyncErrors(async (req, res) => {
  try {
    const enquiryData = { ...req.body }
    const enq = await Enquiry.create(enquiryData);
    const message = '<html><body> <h3 style="text-align:center;"> New Enquiry </h3> <table width="100%" style="table-layout:fixed; min-height:750px;"> <tbody><tr><td align="center" valign="top" style="padding-right:10px;padding-left:10px;">  <table style="max-width:600px;" width="100%"> <tbody><tr> <td align="center" valign="top"> <table style="border:1px solid #E5E5E5;" width="100%"> <tbody>  <tr>  <td colspan="2" style="color:#fff; background:#0e76bc;text-align:center;padding:10px 0;"> <a href="#" target="_blank" style="margin:auto;text-align:center;text-decoration:none;"> <center>	<img src="https://xoniertechnologies.com/assets/uploads/logo/dd5a61da6f0e50fea2ac4f86b60406c4.png"   alt="" border="0" style="width:150px; height:auto; display:block;"> </center></a>  </td> </tr>  <tr>     <td align="center" valign="top" style="padding-bottom: 5px; padding-left: 20px; padding-right: 20px;">  <h2 class="text" style="color:#000000; font-family: Helvetica, Arial, sans-serif; font-size:28px; font-weight:500;  text-align:center; padding:0; margin:10px 0;"> </h2>   </td>  </tr>       <td align="center" style="padding-left:20px;padding-right:20px;">  <table border="0" width="100%"><tbody>  <tr width="100%">   <td valign="top" style="padding-bottom: 10px;">  <span class="text" style="font-weight:bold; font-family:Arial;">  Name:</span> </td>   <td valign="top" style="padding-bottom: 10px;"> <span style="font-family:Arial;">' + enquiryData.name + '</span> </td> </tr><tr width="100%"><td valign="top" style="padding-bottom: 10px;"> <span class="text" style="font-weight:bold; font-family:Arial;"> Email:</span> </td> <td valign="top" style="padding-bottom: 10px;"><span style="font-family:Arial;">' + enquiryData.email + '</span></td></tr><tr width="100%"><td valign="top" style="padding-bottom: 10px;"><span class="text" style="font-weight:bold; font-family:Arial;">Phone:</span> </td> <td valign="top" style="padding-bottom: 10px;"><span style="font-family:Arial;">' + enquiryData.phone + '</span> </td> </tr><tr width="100%"><td valign="top" style="padding-bottom: 10px;"> <span class="text" style="font-weight:bold; font-family:Arial;"> Department:</span>  </td>  <td valign="top" style="padding-bottom: 10px;"> <span style="font-family:Arial;"> ' + enquiryData.department + '</span>  </td></tr>	 <tr width="100%"> <td valign="top" style="padding-bottom: 10px;"> <span class="text" style="font-weight:bold; font-family:Arial;">Message:</span>  </td>  <td valign="top" style="padding-bottom: 10px;"> <span style="font-family:Arial;"> ' + enquiryData.message + '</span>   </td>   </tr>	  </tbody></table>  </td>  </tr>   <tr>  <td colspan="2" style="color:#fff; background:#0e76bc;font-family: Helvetica, Arial, sans-serif; font-size:14px; font-weight:bold;font-style:normal; letter-spacing:normal; text-transform:none; text-align:center;padding:20px 0;">  © 2022 All Rights Reserved. </td></tr>  </tbody>  </table>   </td>   </tr> </tbody> </table> </td>     </tr></tbody> </table></body> </html>';
    try {
      await sendEmail({
        email: process.env.SMTP_EMAIL,
        subject: "Equiry email",
        message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})

// register user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    //console.log('sdacsdc',req.body);
    let user = '';
    //let email = req.body.email;
    const uData = {
      name, email, password, role, phone
    }
    if (role === 'doctor') {
      if (req.body.certificate!='') {
        const myCloud = await cloudinary.v2.uploader.upload(req.body.certificate, {
          folder: "certificate",
        });
        uData.certificate = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      uData.status = 0;
      uData.departmentId = req.body.departmentId;
      uData.department = req.body.department;
      uData.specialist = req.body.department;
      user = await User.create(uData);
      
    } else if (role === 'patient') {
      user = await User.create(uData);
      //console.log('success');
    }
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/verify/email/${user._id}`;

    //const message = `Verify Your account by clicking on the link below: \n\n ${resetUrl}`;

    const message = '<!doctype html><html lang="en-US"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type" /><style type="text/css">a:hover {text-decoration: underline !important;}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: Open Sans, sans-serif;"><tr><td><table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"align="center" cellpadding="0" cellspacing="0"><tr><td style="height:80px;">&nbsp;</td></tr><tr><td style="text-align:center;"><a href="https://single-doctor-app.herokuapp.com" title="logo" target="_blank"><img src="https://xoniertest.herokuapp.com/static/media/logo.284e09e3de1410fc2c1e.png" title="logo" alt="logo" style="width:150px;" title="logo" alt="logo"></a></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td><table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px; background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tr><td style="height:40px;">&nbsp;</td></tr><tr><td style="padding:0 35px;"><h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:Rubik,sans-serif;">Get started</h1><p style="font-size:15px; color:#455056; margin:8px 0 0; line-height:24px;">Your account has been created on the Xonier e-Doctor Care.  Below are your login credentials, <br><strong>Please verified the email immediately before login</strong>.</p><span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span><p style="color:#455056; font-size:18px;line-height:20px; margin:0; font-weight: 500;"><strong style="display: block;font-size: 13px; margin: 0 0 4px; color:rgba(0,0,0,.64); font-weight:normal;">Username</strong>'+ req.body.email +'<strong style="display: block; font-size: 13px; margin: 24px 0 4px 0; font-weight:normal; color:rgba(0,0,0,.64);">Password</strong>'+ req.body.password +'</p><a href="'+ resetUrl +'" style="background:#20e277;text-decoration:none !important; display:inline-block; font-weight:500; margin-top:24px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Click to verify email</a></td></tr><tr><td style="height:40px;">&nbsp;</td></tr></table></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td style="text-align:center;"><p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.xoniertechnologies.com</strong> </p></td></tr><tr><td style="height:80px;">&nbsp;</td></tr></table></td></tr></table></body></html>';

    try {
      await sendEmail({
        email: user.email,
        subject: "Verify email",
        message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    res.status(201).json({
      success: true,
      message: 'Registration successfully. Please check and verify your email.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})

// login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  // checking user have given email and password both
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email or password", 400));
  }
  const user = await User.findOne({ email, role }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid entered email or password", 401));
  }
  if (!user.isVerify) {
    return next(new ErrorHandler("Please verify your email first", 401));
  }
  if (!user.status) {
    return next(new ErrorHandler("Your account is not activated by admin", 401));
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(200).json({
      success: false,
      message: 'Invalid entered email or password'
    })
  }
  const authToken = user.getJWTToken();
  res.status(200).json({
    success: true,
    message: 'Login successfully',
    user,
    authToken
  })
})


// filter doctors
exports.searchDoctors = catchAsyncErrors(async (req, res) => {
  try {
    const doctors = await User.find({
      role: 'doctor', status: 1, $or: [
        { name: { '$regex': `^${req.params.key}`, '$options': 'i' } },
        { specialist: { '$regex': `^${req.params.key}`, '$options': 'i' } }
      ]
    });
    res.status(200).json({
      success: true,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

//  user profile
exports.myProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})


//  doctor details by id
exports.getDoctorDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.doctId);
    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})

// verify user email
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { 'status': 1, 'isVerify': 1 } });
    // console.log(req.protocol);
    // console.log(req.get("host"));
    res.redirect(`${req.protocol}://${req.get("host")}/user-verified`);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})

// forget password
exports.forgotPassword = catchAsyncErrors(async (req, res) => {
  try {
    //console.log(req.body.email);
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //console.log('user',user);

    const resetPasswordToken = user.getResetPasswordToken();

    await user.save();

    //const message = `Reset Your Password by clicking on the link below: \n\n Use this otp for reset password \n\n OTP : ${resetPasswordToken}`;

    const message = '<!doctype html><html lang="en-US"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type" /><style type="text/css">a:hover {text-decoration: underline !important;}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: Open Sans, sans-serif;"><tr><td><table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"align="center" cellpadding="0" cellspacing="0"><tr><td style="height:80px;">&nbsp;</td></tr><tr><td style="text-align:center;"><a href="https://single-doctor-app.herokuapp.com" title="logo" target="_blank"><img src="https://xoniertest.herokuapp.com/static/media/logo.284e09e3de1410fc2c1e.png" title="logo" alt="logo" style="width:150px;" title="logo" alt="logo"></a></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td><table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px; background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tr><td style="height:40px;">&nbsp;</td></tr><tr><td style="padding:0 35px;"><h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:Rubik,sans-serif;">One Time Password</h1><p style="font-size:15px; color:#455056; margin:8px 0 0; line-height:24px;">Hi, Thankyou for choosing XT-DOCTOR use the following OTP to complete your forgot password procedure. <br> <strong>Please Do not share with anyone</strong>.</p><span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span><p style="color:#455056; font-size:18px;line-height:20px; margin:0; font-weight: 500;"><strong style="display: block;font-size: 13px; margin: 0 0 4px; color:rgba(0,0,0,.64); font-weight:normal;">OTP</strong>'+ resetPasswordToken +'</p></td></tr><tr><td style="height:40px;">&nbsp;</td></tr></table></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td style="text-align:center;"><p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.xoniertechnologies.com</strong> </p></td></tr><tr><td style="height:80px;">&nbsp;</td></tr></table></td></tr></table></body></html>';

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
      console.log('email',user.email);
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// validate otp
exports.resetOTP = catchAsyncErrors(async (req, res) => {
  try {
    const resetPasswordToken = req.body.otp;
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      userId: user._id,
      message: "Validated otp",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// Reset password
exports.resetPassword = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User Id is invalid",
      });
    }
    user.password = req.body.password;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// update password
exports.updatePassword = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide old and new password",
      });
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Old password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.updateCredentail = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    //console.log('id',req.user._id);
    const { marchantId, marchantKey } = req.body;
    if (marchantId) {
      user.marchantId = marchantId;
    }
    if (marchantKey) {
      user.marchantKey = marchantKey;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: "Credentails Updated",
    });
    //console.log('message',message);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

});
//paytm payment
// exports.paytmPayment = catchAsyncErrors(async( req, res) => {
//   try {


//      res.status(200).json({
//          success : true,
//          message : 'Profile updated'
//      });
//    } catch (error) {
//      res.status(500).json({
//        success : false,
//        message : error.message
//     })
//    }
// });
// add update doctor details
exports.updateProfile = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, academic, specialist, departmentId, department, about, profileImage, patientNo, surgery, experienceYear } = req.body;
    if (name) {
      user.name = name;
    }
    if (academic) {
      user.academic = academic;
    }
    if (specialist) {
      user.specialist = specialist;
    }
    if (departmentId) {
      user.departmentId = departmentId;
    }
    if (department) {
      user.department = department;
    }
    if (about) {
      user.about = about;
    }
    if (patientNo) {
      user.patientNo = patientNo;
    }
    if (surgery) {
      user.surgery = surgery;
    }
    if (experienceYear) {
      user.experienceYear = experienceYear;
    }
    if (profileImage && Object.keys(profileImage).length !== 0) {
      if (user.profileImage)
        await cloudinary.v2.uploader.destroy('mymedia/' + user.profileImage.public_id);
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
      success: true,
      message: 'Profile updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});
exports.updateFee = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { fee } = req.body;
    if (fee) {
      user.fee = fee;

    }

    await user.save();
    res.status(200).json({
      success: true,
      message: 'Appointment Fee updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }

});
exports.updateEmailTemplate = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { email_template } = req.body;
    if (email_template) {
      user.email_template = email_template;

    }

    await user.save();
    res.status(200).json({
      success: true,
      message: 'Email Template Updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }

});


// add update language details
exports.updateLanguage = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { videoUrl, langArr } = req.body;
    if (videoUrl) {
      user.videoIntroUrl = videoUrl;
    }
    if (langArr) {
      user.languages = langArr;
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Language updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// add update Experience details
exports.updateExperience = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { expValue } = req.body;
    let docExp = '';
    if (expValue) {
      user.experiences = expValue;
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Experience updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// add update Accademic Awards details
exports.updateAccademicAward = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { clinicAddr, docterAcademic, doctorAward } = req.body;
    if (clinicAddr) {
      user.clinic_details = clinicAddr;
    }
    if (docterAcademic) {
      user.academic_details = docterAcademic;
    }
    let arr = [];
    if (doctorAward) {
      let row = {};
      for (let i = 0; i < doctorAward.length; i++) {
        row.awardName = doctorAward[i].awardName;
        if (doctorAward[i].awardImage) {
          const myCloud = await cloudinary.v2.uploader.upload(doctorAward[i].awardImage, {
            folder: "mymedia",
          });
          row.awardImage = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          }
          arr.push({ ...row });
        }
      }
    }
    user.awards = arr;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Experience updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// create drug
exports.createDrug = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const drugData = {
      ...req.body,
      owner: req.user._id,
    }
    const newDrug = await Drug.create(drugData);
    user.drugs.push(newDrug._id);
    await user.save();

    res.status(201).json({
      success: true,
      newDrug,
      message: 'Drug added successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});


// Update drug
exports.updateDrug = catchAsyncErrors(async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Drug not found'
      })
    }

    if (drug.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorised'
      })
    }

    if (req.body.drugName) {
      drug.drugName = req.body.drugName;
    }
    if (req.body.drugGeneric) {
      drug.drugGeneric = req.body.drugGeneric;
    }
    if (req.body.drugNote) {
      drug.drugNote = req.body.drugNote;
    }

    await drug.save();

    res.status(201).json({
      success: true,
      message: 'Drug updated successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// detele drug
exports.deleteDrug = catchAsyncErrors(async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Drug not found'
      })
    }

    //  if(drug.owner.toString() !== req.user._id.toString()){
    //      return res.status(401).json({
    //          success : false,
    //          message : 'Unauthorised'
    //      })
    //  }
    await drug.remove();
    let user = await User.findById(req.user._id);
    let index = user.drugs.indexOf(req.params.id);
    user.drugs.splice(index, 1);
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Drug deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// get drug details by id
exports.getDrugDetails = catchAsyncErrors(async (req, res) => {
  try {
    //owner : req.user._id,
    const drug = await Drug.findOne({ _id: req.params.id });

    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'No drug found'
      });
    }
    res.status(200).json({
      success: true,
      drug
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// get drugs details
exports.getDrugs = catchAsyncErrors(async (req, res) => {
  try {
    //{owner : req.user._id}
    const drug = await Drug.find().sort({ drugName: 1 });
    res.status(200).json({
      success: true,
      drug
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// create test
exports.createTest = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const testData = {
      ...req.body,
      owner: req.user._id,
    }
    const newTest = await Test.create(testData);
    user.tests.push(newTest._id);
    await user.save();

    res.status(201).json({
      success: true,
      newTest,
      message: 'Test added successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});


// Update test
exports.updateTest = catchAsyncErrors(async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      })
    }

    if (test.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorised'
      })
    }

    if (req.body.testName) {
      test.testName = req.body.testName;
    }
    if (req.body.testDescription) {
      test.testDescription = req.body.testDescription;
    }
    await test.save();

    res.status(201).json({
      success: true,
      message: 'Test updated successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// get tests details
exports.getTests = catchAsyncErrors(async (req, res) => {
  try {
    //{owner : req.user._id}
    const tests = await Test.find().sort({ testName: 1 });;
    if (!tests) {
      return res.status(404).json({
        success: false,
        message: 'No tests found'
      });
    }
    res.status(200).json({
      success: true,
      tests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});


// get test details by id
exports.getTestDetails = catchAsyncErrors(async (req, res) => {
  try {
    ///owner : req.user._id,
    const test = await Test.findOne({ _id: req.params.id });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'No test found'
      });
    }
    res.status(200).json({
      success: true,
      test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// detele test
exports.deleteTest = catchAsyncErrors(async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      })
    }
    // if(test.owner.toString() !== req.user._id.toString()){
    //     return res.status(401).json({
    //         success : false,
    //         message : 'Unauthorised' 
    //     })
    // }
    await test.remove();
    let user = await User.findById(req.user._id);
    let index = user.tests.indexOf(req.params.id);
    user.tests.splice(index, 1);
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Test deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// create prescription
exports.createPrescription = catchAsyncErrors(async (req, res) => {
  try {
    const { selectPatient, drugValue, testValue } = req.body;

    const appointment = await Appointment.findById(selectPatient.appointmentId);
    let testData = [];
    if (testValue[0].testId) {
      testData = testValue;
    }

    const prescriptionData = {
      ...selectPatient,
      drugs: drugValue,
      tests: testData,
      doctorId: req.user._id,
    }
    let presData = await Prescription.create(prescriptionData);

    appointment.isPrescription = 1;
    appointment.prescriptionId = presData._id;

    await appointment.save();
    res.status(201).json({
      success: true,
      message: 'Prescription added successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});


// update prescription
exports.updatePrescription = catchAsyncErrors(async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      })
    }

    if (prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorised'
      })
    }
    const { selectPatient, drugValue, testValue } = req.body;

    if (selectPatient) {
      prescription.patientId = selectPatient.patientId;
      prescription.diagnosticSummary = selectPatient.diagnosticSummary;
      prescription.nextAppointment = selectPatient.nextAppointment;
    }

    if (drugValue) {
      prescription.drugs = drugValue;
    }
    if (testValue) {
      prescription.tests = testValue;
    }
    await prescription.save();
    res.status(201).json({
      success: true,
      message: 'Prescription updated successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});
// get Prescriptions details
exports.getPrescriptions = catchAsyncErrors(async (req, res) => {
  try {
    // const prescriptions = await Prescription.find({owner : req.user._id}).populate('user');
    const prescriptions = await Prescription.aggregate([
      { $match: { $and: [{ doctorId: req.user._id }] } },
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

    await Prescription.populate(prescriptions, { path: "drugs.drugId tests.testId" });

    if (!prescriptions) {
      return res.status(404).json({
        success: false,
        message: 'No prescriptions found'
      });
    }
    res.status(200).json({
      success: true,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// get prescription details by id
exports.getPrescriptionDetails = catchAsyncErrors(async (req, res) => {
  // console.log(req.user._id);
  // console.log(req.params.id);
  try {
    const ObjectId = mongoose.Types.ObjectId;
    const prescriptions = await Prescription.aggregate([
      { $match: { $and: [{ doctorId: req.user._id, }, { appointmentId: ObjectId(req.params.id) }] } },
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

    await Prescription.populate(prescriptions, { path: "drugs.drugId tests.testId" });

    if (!prescriptions) {
      return res.status(404).json({
        success: false,
        message: 'No prescription found'
      });
    }
    res.status(200).json({
      success: true,
      prescription: prescriptions[0]
    });
    //console.log(prescriptions);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

exports.getAllPrescriptionDetails = catchAsyncErrors(async (req, res) => {
  try {
    //console.log(req.params.patientId);
    const prescriptions = await Prescription.find({'patientId':req.params.patientId}).sort({'_id': -1});

    await Prescription.populate(prescriptions, { path: "drugs.drugId tests.testId" });

    if (!prescriptions) {
      return res.status(404).json({
        success: false,
        message: 'No prescription found'
      });
    }

    res.status(200).json({
      success: true,
      prescription: prescriptions
    });
    //console.log(patient);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// detele prescription
exports.deletePrescription = catchAsyncErrors(async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      })
    }

    if (prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorised'
      })
    }
    await prescription.remove();
    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});


// create slots
exports.createSlots = catchAsyncErrors(async (req, res) => {

  try {
    const { manageSlots, slotValue, fieldValue } = req.body;
    const slotData = {
      manageSlots,
      ...slotValue,
      ...fieldValue,
      doctorId: req.user._id,
    }
    await Slot.create(slotData);
    res.status(201).json({
      success: true,
      message: 'Slots created successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// get Solts 
exports.getSlots = catchAsyncErrors(async (req, res) => {
  try {
    const slots = await Slot.find({ doctorId: req.user._id });
    if (!slots) {
      return res.status(404).json({
        success: false,
        message: 'No slots found'
      });
    }
    res.status(200).json({
      success: true,
      slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});


// get Slot detail by id
exports.getSlotDetails = catchAsyncErrors(async (req, res) => {
  try {
    const slot = await Slot.findOne({ doctorId: req.user._id, _id: req.params.slotId });
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'No slot found'
      });
    }
    if (slot.doctorId.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Unauthrised'
      });
    }
    res.status(200).json({
      success: true,
      slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// update slot
exports.updateSlot = catchAsyncErrors(async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      })
    }

    if (slot.doctorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorised'
      })
    }
    const { manageSlots, slotValue, fieldValue } = req.body;

    if (manageSlots) {
      slot.manageSlots = manageSlots;
    }
    if (slotValue) {
      slot.mon = slotValue.mon;
      slot.tue = slotValue.tue;
      slot.wed = slotValue.wed;
      slot.thu = slotValue.thu;
      slot.fri = slotValue.fri;
      slot.sat = slotValue.sat;
      slot.sun = slotValue.sun;
    }
    if (fieldValue) {
      slot.interval = fieldValue.interval;
      slot.slotStartDate = fieldValue.slotStartDate;
      slot.slotEndDate = fieldValue.slotEndDate;
      slot.monIn = fieldValue.monIn;
      slot.monOut = fieldValue.monOut;
      slot.tueIn = fieldValue.tueIn;
      slot.tueOut = fieldValue.tueOut;
      slot.wedIn = fieldValue.wedIn;
      slot.wedOut = fieldValue.wedOut;
      slot.thuIn = fieldValue.thuIn;
      slot.thuOut = fieldValue.thuOut;
      slot.friIn = fieldValue.friIn;
      slot.friOut = fieldValue.friOut;
      slot.satIn = fieldValue.satIn;
      slot.satOut = fieldValue.satOut;
      slot.sunIn = fieldValue.sunIn;
      slot.sunOut = fieldValue.sunOut;
    }
    await slot.save();
    res.status(201).json({
      success: true,
      message: 'Slot updated successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});


// detele slot
exports.deleteSlot = catchAsyncErrors(async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      })
    }

    if (slot.doctorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorised'
      })
    }
    await slot.remove();
    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});


// get Slot by date
exports.getSlotsByDate = catchAsyncErrors(async (req, res) => {
  try {
    let doctorId = '';
    if (req.body.doctorId) {
      doctorId = req.body.doctorId;
    } else {
      doctorId = req.user._id;
    }
    
    const bookedSlots = await Appointment.find({ doctorId: doctorId, appointmentDate: req.body.selectedDate }, { _id: 0, slotId: 1 });


    // const slot = await Slot.findOne({
    //   doctorId: doctorId,
    //   "$and": [
    //     {"slotStartDate": {"$lte": req.body.selectedDate}},
    //     {"slotEndDate": {"$gte": req.body.selectedDate}}
    //   ]
    // });


    const slot = await Slot.find({doctorId: doctorId,$and:[{slotStartDate:{$lte:new Date(req.body.selectedDate)}},{slotEndDate:{$gte:new Date(req.body.selectedDate)}}]});


    if (!slot) {
      let arr = {
        allSlots: {
          slotDate: req.body.selectedDate,
          slots: []
        },
        bookedSlots: []
      }
      return res.status(200).json({
        success: true,
        slot: arr
      });
    }
    let allslots = [];
    
    slot && slot.map((element,index)=>{
      let indexs = element.manageSlots.findIndex(x => {
      let dts = new Date(x.slotDate);
      let date = dts.getFullYear() + '-' + (dts.getUTCMonth() > 10 ? dts.getUTCMonth() + 1 : '0' + (dts.getUTCMonth() + 1)) + '-' + (dts.getDate() > 10 ? dts.getDate() : '0' + dts.getDate());
        if (date == req.body.selectedDate) {
          return true;
        }
      });
      allslots[index] = element.manageSlots[indexs];
    });


    // let index = slot.manageSlots.findIndex(x => {
    //   let dts = new Date(x.slotDate);
    //   let date = dts.getFullYear() + '-' + (dts.getUTCMonth() > 10 ? dts.getUTCMonth() + 1 : '0' + (dts.getUTCMonth() + 1)) + '-' + (dts.getDate() > 10 ? dts.getDate() : '0' + dts.getDate());
    //   if (date == req.body.selectedDate) {
    //     return true;
    //   }
    // });

    //console.log(allslots);

    let arr = {
      allSlots: allslots,
      bookedSlots
    }
    //console.log(arr);
    
    res.status(200).json({
      success: true,
      slot: arr
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

exports.getMondaySlots = catchAsyncErrors(async (req, res) => {
  try {
    let doctorId = req.body.doctorId;
    let slotDate = req.body.slotDate;
    const bookedSlots = await Appointment.find({ doctorId: doctorId, appointmentDate: slotDate }, { _id: 0, slotId: 1 });

    const slot = await Slot.findOne({ 
      doctorId: doctorId,
      $and: [{
        slotStartDate: {
          $lte: slotDate,
        },
      }, {
        slotEndDate: {
          $gte: slotDate,
        },
      }],
    });

    if (!slot) {
      let arr = {
        allSlots: {
          slotDate: slotDate,
          slots: []
        },
        bookedSlots: []
      }
      //console.log('2',arr);
      return res.status(200).json({
        success: true,
        monslots: arr
      });
    }

    let index = slot.manageSlots.findIndex(x => {
      let dts = new Date(x.slotDate);
      let date = dts.getFullYear() + '-' + (dts.getUTCMonth() > 10 ? dts.getUTCMonth() + 1 : '0' + (dts.getUTCMonth() + 1)) + '-' + (dts.getDate() > 10 ? dts.getDate() : '0' + dts.getDate());
      if (date == slotDate) {
        return true;
      }
    });

    let arr = {
      allSlots: slot.manageSlots[index],
      bookedSlots
    }
    
    res.status(200).json({
      success: true,
      monslots: arr
    });
    //console.log('1',monslots);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// create doctor appointment
exports.createDoctorAppointment = catchAsyncErrors(async (req, res) => {
  try {
    const { formData, patientDetail } = req.body;

    const doctor = await User.findById(formData.doctorId);
    const user = await User.findById(req.user._id);

    const appointmentData = {
      ...formData,
      ...patientDetail,
      createdBy: req.user._id 
    }

    await Appointment.create(appointmentData);
    doctor.patients.includes(req.user._id) ? doctor.patients : doctor.patients.push(req.user._id);
    user.doctors.includes(formData.doctorId) ? user.doctors : user.doctors.push(formData.doctorId);

    await doctor.save();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});


// create doctor appointment
exports.newCreateDoctorAppointment = catchAsyncErrors(async (req, res) => {
  try {
    const { formData, patientDetail } = req.body;

    const doctor = await User.findById(formData.doctorId);
    const user = await User.findById(req.user._id);

    res.status(201).json({
      success: true,
      slot,
      message: 'Appointment created successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// get Doctor Appointments
exports.getDoctorAppointments = catchAsyncErrors(async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id }).sort({ _id: -1 });
    if (!appointments) {
      return res.status(404).json({
        success: false,
        message: 'No appointments found'
      });
    }
    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

exports.getBlogsDetails = catchAsyncErrors(async( req, res) => {

  //console.log('newsID',req.params.id);
  try {
     const newses = await News.findOne({ _id : req.params.id});
     if(!newses){
        return res.status(404).json({
            success : false,
            message : 'No news found'
        });
     }
     res.status(200).json({
         success : true,
         newses
     });
     //console.log(newses);
   } catch (error) {
     res.status(500).json({
       success : false,
       message : error.message
    })
    console.log(error);
   }
});

exports.getDoctorSlots = catchAsyncErrors(async( req, res) => {

  //console.log('newsID',req.params.id);
  try {
    let doctorId = '';
    if (req.body.doctorId) {
      doctorId = req.body.doctorId;
    } else {
      doctorId = req.user._id;
    }
    const bookedSlots = await Appointment.find({ doctorId: doctorId, appointmentDate: req.body.selectedDate }, { _id: 0, slotId: 1 });

    const slot = await Slot.findOne({
      doctorId: doctorId,
      $and: [{
        slotStartDate: {
          $lte: req.body.selectedDate,
        },
      }, {
        slotEndDate: {
          $gte: req.body.selectedDate,
        },
      }],
    });

    if (!slot) {
      let arr = {
        allSlots: {
          slotDate: req.body.selectedDate,
          slots: []
        },
        bookedSlots: []
      }
      return res.status(200).json({
        success: true,
        slot: arr
      });
    }

    let index = slot.manageSlots.findIndex(x => {
      let dts = new Date(x.slotDate);
      let date = dts.getFullYear() + '-' + (dts.getUTCMonth() > 10 ? dts.getUTCMonth() + 1 : '0' + (dts.getUTCMonth() + 1)) + '-' + (dts.getDate() > 10 ? dts.getDate() : '0' + dts.getDate());
      if (date == req.body.selectedDate) {
        return true;
      }
    });

    let arr = {
      allSlots: slot.manageSlots[index],
      bookedSlots
    }

    res.status(200).json({
      success: true,
      slot: arr
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// get todays Doctor Appointments
exports.getTodayDoctorAppointments = catchAsyncErrors(async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id, appointmentDate: { $eq: moment(new Date()).format('YYYY-MM-DD') } }).sort({ _id: -1 });
    if (!appointments) {
      return res.status(404).json({
        success: false,
        message: 'No appointments found'
      });
    }
    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});
exports.getPaymentDetails = catchAsyncErrors(async (req, res) => {

  try {
    const payment = await Payment.find({ orderId: req.params.orderId});
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No result found'
      });
    }
    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}); 


exports.getPatientPayment = catchAsyncErrors(async (req, res) => {
  try {
    const payment = await Payment.find({
    patientId: req.params.patientId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No result found'
      });
    }
    res.status(200).json({
      success: true,
      payment
    });
    //console.log(payment);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});
exports.getDoctorMontlyEarning = catchAsyncErrors(async (req, res) => {
  // let dts = new Date();
  
  // let date1 = dts.getFullYear() + '-' + (dts.getUTCMonth() > 10 ? dts.getUTCMonth() + 1 : '0' + (dts.getUTCMonth() + 1)) + '-' + '01';
  
  // let date2 = dts.getFullYear() + '-' + (dts.getUTCMonth() > 10 ? dts.getUTCMonth() + 1 : '0' + (dts.getUTCMonth() + 1)) + '-' + (dts.getDate() > 10 ? dts.getDate() : '0' + dts.getDate());
  // let year = dts.getFullYear();
  // let month = (dts.getUTCMonth() > 10 ? dts.getUTCMonth() + 1 : '0' + (dts.getUTCMonth() + 1));

  try {
    
    //const payment = await Payment.find({ doctorId: req.params.doctorId,createdAt:{$gte: date1, $lte: date2}});
    // let d = new Date(date1);
    // let n = new Date(date1);

    const payment = await Payment.find({
    doctorId: req.params.doctorId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No result found'
      });
    }
    res.status(200).json({
      success: true,
      payment
    });
    //console.log(payment);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});



// get test details by id
exports.getDoctorAppointmentById = catchAsyncErrors(async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ doctorId: req.user._id, _id: req.params.appId });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'No appointment found'
      });
    }
    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

// detele Doctor Appointment
exports.deleteDoctorAppointment = catchAsyncErrors(async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }

    if (appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorised'
      })
    }
    await appointment.remove();
    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
});
