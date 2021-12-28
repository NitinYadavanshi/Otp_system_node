require("dotenv").config();
const bcrypt= require('bcrypt');
const _=require('lodash');
const jwt = require("jsonwebtoken");
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const otpGenerator=require('otp-generator');
const {User}=require('../Models/User_models')
const {Otp}=require('../Models/OtpModels');


// ******************************************SignUp*****************************************************************

module.exports.signUp=async(req,res)=>{
  const user=await User.findOne({
      number:req.body.number

  });
  if(user)return res.status(400).send("User Already Registered!!")
   const OTP=otpGenerator.generate(6,{
       digits:true,alphabets:false,upperCase:false,specialChars:false
   });
   const number= req.body.number;
//    const client=require('twilio')(process.env.accountSID,process.env.authToken)
//    client.messages.create({
//        to:`+91${number}`,
//        from:'+14506003133',
//        body:`Hello!! welcome to Buslala .Your Otp is:${OTP}`
//    })

   console.log(OTP)
   const otp=new Otp({number : number,otp:OTP});
   const salt =await bcrypt.genSalt(10)
   otp.otp=await bcrypt.hash(otp.otp,salt);
   const result =await otp.save();
   return res.status(200).send("Otp sent successfully");


}

// ********************************************verifyOtp******************************************************

module.exports.verifyOtp=async(req,res)=>{
const otpHolder=await Otp.find({

    number:req.body.number,
    
});
if(otpHolder.length===0) return res.status(400).send("You use an expired Otp!!")
const rightOtpFind = otpHolder[otpHolder.length - 1];
// console.log(rightOtpFind)
console.log(req.body.otp)
// const rightOtp=await req.body.otp;
const validuser=await bcrypt.compare(req.body.otp,rightOtpFind.otp);
if(rightOtpFind.number===req.body.number&&validuser){
    const user = new User(_.pick(req.body,["number"]));
    user.save();
    console.log(user);
    const token = jwt.sign(
        user.toJSON(), process.env.JWT_SECRET_KEY,
      );
    res.cookie('jwt',token,{httpOnly:true});
    res.cookie('userData',user._id);
    const OTPDelete=await Otp.deleteMany({
        number:rightOtpFind.number
    });
    return res.status(200).send({
        message: "User Register Successfully",
        token:token,
        data :user
    });
 } else{
       return res.status(400).send("Wrong Otp")

    }
}
