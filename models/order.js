const mongoose=require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const orderSchema =new mongoose.Schema({
    customer:{type:mongoose.Types.ObjectId, ref:"User"},
    cart:{totalPrice:Number,productList:Array,size:String},
    status:Number,
},
{timestamps:true}
)
orderSchema.plugin(mongoosePaginate);
const Order=mongoose.model("Order",orderSchema,"orders");
module.exports=Order