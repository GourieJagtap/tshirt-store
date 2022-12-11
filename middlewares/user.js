const BigPromise=require("../middlewares/bigPromise");
const User=require("../models/user");
const customErrors=require("../utils/cutomErrors");
const jwt=require("jsonwebtoken")

exports.isLoggedIn=BigPromise(async(req,res,next)=>{
    const token= req.cookies.token|| req.header('Authorization').replace("Bearer ","");

    if(!token){
        return next(new customErrors("First login to access this page",401));
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    req.user=await User.findById(decoded.id);

    next();
});

exports.customRole=(...roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new customErrors('you are not allowed for this resource',400));
        }
        next();
    }
}