const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const product = require('./routes/product');
const auth = require('./routes/auth');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
require('./models/User');
require('./models/Product');
const app = express();
dotenv.config({path: "backend/config/.env"});



app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/',product);
app.use('/',auth);

mongoose.connect(process.env.MONGOURL,{useNewUrlParser: true,
    useUnifiedTopology: true,}).then(() => {
    console.log("Successfully connected to database");
}).catch((err) => {
    console.log("Error occurred!", err);
});

app.listen(process.env.PORT || 5000, ()=>{
    console.log("Listening at port",process.env.PORT);
});