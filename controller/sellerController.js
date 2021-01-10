const userModel= require("../models/user");
const productModel= require("../models/product");
const upload = require("../multer");
const cloudinary = require("../cloudinary");
const fs = require("fs");
const product = require("../models/product");


module.exports.postUpload= async (req,res)=>{
    const sellerId=await userModel.findById(req.user.id);
    const uploader=async (path)=> await cloudinary.uploads(path,"images");
    const urlsImage = [];
    const urlsPreview = [];
    const files = req.files;
    for(const file of files.images){
        const newPath= await uploader(file.path);
        urlsImage.push(newPath.url);
        fs.unlinkSync(file.path);
    }
    for(const filePrev of files.previewImgs){
        const newPath= await uploader(filePrev.path);
        urlsPreview.push(newPath.url);
        fs.unlinkSync(filePrev.path);
    }
    let productDoc={
        ...req.body,
        images:urlsImage,
        previewImgs:urlsPreview,
        seller:sellerId,
        createdAt:Date(),
    };
    const Product= new productModel(productDoc);
    await Product.save();
    const options={
        page:1,
        limit:10,
        populate:{
            path:"seller",
            model:"User",
        },
    }
     const products=await productModel.paginate({seller:req.user.id},options);
     
    res.status(201).json({success:true,products});
};