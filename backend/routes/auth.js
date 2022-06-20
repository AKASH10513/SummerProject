const express = require('express');
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { hostname } = require('os')
const router = express.Router();
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const {SENDGRID_API} = require('../config/.env')

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:SENDGRID_API
    }
}));

router.route('/signup').post( async (req,res) =>{
    const {email,name,password} = req.body;
    if(!email || !name || !password){
        return res.status(422).json({error:"please add all the fields"})
    }
    const user = await User.findOne({emai:email});
    if(user){
        return res.status(422).json({error:"user already exists with that email"})
    }
    bcrypt.hash(password,12)
      .then(hashedpassword=>{
            const user = new User({
                email,
                password:hashedpassword,
                name,
                pic:{
                    p_id : "..."
                },
            })
            user.save().then(result => {
                res.json({user:result});
            }).
            catch(err => {res.status(500).json("Internal Server Error")});
        })
});


router.route('/signin').post( async (req,res) => {
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(422).json({error:"please add email or password"})
    }
    const user = await User.findOne({email:email}).select("+password");
    if(!user){
        return res.status(422).json({error:"Invalid Email or password"})
    }
     bcrypt.compare(password,user.password)
        .then(doMatch=>{
            if(doMatch){
                // res.json({message:"successfully signed in"})
               const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{
                expiresIn: process.env.JWT_EXPIRE,
               });
               const {_id,name,email,pic,role} = user;
               res.status(200).cookie('token', token, { httpOnly: true,
                expires : new Date(Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000)
            }).json({token,user:{_id,name,email,pic,role}});
            }
            else{
                return res.status(422).json({error:"Invalid Email or password"})
            }
        })
        .catch(err=>{
            console.log(err)
        })
});

router.route('/signout').get((req,res) => {
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly:true
    });
    res.status(200).json("Successfully logged out");
});

router.route('/resetPassword').post((req,res) => {
    crypto.randomBytes(32,(err,buffer) =>{
        if(err) console.log(err);
        const resetToken = buffer.toString('hex');
        User.findOne({email:req.body.email}).then((user) => {
            if(!user){
                return res.status(422).json({error:"User does not exist with that email"})
            }
            user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            user.expireToken = Date.now() + 3600000;
            user.save({validateBeforeSave:false}).then(()=>{
                let host = req.hostname;
                transporter.sendMail({
                    to:user.email,
                    from: process.env.EMAIL,
                    subject:"Password reset",
                    html:`
                    <p>You requested for password reset</p>
                    <h5>click on this <a href="${req.protocol}://${host}/reset/${resetToken}">link</a> to reset password</h5>
                    `
                })
                res.status(200).json({message:"check your email"})
            }).catch((err) => {
                user.resetToken = undefined;
                user.expireToken = undefined;
                user.save({validateBeforeSave:false});
                return res.status(500).json(err);
            });

        });
    });
});

router.route('/reset/:token').put(async (req,res) => {
    const token = req.params.token;
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        resetToken:resetPasswordToken,
        expireToken:{$gt:Date.now()}
    });
    if(!user){
        return res.status(422).json({error:"Try again session expired or invalid reset password token"})
    }
    if(req.body.password !== req.body.confirmPassword){
        return res.status(400).json({error:"Password does not match"});
    }
    bcrypt.hash(newPassword,12).then(hashedpassword=>{
        user.password = hashedpassword
        user.resetToken = undefined
        user.expireToken = undefined
        user.save().then((saveduser)=>{
            res.status(200).json({message:"password updated success"})
        })
     });
});

module.exports = router;