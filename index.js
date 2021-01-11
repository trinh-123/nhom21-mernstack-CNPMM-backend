const CryptoJS = require('crypto-js'); // npm install crypto-js
const express = require('express');
const mongoose= require('mongoose');
var nodemailer = require('nodemailer');
mongoose.set('useFindAndModify', false);
const bodyParser = require('body-parser')
const app = express();
const cors=require("cors");
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

require('dotenv').config()
const authRouter=require("./router/authRouter");
const profileRouter = require("./router/profileRouter")
const productRouter=require("./router/productRouter");
const adminRouter=require("./router/adminRouter");
const sellerRouter=require("./router/sellerRouter");
const categoriesRouter=require("./router/categoriesRouter");
const zalopayRouter = require("./router/zaloPayRouter");
mongoose.connect(process.env.MONGODB_URI,{ useUnifiedTopology: true,useNewUrlParser:true },
    () => console.log('connect to db'));

const port = 3001

  
//product   
app.use("/product",productRouter);
//categories
app.use("/categories",categoriesRouter);
//user

app.use("/auth", authRouter);
app.use("/profile",profileRouter);
app.use("/seller",sellerRouter);
app.use("/admin",adminRouter);
app.use("/zalopay",zalopayRouter);
app.listen(port, () =>{
    console.log(`Listening to port: ${port}`)
})



