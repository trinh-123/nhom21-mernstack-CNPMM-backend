const mongoose=require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const orderSchema =new mongoose.Schema({
    customer:{type:mongoose.Types.ObjectId, ref:"User"},
    seller:{type:mongoose.Types.ObjectId,ref:"User"},
    totalPrice:Number,
    productList:Array,
    status:Number,
    city:String,
    street:String,
    district:String,
    statusRating:Number,
    phone:Number,
},
{timestamps:true}
)
orderSchema.plugin(mongoosePaginate);
const Order=mongoose.model("Order",orderSchema,"orders");
module.exports=Order