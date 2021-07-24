
var User = require("../models/user");
var Contact=require("../models/contact");
const Order = require("../models/order");
var Product = require("../models/product");
module.exports.getUser = async (req, res) => {
    const { groupid } = req.query;
    if (groupid == 1) {
        const buyer = await User.find({ groupid: 1 });
        return res.json({ success: true, data: buyer });
    }
    if (groupid == 2) {
        const seller = await User.find({ groupid: 2 });
        return res.json({ success: true, data: seller });
    }
    return res.status(404).json({ success: false, data: "get user failed!" });
};

module.exports.getOrders = async (req, res) => {
    const orders = await Order.find({}).populate("customer");
    res.json({ success: true, orders });
};
module.exports.getContacts=async(req,res)=>{
    const contacts = await Contact.find({});
    res.json({success:true,contacts});
}
module.exports.deleteContacts=async(req,res)=>{
    const result=await Contact.findOneAndDelete({_id:req.body.id});
    if (result) return res.json("Xóa thành công!")
    else return res.json("Xóa thất bại")
}
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
    const orders = await Order.find({}).populate("customer");
    res.json({ success: true, orders });
};

module.exports.banUser = async (req, res) => {
    const { email, status } = req.body;
    var user;
    if (status == "Đã bị ban") {
        user = await User.findOneAndUpdate({ email: email }, { status: 1 });
    } else {
        user = await User.findOneAndUpdate({ email: email }, { status: 0 });
    }
    if (user)
        return res.json({
            success: true,
            msg: "Thay đổi trạng thái thành công!",
        });
    else
        return res.json({
            success: false,
            msg: "Thay đổi trạng thái thất bại!",
        });
};
