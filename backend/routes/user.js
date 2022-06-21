const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const User = require('../models/User');
const {requireLogin,admin} = require('../middleware/requireLoginRole');

router.get("/user/profile", requireLogin,(req,res) => {
    User.findById(req.user.id,function (err, userdata) {
        if(err){
            return res.status(500).json("Internal Server Error");
        }
        res.status(200).json({user: userdata});
    });
});

router.put("/user/modifyPassword", requireLogin, async (req,res) => {
    const {oldPassword,newPassword,confirmPassword} = req.body;
    if(!oldPassword || !newPassword || !confirmPassword){
        return res.status(422).json({error:"please provide all the details"});
    }
    const user = await User.findOne({_id:req.user.id}).select("+password");;
    // console.log(user);
    bcrypt.compare(oldPassword,user.password).then(doMatch=>{
        if(!doMatch){
            return res.status(400).json("Old password is incorrect");
        }
    })
    if(newPassword !== confirmPassword){
        return res.status(400).json("Password does not match");
    }
    bcrypt.hash(newPassword,12).then(hashedpassword=>{
        user.password = hashedpassword
        user.save().then((saveduser)=>{
            res.status(200).json({message:"password updated success", user : saveduser})
        })
     });
});

router.put("/user/updateProfile", requireLogin,(req,res) => {
    const userdetails = {
        name : req.body.name,
        email : req.body.email
    };
    //cloudinary change
    User.findByIdAndUpdate(req.user.id,userdetails,{new: true,runValidators:true}).then((userdata)=>{
        return res.status(200).json({user:userdata});
    }).catch(err => {
        return res.status(500).json("Internal Server Error");
    });
});


router.get("/user/admin/getUsers", requireLogin,admin("user"),(req,res) => {
    User.find().then(users => {
        res.status(200).json({users});
    }).catch((err) => {res.status(404).json(err)})
});

router.get("/user/admin/getUser/:id", requireLogin,admin("user"), async (req,res) => {
    const user = await User.findOne({_id:req.params.id});
    if(!user){
        return res.status(402).json("User does not exist");
    }
    res.status(200).json({user});
});

router.put("/user/admin/updateUserProfile/:id", requireLogin,admin("user"),(req,res) => {
    const userdetails = {
        name : req.body.name,
        email : req.body.email,
        role : req.body.role
    };
    User.findByIdAndUpdate(req.params.id,userdetails,{new: true,runValidators:true}).then((userdata)=>{
        return res.status(200).json({user:userdata});
    }).catch(err => {
        return res.status(500).json("Internal Server Error");
    });
});

router.delete("/user/admin/deleteUser/:id", requireLogin,admin("user"),async (req,res) => {
    const user = await User.findOne({_id:req.params.id});
    if(!user){
        return res.status(402).json("User does not exist");
    }
    user.remove();
    res.status(200).json("user deleted successfully!");
});

module.exports = router;