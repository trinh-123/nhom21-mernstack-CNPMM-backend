const Product=require("../models/product");
// const Validator=require("validatorjs");
// const { model } = require("../models/product");
var ObjectId = require("mongodb").ObjectId;

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports.searchProducts= async (req,res) => { 
    if(req.body.keyword){
        const regex =await new RegExp(escapeRegex(req.body.keyword),'gi');
        Product.find({ name:regex} , function(err,foundProduct) {
            if(err){
                return res.json(err);
            }
            else{
                return res.json(foundProduct);
            }
        });
    }else{
        Product.find({ } , function(err,foundProduct) {
            if(err){
                return res.json(err);
            }
            else{
                return res.json(foundProduct);
            }
        });
    }
};
module.exports.getByPrice = async (req,res) =>{
    const {page, perPage, priceId,categoryId,parentCategoryId} = req.query;
    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(perPage, 10) || 10,
    };
    var shirts;
    if(!categoryId && !priceId && !parentCategoryId){
        shirts =await Product.paginate({
            parentcategoryID:ObjectId("60507c6e89323c1f3c905655")
        },options);
        
    }
    if(!categoryId && priceId && parentCategoryId ){
        switch (priceId){
            case "1" :
                shirts =await Product.paginate({
                    parentcategoryID: ObjectId(parentCategoryId) ,
                    price : {$lt : 120}
                }, options);
                break;
            case "2":
                shirts =await Product.paginate({
                    $and:[
                        {parentcategoryID: ObjectId(parentCategoryId) },
                        {price : {$gte : 120}},
                        {price: {$lte:150}}
                    ]
                }, options);
                break;
            case "3":
                shirts =await Product.paginate({
                    parentcategoryID: ObjectId(parentCategoryId) ,
                    price : {$gt : 150}
                }, options);
                break;
        }
        
    }
    if(categoryId && !priceId && parentCategoryId){
        shirts = await Product.paginate(
            {
                parentcategoryID: ObjectId(parentCategoryId) ,
                categoryID: ObjectId(categoryId) ,
            },
            options
        );
        
    }
    if(categoryId && priceId && parentCategoryId){
        var shirts;
        switch (priceId){
            case "1" :
                shirts =await Product.paginate({
                    
                    $and:[
                    { parentcategoryID: ObjectId(parentCategoryId)} ,
                    {price : {$lt : 120}},
                    {categoryID: ObjectId(categoryId)},
                    ]
                    
                }, options);
                break;
            case "2":
                shirts =await Product.paginate({
                    $and:[
                        { parentcategoryID: ObjectId(parentCategoryId)} ,
                        {categoryID: ObjectId(categoryId)},
                        {price : {$gte : 120}},
                        {price: {$lte:150}}
                    ]
                }, options);
                break;
            case "3":
                shirts =await Product.paginate({
                    $and:[
                        { parentcategoryID: ObjectId(parentCategoryId)} ,
                        {price : {$gt : 150}},
                        {categoryID: ObjectId(categoryId)},
                    ]
                }, options);
                break;
        }
    }
    if(!categoryId && !priceId && parentCategoryId){
        shirts =await Product.paginate({
            parentcategoryID:ObjectId(parentCategoryId)
        },options);
        
    }
    return res.json(shirts);
}
module.exports.getProducts = async (req, res) => {
    const { page, perPage, categoryId, sellerId } = req.query;
    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(perPage, 10) || 10,
        populate: {
            path: "seller",
            model: "User",
        },
    };

    if (!categoryId && !sellerId ) {
        const shirts = await Product.paginate({}, options);
        return res.json(shirts);
    }

    const shirts = await Product.paginate(
        {
            $or: [
                { categoryID: ObjectId(categoryId) },
                { seller: ObjectId(sellerId) },
            ],
        },
        options
    );
    return res.json(shirts);
};
module.exports.getNameProducts=async(req,res) =>{
    const listNameProduct = await Product.find({}).select("name");
    return res.json(listNameProduct);
}
module.exports.getAllProduct=async(req,res)=>{
    const products=await Product.find({})
    return res.json(products);
}

module.exports.getProduct=async(req,res)=>{
    const {id_product:idProduct}=req.params;
    const product= await Product.findById(idProduct).populate("seller");
    return res.json(product);
}
module.exports.getProductBySeller=async(req,res)=>{
    const {seller:sellerId}=req.params;
    const product= await Product.find({seller:sellerId});
    return res.json(product);
}
module.exports.updateProduct = async (req, res) => {
    let objUpdate = req.body;
    const result = await Product.findOneAndUpdate(
        {_id:objUpdate._id},
        objUpdate,
        {
            new: true,
        }
    );
    res.status(201).json({ success: true, data: { user: result } });
};
module.exports.deleteProduct= async(req,res)=>{
    const {name}=req.body
    const shirt=await Product.findOneAndDelete({name:name})
    if (shirt) return res.json("Xóa thành công!")
    else return res.json("Xóa thất bại")
}
module.exports.getNewProduct = async (req, res) => {
    const result=await Product.find().sort({"_id": -1}).limit(4);
    res.json(result)
}
 module.exports.getNewproductBySeller=async(req,res)=>{
     const {seller}=req.params;
     if(seller===""||seller===null){
         return res.status(201).json({msg:"review your input"})
     }
     const result=await Product.find({seller}).sort({"_id":-1}).limit(4)
     res.status(200).json({success:true,msg:"Thành công",data:result})
 }
//get related products
module.exports.getRelateProduct =async(req,res)=>{
    const {id_product:idProduct}=req.params;
    const product=await Product.findById(idProduct);
    
    let results=await Product.find({categoryID:product.categoryID}).sort({"_id":-1}).limit(5);
    if(results.length<5){
        results=await Product.find({parentcategoryID:product.parentcategoryID}).sort({"_id":-1}).limit(5);
    }
    let finalResult= results.filter(result=>result.name!=product.name)
    
    res.status(200).json({
        data:finalResult
    })
}
