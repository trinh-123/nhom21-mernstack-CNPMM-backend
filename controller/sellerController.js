const userModel= require("../models/user");
const productModel= require("../models/product");
const Order=require("../models/order");
const upload = require("../multer");
const cloudinary = require("../cloudinary");
const fs = require("fs");
const Product = require("../models/product");

module.exports.changeStatus = async (req, res) => {
    let result = await Order.findByIdAndUpdate(req.params.idOrder, {
        status: req.body.status,
    });
    let productArr=[];
    result.productList.forEach((x)=>{
        productArr.push({"productId":x.productID._id,"amount":x.amount})
    })
    if(req.body.status==4 && result.status!=4){
        var product;
        productArr.forEach(async(x)=>{
            product = await Product.findById({_id:x.productId});
            const quantitysold=product.quantitysold-x.amount;
            await Product.findByIdAndUpdate(
                {_id:x.productId},
                {quantitysold:quantitysold},
                {new:true}
            )
        })
    }
    if(req.body.status==1 && result.status==4 || req.body.status==2 && result.status==4 || req.body.status==3 && result.status==4){
        var product;
        productArr.forEach(async(x)=>{
            product = await Product.findById({_id:x.productId});
            const quantitysold=product.quantitysold+x.amount;
            await Product.findByIdAndUpdate(
                {_id:x.productId},
                {quantitysold:quantitysold},
                {new:true}
            )
        })
    }
    const orders = await Order.find({seller:req.user.id}).populate("customer");
    res.json({ success: true, orders });
};

module.exports.findOrderBySeller=async (req,res)=>{
    const orders= await Order.find({seller:req.user.id}).populate("customer");
    res.status(201).json({
        success:true,
        orders
    })
}
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
        quantitysold:0,
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
module.exports.productBestSeller=async(req,res)=>{
    const {id_Seller}=req.params
   const productBySeller= await productModel.find({seller:id_Seller,quantitysold:{$gt:0}}).sort({"quantitysold": -1}).limit(4);
   res.json({data:productBySeller})

// Loop through cart items

}