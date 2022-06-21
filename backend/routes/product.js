const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const {search,filter,pagination} = require('../Search/queryFilterAndPagination');
const {requireLogin,admin} = require('../middleware/requireLoginRole');

router.route("/products").get(requireLogin,(req,res,next) => {
    const s = search(req.query.search);
    const f = filter(req.query);
    const newQuery = {...s,...f};
    const skip = pagination(this.query);
    // console.log(newQuery);
    Product.find(newQuery).limit(process.env.ITEMS).skip(skip).then((product) => res.status(200).json({product})).catch((err) => {
        return res.status(404).json({error:"Products not found"});
    });
});

router.route("/product/:id").get(requireLogin,async(req,res,next) => {
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
            return res.status(404).json("Unsuccessfull in creating the new product");
        }
        product.save().then(result => {
            return res.json({product:result});
        }).
        catch(err => { return res.status(500).json("Internal Server Error")});
    });
});

router.route("/product/:id").put(requireLogin,async (req,res,next) => {
    const id = req.params.id;
    await Product.findByIdAndUpdate(id,req.body,{new: true,runValidators:true}).then((product)=>{
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

module.exports = router;