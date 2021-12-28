const router=require('express').Router();
const { verify } = require('crypto');
const { signUp,verifyOtp}=require('../Controllers/UserController')
const { requireAuth}=require('../Middleware/Auth')

router.route('/signup')
.post(signUp);

router.route('/signup/verify')
.post(verifyOtp)


module.exports=router;