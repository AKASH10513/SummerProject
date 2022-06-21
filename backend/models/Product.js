const mongoose = require('mongoose');
const User = require("../models/User");

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    description: {
        type : String,
        required : true
    },
    price: {
        type: Number,
        required:true
    },
    pics : [
       {
            p_id : {
                type : String,
                required: true
            },
            url: {
                type:String,
                default:"https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460/"
            }
       }
    ],
    category : {
        type : String,
        required : true
    },
    likes:{
        type : Number,
        default : 0
    },
    comments:{
        type : Number,
        default : 0
    },
    stock: {
        type: Number,
        required : true,
        default : 1
    },
    countOfReviews:{
        type : Number,
        default: 1
    },
    like:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    comment:[{
        text:String,
        postedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
    }],
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    createdAt: {
        type : Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Product',productSchema);