const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const {search,filter,pagination} = require('../Search/queryFilterAndPagination');
const {requireLogin,admin} = require('../middleware/requireLoginRole');

router.route("/products").get((req,res,next) => {
    const s = search(req.query.search);
    const f = filter(req.query);
    const newQuery = {...s,...f};
    const skip = pagination(this.query);
    // console.log(newQuery);
    Product.find(newQuery).limit(process.env.ITEMS).skip(skip).then((product) => res.status(200).json({product})).catch((err) => {
        return res.status(404).json({error:"Products not found"});
    });
});

router.route("/product/:id").get(async(req,res,next) => {
    const id = req.params.id;
    const NumberOfProducts = await Product.countDocuments();
    Product.findById(id).then((product) => res.status(200).json({product,NumberOfProducts})).catch((err) => {
        return res.status(404).json({error:"product not available"});
    });
});


router.post("/product/newProduct",requireLogin,admin("user"),async (req,res,next) => {
    req.body.user = req.user.id;
    await Product.create(req.body, function (err, product) {
        if(err){
            return res.status(404).json("Unsuccessful in creating the new product");
        }
        product.save().then(result => {
            return res.json({product:result});
        }).
        catch(err => { return res.status(500).json("Internal Server Error")});
    });
});

router.route("/product/:id").put(requireLogin,(req,res,next) => {
    const id = req.params.id;
    Product.findByIdAndUpdate(id,req.body,{new: true,runValidators:true}).then((product)=>{
        return res.status(200).json({product:product});
    }).catch(err => {
        return res.status(500).json("Product not found");
    });
    
});

router.route("/product/deleteProduct/:id").delete(requireLogin,admin("user"),async (req,res,next) => {
    const id = req.params.id;
    await Product.findById(id, function(err,product){
        if(err){
            return res.status(500).json("Product not found");
        }
        product.remove();
        res.status(200).json("Product removed successfully");
    });
});

router.route("/product/review/like").put(requireLogin, (req,res) => {
    const {productId} = req.body;
    Product.findByIdAndUpdate(productId,{
        $push:{like:req.user.id}
    },{new:true}).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})
router.route("/product/review/unlike").put(requireLogin, (req,res) => {
    const {productId} = req.body;
    Product.findByIdAndUpdate(productId,{
        $pull:{like:req.user.id}
    },{new:true}).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})
router.route("/product/review/comment").put(requireLogin, (req,res) => {
    const {productId} = req.body;
    const commentdetail = {
        text:req.body.text,
        postedBy:req.user.id
    }
    Product.findByIdAndUpdate(productId,{
        $push:{comment:commentdetail}
    },{new:true}).populate("comment.postedBy","_id name")
    .populate("postedBy","_id name").exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

router.route("/product/review/deleteComment").put(requireLogin, async (req,res) => {
    const id = req.user.id;
    const {productId} = req.body;
    const product = await Product.findOne({_id : productId});
    const commentArr = product.comment;
    const newCommentArr = commentArr.filter((comment) => {comment.postedBy !== id});
    product.comment = newCommentArr;
    product.save();
    res.status(200).json("deleted the product successfully");
})

module.exports = router;