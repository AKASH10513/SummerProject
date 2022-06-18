const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const {search,filter} = require('../Search/queryFilterAndPagination');

router.route("/products").get((req,res,next) => {
    const s = search(req.query.search);
    const f = filter(req.query);
    const newQuery = {...s,...f};
    // console.log(newQuery);
    Product.find(newQuery).then((product) => res.status(200).json({product})).catch((err) => {
        return res.status(404).json({error:"Products not found"});
    });
});

router.route("/product/:id").get((req,res,next) => {
    const id = req.params.id;
    Product.findById(id).then((product) => res.status(200).json({product})).catch((err) => {
        return res.status(404).json({error:"product not available"});
    });
});


router.route("/product/newProduct").post(async (req,res,next) => {
    await Product.create(req.body, function (err, product) {
        if(err){
            return res.status(404).json("Unsuccessfull in creating the new product");
        }
        product.save().then(result => {
            res.json({product:result});
        }).
        catch(err => {res.status(500).json("Internal Server Error")});
        return res.status(201).json({success : true,product});
    });
});

router.route("/product/:id").put(async (req,res,next) => {
    const id = req.params.id;
    await Product.findById(id, function(err,product){
        if(err){
            return res.status(500).json("Product not found");
        }
        Product.findByIdAndUpdate(id,req.body,{new: true,runValidators:true},function (err){
            res.status(404).json({error: err});
        })
    });
});

router.route("/product/deleteProduct/:id").delete(async (req,res,next) => {
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