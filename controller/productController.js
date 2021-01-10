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
    console.log(objUpdate);
    const result = await Product.findOneAndUpdate(
        {_id:objUpdate._id},
        objUpdate,
        {
            new: true,
        }
    );
    console.log(result);
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
