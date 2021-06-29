const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    address: String,
    phone: String,
    groupid: Number,
    avatar:String,
    status: {type: Number, default:1},
    comments:[
        {
            author:{type:mongoose.Types.ObjectId, ref:"User"},
            content:String,
            rating:Number,
            createdAt:Date,
        },
    ],
    cart:[
            {
                product:{type:mongoose.Types.ObjectId, ref:"Product"},
                amount:Number,
            },
    ],
    favorites:[
        {
            shirt:{type:mongoose.Types.ObjectId,ref:"Product"},
        },
    ],
},
    {timestamps: true}
);

var User=mongoose.model("User", userSchema, "users")
module.exports= User;