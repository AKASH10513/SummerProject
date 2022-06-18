const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const product = require('./routes/product');
const validator = require('validator');
require('./models/User');
require('./models/Product');
const app = express();


dotenv.config({path: "backend/config/.env"});
app.use(express.json());
app.use('/',product);

mongoose.connect(process.env.MONGOURL,{useNewUrlParser: true,
    useUnifiedTopology: true,}).then(() => {
    console.log("Successfully connected to database");
}).catch((err) => {
    console.log("Error occurred!", err);
});

app.listen(process.env.PORT || 5000, ()=>{
    console.log("Listening at port",process.env.PORT);
});