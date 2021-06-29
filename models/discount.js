const mongoose=require('mongoose');
const mongoosePaginate = require("mongoose-paginate");
const discountSchema=new mongoose.Schema({
    userID:{type:mongoose.Types.ObjectId,ref:"User"},
    discount:[
        {
            code:String,
            price:Number,
            status:Number,
            createdAt:Date,
        }
    ],
},
{timestamps:true}
);
discountSchema.plugin(mongoosePaginate);
const Discount=mongoose.model("Discount",discountSchema,"discounts");
module.exports=Discount