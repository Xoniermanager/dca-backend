const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please enter your name'],
        maxlength : [30, 'Name can not exceed 30 characters'],
        minlength : [3, 'Name should have more than 3 characters']
    },
    email : {
        type : String,
        required : [true, 'Please enter your email'],
        unique : true,
        validate : [validator.isEmail, 'Please enter a valid email']
    },
    password : {
        type : String,
        required : [true, 'Please enter your password'],
        minlength : [5, 'Password should have more than 6 character'],
        maxlength : [12, 'Password can not exceed 12 characters'],
        select : false
    },
    profileImage: {
        public_id: String,
        url: String,
    },
    role : {
        type : String,
        required : [true, 'Please select your role'],
    },
    isVerify : {
        type : Number,
        default : 0
    },
    createdAt :{
        type : Date,
        default : Date.now
    },
    patientNo : Number,
    surgery : Number,
    experienceYear : Number,
    department : String,
    departmentId : String,
    specialist : String,
    videoIntroUrl : String,
    about : String,
    clinic_details : String,
    academic : String,
   
    certificate : {
        public_id : String,
        url : String
    },
    academic_details : [
        {
        academic : String
       }
    ],
    awards : [
        {
            awardName : String, 
            awardImage : {
                public_id: String,
                url: String, 
            } 
        }
    ],
    experiences : [
        {
            experience:String,
            expYear:String  
        }
    ],
    languages : [
        {
           value : {
               type : String
           }
        }
    ],
    drugs : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Drug'  
        }
    ],
    tests : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Test'  
        }
    ],
    prescriptions : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Prescription'  
        }
    ],
    patients : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'  
        }
    ],
   doctors : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'  
        }
    ],
    status : {
        type : Number,
        default : 1
    },
    fee : {
        type : Number,
        default : 0
    },
    marchantId : String,
    marchantKey : String,
    email_template : String,
    resetPasswordToken : String,
    resetPasswordExpire : Date,
    //patients
    birthday : String,
    phone : Number,
    gender : String,
    bloodgroup : String,
    address : String,
    weight : Number,
    height : Number   
});

// password encrypted
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
});

// jwt token 
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id : this._id}, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRE
    })
}
// compare password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}
//Generating Reset password token 
userSchema.methods.getResetPasswordToken = function(){
    // Generating token 
    const resetToken = Math.floor(1000 + Math.random() * 9000);
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

module.exports = mongoose.model('users', userSchema);