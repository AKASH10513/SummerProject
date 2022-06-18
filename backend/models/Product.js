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
    rating: {
        type : Number,
        default : 0
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
    stock: {
        type: Number,
        required : true,
        default : 1
    },
    countOfReviews:{
        type : Number,
        default: 1
    },
    reviews : [
        {
             type : mongoose.Schema.Types.ObjectId,
             ref : "User",
             rating: {
                type : String,
                required : true
             },
             comment: {
                type : String,
                required : true
             }
        }
    ],
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    createdAt: {
        type : Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Product',productSchema);