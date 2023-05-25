const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const Disease = require('../models/diseaseModel');
const Faq = require("../models/faqModel")
const Department = require('../models/departmentModel');
const News = require('../models/newsModel');
const cloudinary = require('cloudinary');
const { sendEmail } = require('../middleware/sendEmail');
const Appointment = require('../models/appointmentModel');
const Drug = require('../models/drugModel');
const Test = require('../models/testModel');
const Services = require('../models/servicesModel');
const Stories = require('../models/storiesModel');
const Clients = require('../models/clientsModel');
const Approach = require('../models/approachModel');
const About = require('../models/aboutModel');
 // all users
 exports.getPatients = catchAsyncErrors(async( req, res) => {
  try {
     const adminPatients = await User.find({ role: req.params.userType}).sort({createdAt : -1});
     res.status(200).json({
         success : true,
         adminPatients
     });
   } catch (error) {
     res.status(500).json({
       success : false,
       message : error.message
    })
   }
});


  // add create patient
  exports.createDoctor = catchAsyncErrors(async( req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const {userValue, certificate} = req.body;
        const password = 'Xonier@'+Math.floor(1000 + Math.random() * 9000);
        const doctorData = userValue;
        doctorData.password = password;
        if(certificate){
          const myCloud = await cloudinary.v2.uploader.upload(certificate, {
            folder: "certificate",
          });
          doctorData.certificate = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
          doctorData.status = 0;
       }
        const doctor = await User.create(doctorData);
        await user.save();
      const message = `Your login credential is given below: \n\n Email : ${doctorData.email} \n\n Password : ${doctorData.password}`;
      try {
        await sendEmail({
          email: doctorData.email,
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
            message : 'Doctor added successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  // create disease
  exports.createDisease = catchAsyncErrors(async( req, res) => {
    try {
        const diseaseData = {
          ...req.body,
          owner : req.user._id,                
        }
        const newDisease =  await Disease.create(diseaseData);
        res.status(201).json({
            success : true,
            newDisease,
            message : 'Disease added successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });


    // Update disease
    exports.updateDisease = catchAsyncErrors(async( req, res) => {
      try {
        const disease = await Disease.findById(req.params.id);
          
        if(!disease){
            return res.status(404).json({
                success : false,
                message : 'Disease not found'
            })
        }
  
        if(disease.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success : false,
                message : 'Unauthorised'
            })
        }
        
        if(req.body.diseaseName){
          disease.diseaseName = req.body.diseaseName;
        }
        if(req.body.diseaseDescription){
          disease.diseaseDescription = req.body.diseaseDescription;
        }        
        await disease.save();
  
          res.status(201).json({
              success : true,
              message : 'Disease updated successfully.'
          });
        } catch (error) {
          res.status(500).json({
            success : false,
            message : error.message
        })
        }
    });

    // get diseases details
    exports.getDiseases = catchAsyncErrors(async( req, res) => {
      try {
        //{owner : req.user._id}
         const diseases = await Disease.find();
         if(!diseases){
            return res.status(404).json({
                success : false,
                message : 'No diseases found'
            });
         }
         res.status(200).json({
             success : true,
             diseases
         });
       } catch (error) {
         res.status(500).json({
           success : false,
           message : error.message
        })
       }
    });


  // get disease details by id
  exports.getDiseaseDetails = catchAsyncErrors(async( req, res) => {
    try {
        //owner : req.user._id,
        const disease = await Disease.findOne({ _id : req.params.id});
        if(!disease){
          return res.status(404).json({
              success : false,
              message : 'No disease found'
          });
        }
        res.status(200).json({
            success : true,
            disease
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  // detele disease
    exports.deleteDisease = catchAsyncErrors(async( req, res) => {
    try {
      const disease = await Disease.findById(req.params.id);
        if(!disease){
            return res.status(404).json({
                success : false,
                message : 'Disease not found'
            })
        }

        if(disease.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success : false,
                message : 'Unauthorised'
            })
        }
      await disease.remove();
        res.status(200).json({
            success : true,
            message : 'Disease deleted successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });


     // Update user status
     exports.updateUserStatus = catchAsyncErrors(async( req, res) => {
      try {
        const user = await User.findById(req.params.userId);
        if(!user){
            return res.status(404).json({
                success : false,
                message : 'User not found'
            })
        }
        user.status = !user.status;
         await user.save();
          res.status(201).json({
              success : true,
              message : 'Status updated successfully.'
          });
        } catch (error) {
          res.status(500).json({
            success : false,
            message : error.message
        })
        }
    });

    // create Department
  exports.createDepartment = catchAsyncErrors(async( req, res) => {
    try {
      const {departmentName, departmentDescription, deptIcon} = req.body;
        const departmentData = {
          departmentName,
          departmentDescription,
        }
        if(deptIcon && Object.keys(deptIcon).length !== 0){
          const myCloud = await cloudinary.v2.uploader.upload(deptIcon.icon, {
            folder: "department",
          });
          departmentData.icon = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
      }
      const newDepartment =  await Department.create(departmentData);
      res.status(201).json({
            success : true,
            newDepartment,
            message : 'Department added successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
       })
      }
  });


    // Update Department
    exports.updateDepartment = catchAsyncErrors(async( req, res) => {
      try {
        const department = await Department.findById(req.params.id);
        const {departmentName, departmentDescription, deptIcon} = req.body;
        if(!department){
            return res.status(404).json({
                success : false,
                message : 'Department not found'
            })
        }
        if(departmentName){
          department.departmentName = departmentName;
        }
        if(departmentDescription){
          department.departmentDescription = departmentDescription;
        }   
        if(deptIcon && Object.keys(deptIcon).length !== 0){
           if(department)
           await cloudinary.v2.uploader.destroy('department/'+department.icon.public_id);
          const myCloud = await cloudinary.v2.uploader.upload(deptIcon, {
            folder: "department",
          });
          department.icon = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
      }    

        await department.save();
          res.status(201).json({
              success : true,
              message : 'Department updated successfully.'
          });
        } catch (error) {
          res.status(500).json({
            success : false,
            message : error.message
        })
        }
    });

    // get departments details
    exports.getDepartments = catchAsyncErrors(async( req, res) => {
      try {
        //{owner : req.user._id}
         const departments = await Department.find();
         if(!departments){
            return res.status(404).json({
                success : false,
                message : 'No departments found'
            });
         }
         res.status(200).json({
             success : true,
             departments
         });
       } catch (error) {
         res.status(500).json({
           success : false,
           message : error.message
        })
       }
    });


  // get department details by id
  exports.getDepartmentDetails = catchAsyncErrors(async( req, res) => {
    try {
        const department = await Department.findOne({ _id : req.params.id});
        if(!department){
          return res.status(404).json({
              success : false,
              message : 'No department found'
          });
        }
        res.status(200).json({
            success : true,
            department
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  // detele department
    exports.deleteDepartment = catchAsyncErrors(async( req, res) => {
    try {
      const department = await Department.findById(req.params.id);
        if(!department){
            return res.status(404).json({
                success : false,
                message : 'Department not found'
            })
        }
      await department.remove();
        res.status(200).json({
            success : true,
            message : 'Department deleted successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });


   // create Faq
   exports.createFaq = catchAsyncErrors(async( req, res) => {
    try {
        const faqData = {
          ...req.body              
        }
        const newFaq =  await Faq.create(faqData);
        res.status(201).json({
            success : true,
            newFaq,
            message : 'Faq added successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });


    // Update faq
    exports.updateFaq = catchAsyncErrors(async( req, res) => {
      try {
        const faq = await Faq.findById(req.params.id);
          
        if(!faq){
            return res.status(404).json({
                success : false,
                message : 'Faq not found'
            })
        }
        if(req.body.faqQues){
          faq.faqQues = req.body.faqQues;
        }
        if(req.body.faqDescription){
          faq.faqDescription = req.body.faqDescription;
        }        
        await faq.save();
  
          res.status(201).json({
              success : true,
              message : 'Faq updated successfully.'
          });
        } catch (error) {
          res.status(500).json({
            success : false,
            message : error.message
        })
        }
    });

    // get faqs details
    exports.getFaqs = catchAsyncErrors(async( req, res) => {
      try {
         const faqs = await Faq.find();
         if(!faqs){
            return res.status(404).json({
                success : false,
                message : 'No faqs found'
            });
         }
         res.status(200).json({
             success : true,
             faqs
         });
       } catch (error) {
         res.status(500).json({
           success : false,
           message : error.message
        })
       }
    });


  // get faq details by id
  exports.getFaqDetails = catchAsyncErrors(async( req, res) => {
    try {
        //owner : req.user._id,
        const faq = await Faq.findOne({ _id : req.params.id});
        if(!faq){
          return res.status(404).json({
              success : false,
              message : 'No faq found'
          });
        }
        res.status(200).json({
            success : true,
            faq
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  // detele faq
    exports.deletefaq = catchAsyncErrors(async( req, res) => {
    try {
      const faq = await Faq.findById(req.params.id);
        if(!faq){
            return res.status(404).json({
                success : false,
                message : 'faq not found'
            })
        }
      await faq.remove();
        res.status(200).json({
            success : true,
            message : 'Faq deleted successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  //service 
  exports.createService = catchAsyncErrors(async( req, res) => {
    try {
        const {serviceValue, serviceImage} = req.body;
        const serviceData = {...serviceValue};
        let title = serviceValue.serviceTitle;
        let slug;
        slug = title.toLowerCase();
        slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
        slug = slug.replace(/ /gi, "-");
        slug = slug.replace(/\-\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-/gi, '-');
        slug = slug.replace(/\-\-/gi, '-');
        slug = '@' + slug + '@';
        slug = slug.replace(/\@\-|\-\@|\@/gi, '');
        serviceData.slug = slug;

        if(serviceImage){
         const myCloud = await cloudinary.v2.uploader.upload(serviceImage, {
           folder: "service",
         });
         serviceData.image = {
           public_id: myCloud.public_id,
           url: myCloud.secure_url,
         };
        }  
        const newService =  await Services.create(serviceData);
        res.status(201).json({
            success : true,
            newService,
            message : 'Service added successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.updateService = catchAsyncErrors(async( req, res) => {
    try {
      const service = await Services.findById(req.params.id);
      const {serviceValue, serviceImage} = req.body;

      let title = serviceValue.serviceTitle;
      let slug;
      slug = title.toLowerCase();
      slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
      slug = slug.replace(/ /gi, "-");
      slug = slug.replace(/\-\-\-\-\-/gi, '-');
      slug = slug.replace(/\-\-\-\-/gi, '-');
      slug = slug.replace(/\-\-\-/gi, '-');
      slug = slug.replace(/\-\-/gi, '-');
      slug = '@' + slug + '@';
      slug = slug.replace(/\@\-|\-\@|\@/gi, '');
      service.slug = slug;
    
      if(!service){
          return res.status(404).json({
              success : false,
              message : 'Service not found'
          })
      }
      if(serviceValue.serviceTitle){
        service.serviceTitle = serviceValue.serviceTitle;
      }
      if(serviceValue.serviceDescription){
        service.serviceDescription = serviceValue.serviceDescription;
      }        
      if(serviceImage){
          if(service.image)
          await cloudinary.v2.uploader.destroy('service/'+service.image.public_id);
           const myCloud = await cloudinary.v2.uploader.upload(serviceImage, {
           folder: "service",
          });
          service.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
    }
      await service.save();

        res.status(201).json({
            success : true,
            message : 'Service updated successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.getService = catchAsyncErrors(async( req, res) => {
    try {
       const service = await Services.find().sort({ _id: -1 });
       if(!service){
          return res.status(404).json({
              success : false,
              message : 'No service found'
          });
       }
       res.status(200).json({
           success : true,
           service
       });
     } catch (error) {
       res.status(500).json({
         success : false,
         message : error.message
      })
     }
  });

  exports.deleteService = catchAsyncErrors(async( req, res) => {
    try {
      const service = await Services.findById(req.params.id);
        if(!service){
            return res.status(404).json({
                success : false,
                message : 'news not found'
            })
        }
      await service.remove();
        res.status(200).json({
            success : true,
            message : 'Service deleted successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.getServiceDetails = catchAsyncErrors(async( req, res) => {
    //console.log(req.params.id);
    try {
        //owner : req.user._id,
        const service = await Services.findOne({ _id : req.params.id});
        if(!service){
          return res.status(404).json({
              success : false,
              message : 'No service found'
          });
        }
        res.status(200).json({
            success : true,
            service
        });
        console.log(service);
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });
  

  //service

  //approach
  exports.updateApproach = catchAsyncErrors(async( req, res) => {
    try {
      const approach = await Approach.findById(req.params.id);
      const {approachValue, approachImage} = req.body;
    
      if(!approach){
          return res.status(404).json({
              success : false,
              message : 'Approach not found'
          })
      }
      if(approachValue.Title){
        approach.Title = approachValue.Title;
      }
      if(approachValue.Description){
        approach.Description = approachValue.Description;
      }        
      if(approachImage){
          if(approach.image)
          await cloudinary.v2.uploader.destroy('approach/'+approach.image.public_id);
           const myCloud = await cloudinary.v2.uploader.upload(approachImage, {
           folder: "approach",
          });
          approach.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
    }
      await approach.save();

        res.status(201).json({
            success : true,
            message : 'Approach updated successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.getApproachDetails = catchAsyncErrors(async( req, res) => {
   // console.log(req.params.id);
    try {
        //owner : req.user._id,
        const approach = await Approach.findOne({ _id : req.params.id});
        if(!approach){
          return res.status(404).json({
              success : false,
              message : 'No approach found'
          });
        }
        res.status(200).json({
            success : true,
            approach
        });
        //console.log(approach);
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.createApproach = catchAsyncErrors(async( req, res) => {
    try {
        const {approachValue, approachImage} = req.body;
        const approachData = {...approachValue};
        
        if(approachImage){
         const myCloud = await cloudinary.v2.uploader.upload(approachImage, {
           folder: "approach",
         });
         approachData.image = {
           public_id: myCloud.public_id,
           url: myCloud.secure_url,
         };
        }  
        const newApproach =  await Approach.create(approachData);
        res.status(201).json({
            success : true,
            newApproach,
            message : 'Approach added successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  //end approach

  //about
  exports.updateAbout = catchAsyncErrors(async( req, res) => {
    try {
      const about = await About.findById(req.params.id);
      const {approachValue, approachImage} = req.body;
    
      if(!about){
          return res.status(404).json({
              success : false,
              message : 'About not found'
          })
      }
      if(approachValue.Title){
        about.Title = approachValue.Title;
      }
      if(approachValue.Description){
        about.Description = approachValue.Description;
      }        
      if(approachImage){
          if(about.image)
          await cloudinary.v2.uploader.destroy('about/'+about.image.public_id);
           const myCloud = await cloudinary.v2.uploader.upload(approachImage, {
           folder: "about",
          });
          about.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
    }
      await about.save();

        res.status(201).json({
            success : true,
            message : 'About updated successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.getAboutDetails = catchAsyncErrors(async( req, res) => {
   // console.log(req.params.id);
    try {
        //owner : req.user._id,
        const about = await About.findOne({ _id : req.params.id});
        if(!about){
          return res.status(404).json({
              success : false,
              message : 'No about found'
          });
        }
        res.status(200).json({
            success : true,
            about
        });
        //console.log(approach);
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.createAbout = catchAsyncErrors(async( req, res) => {
    try {
        const {aboutValue, aboutImage} = req.body;
        const aboutData = {...aboutValue};
        
        if(aboutImage){
         const myCloud = await cloudinary.v2.uploader.upload(aboutImage, {
           folder: "about",
         });
         aboutData.image = {
           public_id: myCloud.public_id,
           url: myCloud.secure_url,
         };
        }  
        const newAbout =  await About.create(aboutData);
        res.status(201).json({
            success : true,
            newAbout,
            message : 'About added successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  //end about


  //stories 
  exports.createStories = catchAsyncErrors(async( req, res) => {
    try {
        const {storiesValue, storiesImage} = req.body;
        const storiesData = {...storiesValue};
        let title = storiesValue.storiesTitle;
        let slug;
        slug = title.toLowerCase();
        slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
        slug = slug.replace(/ /gi, "-");
        slug = slug.replace(/\-\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-/gi, '-');
        slug = slug.replace(/\-\-/gi, '-');
        slug = '@' + slug + '@';
        slug = slug.replace(/\@\-|\-\@|\@/gi, '');
        storiesData.slug = slug;

        if(storiesImage){
         const myCloud = await cloudinary.v2.uploader.upload(storiesImage, {
           folder: "stories",
         });
         storiesData.image = {
           public_id: myCloud.public_id,
           url: myCloud.secure_url,
         };
        }  
        const newStories =  await Stories.create(storiesData);
        res.status(201).json({
            success : true,
            newStories,
            message : 'Stories added successfully.'
        });
       // console.log('newStories',newStories);
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.updateStories = catchAsyncErrors(async( req, res) => {
    try {
      const stories = await Stories.findById(req.params.id);
      const {storiesValue, storiesImage} = req.body;

      let title = storiesValue.storiesTitle;
      let slug;
      slug = title.toLowerCase();
      slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
      slug = slug.replace(/ /gi, "-");
      slug = slug.replace(/\-\-\-\-\-/gi, '-');
      slug = slug.replace(/\-\-\-\-/gi, '-');
      slug = slug.replace(/\-\-\-/gi, '-');
      slug = slug.replace(/\-\-/gi, '-');
      slug = '@' + slug + '@';
      slug = slug.replace(/\@\-|\-\@|\@/gi, '');
      stories.slug = slug;
    
      if(!stories){
          return res.status(404).json({
              success : false,
              message : 'Stories not found'
          })
      }
      if(storiesValue.storiesTitle){
        stories.storiesTitle = storiesValue.storiesTitle;
      }
      if(storiesValue.storiesAuthor){
        stories.storiesAuthor = storiesValue.storiesAuthor;
      }
      if(storiesValue.storiesDescription){
        stories.storiesDescription = storiesValue.storiesDescription;
      }        
      if(storiesImage){
          if(stories.image)
          await cloudinary.v2.uploader.destroy('stories/'+stories.image.public_id);
           const myCloud = await cloudinary.v2.uploader.upload(storiesImage, {
           folder: "stories",
          });
          stories.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
    }
      await stories.save();

        res.status(201).json({
            success : true,
            message : 'Stories updated successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.getStories = catchAsyncErrors(async( req, res) => {
    try {
       const stories = await Stories.find().sort({ _id: -1 });
       if(!stories){
          return res.status(404).json({
              success : false,
              message : 'No stories found'
          });
       }
       res.status(200).json({
           success : true,
           stories
       });
     } catch (error) {
       res.status(500).json({
         success : false,
         message : error.message
      })
     }
  });

  exports.deleteStories = catchAsyncErrors(async( req, res) => {
    try {
      const stories = await Services.findById(req.params.id);
        if(!stories){
            return res.status(404).json({
                success : false,
                message : 'stories not found'
            })
        }
      await stories.remove();
        res.status(200).json({
            success : true,
            message : 'Stories deleted successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.getStoriesDetails = catchAsyncErrors(async( req, res) => {
    //console.log(req.params.id);
    try {
        //owner : req.user._id,
        const stories = await Stories.findOne({ _id : req.params.id});
        if(!stories){
          return res.status(404).json({
              success : false,
              message : 'No stories found'
          });
        }
        res.status(200).json({
            success : true,
            stories
        });
       // console.log(stories);
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });
  

  //stories


  //client 
  exports.createClient = catchAsyncErrors(async( req, res) => {
    try {
        const {clientValue, clientImage} = req.body;
        const clientData = {...clientValue};
        if(clientImage){
         const myCloud = await cloudinary.v2.uploader.upload(clientImage, {
           folder: "client",
         });
         clientData.image = {
           public_id: myCloud.public_id,
           url: myCloud.secure_url,
         };
        }  
        const newClients =  await Clients.create(clientData);
        res.status(201).json({
            success : true,
            newClients,
            message : 'Clients added successfully.'
        });
       // console.log('newStories',newStories);
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.updateClient = catchAsyncErrors(async( req, res) => {
    try {
      const clients = await Clients.findById(req.params.id);
      const {clientValue, clientImage} = req.body;
    
      if(!clients){
          return res.status(404).json({
              success : false,
              message : 'Clients not found'
          })
      }
      if(clientValue.clientTitle){
        clients.clientTitle = clientValue.clientTitle;
      }     
      if(clientImage){
          if(clients.image)
          await cloudinary.v2.uploader.destroy('client/'+clients.image.public_id);
           const myCloud = await cloudinary.v2.uploader.upload(clientImage, {
           folder: "client",
          });
          clients.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
    }
      await clients.save();

        res.status(201).json({
            success : true,
            message : 'Clients updated successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.getClient = catchAsyncErrors(async( req, res) => {
    try {
       const clients = await Clients.find().sort({ _id: -1 });
       if(!clients){
          return res.status(404).json({
              success : false,
              message : 'No stories found'
          });
       }
       res.status(200).json({
           success : true,
           clients
       });
     } catch (error) {
       res.status(500).json({
         success : false,
         message : error.message
      })
     }
  });

  exports.deleteClient = catchAsyncErrors(async( req, res) => {
    try {
      const clients = await Clients.findById(req.params.id);
        if(!clients){
            return res.status(404).json({
                success : false,
                message : 'Clients not found'
            })
        }
      await clients.remove();
        res.status(200).json({
            success : true,
            message : 'Clients deleted successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  exports.getClientDetails = catchAsyncErrors(async( req, res) => {
    //console.log(req.params.id);
    try {
        //owner : req.user._id,
        const clients = await Clients.findOne({ _id : req.params.id});
        if(!clients){
          return res.status(404).json({
              success : false,
              message : 'No clients found'
          });
        }
        res.status(200).json({
            success : true,
            clients
        });
       //console.log(clients);
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });
  

  //client

   // create news
  exports.createNews = catchAsyncErrors(async( req, res) => {
    try {
        const {newsValue, newsImage} = req.body;
        const newsData = {...newsValue};
        if(newsImage){
         const myCloud = await cloudinary.v2.uploader.upload(newsImage, {
           folder: "news",
         });
         newsData.image = {
           public_id: myCloud.public_id,
           url: myCloud.secure_url,
         };
        }  
        const newNews =  await News.create(newsData);
        res.status(201).json({
            success : true,
            newNews,
            message : 'News added successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });


    // Update News
    exports.updateNews = catchAsyncErrors(async( req, res) => {
      try {
        const news = await News.findById(req.params.id);
        const {newsValue, newsImage} = req.body;
      
        if(!news){
            return res.status(404).json({
                success : false,
                message : 'News not found'
            })
        }
        if(newsValue.newsTitle){
          news.newsTitle = newsValue.newsTitle;
        }
        if(newsValue.newsDescription){
          news.newsDescription = newsValue.newsDescription;
        }        
        if(newsImage){
            if(news.image)
            await cloudinary.v2.uploader.destroy('news/'+news.image.public_id);
             const myCloud = await cloudinary.v2.uploader.upload(newsImage, {
             folder: "news",
            });
            news.image = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
      }
        await news.save();
  
          res.status(201).json({
              success : true,
              message : 'News updated successfully.'
          });
        } catch (error) {
          res.status(500).json({
            success : false,
            message : error.message
        })
        }
    });

    // get faqs details
    exports.getNewses = catchAsyncErrors(async( req, res) => {
      try {
         const newses = await News.find().sort({ _id: -1 });
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
       } catch (error) {
         res.status(500).json({
           success : false,
           message : error.message
        })
       }
    });

    exports.getLatestNewses = catchAsyncErrors(async( req, res) => {
      try {
         const newses = await News.find().sort({ _id: -1 }).limit(3);
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
       } catch (error) {
         res.status(500).json({
           success : false,
           message : error.message
        })
       }
    });

    exports.getBlogsDetails = catchAsyncErrors(async( req, res) => {
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
       } catch (error) {
         res.status(500).json({
           success : false,
           message : error.message
        })
       }
    });




  // get faq details by id
  exports.getNewsDetails = catchAsyncErrors(async( req, res) => {
    //console.log(req.params.id);
    try {
        //owner : req.user._id,
        const news = await News.findOne({ _id : req.params.id});
        if(!news){
          return res.status(404).json({
              success : false,
              message : 'No news found'
          });
        }
        res.status(200).json({
            success : true,
            news
        });
        //console.log(news);
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

  // detele faq
  exports.deleteNews = catchAsyncErrors(async( req, res) => {
    try {
      const news = await News.findById(req.params.id);
        if(!news){
            return res.status(404).json({
                success : false,
                message : 'news not found'
            })
        }
      await news.remove();
        res.status(200).json({
            success : true,
            message : 'News deleted successfully.'
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });
// dashboard data

  // get faq details by id
  exports.getDashbordDetails = catchAsyncErrors(async( req, res) => {
    try {
      const patients = await User.find({ role: 'patient'});
      const doctors = await User.find({ role: 'doctor'});
      const appointments = await Appointment.find();
      const drugs = await Drug.find();
      const tests = await Test.find();
      const departments = await Department.find();
      let dashboardData = {
        patientCount : patients.length,
        doctorCount : doctors.length,
        appointmentCount : appointments.length,
        drugCount : drugs.length,
        testCount : tests.length,
        departmentCount : departments.length
      }
        res.status(200).json({
            success : true,
            dashboardData
        });
      } catch (error) {
        res.status(500).json({
          success : false,
          message : error.message
      })
      }
  });

