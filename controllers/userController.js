const BigPromise=require("../middlewares/bigPromise");
const customErrors= require("../utils/cutomErrors");
const User= require("../models/user");
const cookieToken=require("../utils/cookieToken");
const cloudinary=require("cloudinary");
const fileUpload=require("express-fileupload");
const mailHelper=require("../utils/mailHelper");
const crypto= require("crypto");

exports.signup=BigPromise(async(req, res, next) =>{

    if(!req.files){
        return next(new customErrors("photo is required for signup", 400));
    }

    const {name,email,password}=req.body;

    if(!name || !email || !password){
        return next(new customErrors("email,name and password are required",400));
    }
    let file = req.files.photo;

  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });
    const user =await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url,
          },
    })

    cookieToken(user,res);
});

exports.login=BigPromise(async(req,res,next)=>{
    const {email,password} = req.body;

    if(!email || !password) {
        return next(new customErrors("Email or password is required",400))
    }

    const user = await User.findOne({email}).select("+password")

    if(!user){
        return next(new customErrors("Email or password is not correct!"));
    }

    const passwordcorrect= await user.isValidatedPassword(password);

    if(!passwordcorrect){
        return next(new customErrors("Email or password is not correct!"));
    }

    cookieToken(user,res);
})

exports.logout=BigPromise(async(req,res,next)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    res.status(200).json({
        success: true,
        message:"logout successful",
    })
});

exports.forgotpassword=BigPromise(async(req,res,next)=>{
    const {email}=req.body;

    const user=await User.findOne({email});

    const ForgotToken= user.getForgotPasswordToken();

    await user.save({validateBeforeSave:false});


    const myURL= `${req.protocol}://${req.get("host")}/password/reset/${ForgotToken}`

    const message =`Copy paste this Url and then hit enter ${myURL}`;

    try {
        await mailHelper({
            email:user.email,
            subject:"LCO-Tshirt Store",
            message,
        })

        res.status(200).json({
            success: true,
            message:"email send successfully",
        })
    } catch (error) {
        user.forgotPasswordToken=undefined;
        user.forgotPasswordExpiry=undefined;
        await user.save({validateBeforeSave:true});

        return next(new customErrors(error.message,500));
    }
})

exports.passwordReset = BigPromise(async (req, res, next) => {
    //get token from params
    const token = req.params.token;
  
    // hash the token as db also stores the hashed version
    const encryToken = crypto.createHash("sha256").update(token).digest("hex");
  
    // find user based on hased on token and time in future
    const user = await User.findOne({
      encryToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });
  
    if (!user) {
      return next(new customErrors("Token is invalid or expired", 400));
    }
  
    // check if password and conf password matched
    if (req.body.password !== req.body.confirmpassword) {
      return next(
        new customErrors("password and confirm password do not match", 400)
      );
    }
  
    // update password field in DB
    user.password = req.body.password;
  
    // reset token fields
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
  
    // save the user
    await user.save();
  
    // send a JSON response OR send token
  
    cookieToken(user, res);
  });

exports.getloggedinDetails=BigPromise(async(req,res,next)=>{
    const user= await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user,
    })
})

exports.changepassword=BigPromise(async(req,res,next)=>{
    const userId = req.user.id;

    const user= await User.findById(userId).select("+password");

    const isCorrectPassword = await user.isValidatedPassword(req.body.oldpassword);
    
    if(!isCorrectPassword){
        return next(new customErrors("Incorrect password",400));
    }

    user.password=req.body.newpassword;

    await user.save();

    cookieToken(user,res);
});

exports.updateUserDetails=BigPromise(async(req,res,next)=>{

    const newData={
        name:req.body.name,
        email:req.body.email,
    }

    if(req.files){
        const user=await User.findById(req.user.id)

        const imageId= user.photo.id;

        const resp=await cloudinary.v2.uploader.destroy(imageId);

        const result= await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath,{
            folder:'users',
            width:150,
            crop:'scale',
        });

        newData.photo={
            id:result.public_id,
            secure_url:result.secure_url,
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id,newData,{
        new:true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success:true,
    })
});

exports.adminAllUsers=BigPromise(async(req,res,next)=>{
    const user= await User.find();

    res.status(200).json({
        success:"true",
        user,
    })
});

exports.adminGetUser=BigPromise(async(req,res,next)=>{
    const user= await User.findById(req.params.id);

    if(!user){
        return next(new customErrors('user not found',400))
    }

    res.status(200).json({
        success:"true",
        user,
    })
});

exports.adminUpdateOneUserDetails=BigPromise(async(req,res,next)=>{

    const newData={
        name:req.body.name,
        email:req.body.email,
        role: req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.user.id,newData,{
        new:true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success:true,
    })
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
    // get user from url
    const user = await User.findById(req.params.id);
  
    if (!user) {
      return next(new CustomError("No Such user found", 401));
    }
  
    // get image id from user in database
    const imageId = user.photo.id;
  
    // delete image from cloudinary
    await cloudinary.v2.uploader.destroy(imageId);
  
    // remove user from databse
    await user.remove();
  
    res.status(200).json({
      success: true,
    });
  });

exports.managerAllUsers=BigPromise(async(req,res,next)=>{
    const user= await User.find({role:"user"});

    res.status(200).json({
        success:"true",
        user,
    })
})
