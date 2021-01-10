
var User = require("../models/user");
var Contact=require("../models/contact");
const Order = require("../models/order");

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
    console.log(req.body.id);
    const result=await Contact.findOneAndDelete({_id:req.body.id});
    if (result) return res.json("Xóa thành công!")
    else return res.json("Xóa thất bại")
}
module.exports.changeStatus = async (req, res) => {
    let result = await Order.findByIdAndUpdate(req.params.idOrder, {
        status: req.body.status,
    });
    console.log(result);
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
