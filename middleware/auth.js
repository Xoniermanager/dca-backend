const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const jwt = require('jsonwebtoken');

exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next) =>{
    const token = req.header('auth-token');
    if(!token){
        return next(new ErrorHandler("Please login to access this resourse",401));
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodeData.id);
    next();
})

exports.authorizeRole = (...roles) =>{
    return (req, res, next) =>{
        if(!roles.includes(req.user.role)){
           return next(new ErrorHandler(
                `Role: ${req.user.role} is not allowed to access this resourse.`, 403
            ));
        }
        next();
    }
}