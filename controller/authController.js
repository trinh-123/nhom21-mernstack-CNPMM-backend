const User=require("../models/user");
const Product=require("../models/product");
const Cart=require("../models/cart")
const Order=require("../models/order");
const ObjectId=require("mongodb").ObjectId;
const { findById } = require("../models/user");
const Validator=require("validatorjs");
const upload = require("../multer");
const cloudinary = require("../cloudinary");
const nodemailer=require("nodemailer");
var jwt = require('jsonwebtoken');
const ContactModel=require("../models/contact");
let secret = process.env.JWT_SECRET
const axios = require('axios').default;
const CryptoJS=require("crypto-js")
const graphUrl = "https://graph.facebook.com"
const version = "v4.0"
const facebook_secret = "e0e1c5672975422d1567e95e0bd62b0a"
const {OAuth2Client}=require("google-auth-library");
const client=new OAuth2Client("75435593592-ibbekma2opi25sc4bnfnrr276ki2ne01.apps.googleusercontent.com")
//code here
module.exports.callback=async (req,res)=>{
    let cart= await Cart.findOne({userID:req.user.id});
    if(cart.totalPrice==0){
        return res.status(201).json({
            success:false,
            msg:"Giỏ hàng đang rỗng"
        })
    }
    let order= await Order.create({
        customer:ObjectId(req.user.id),
        cart:{
            totalPrice:cart.totalPrice,
            productList:cart.productList},
        status:2,
    });
    
    await Cart.findOneAndUpdate(
        {userID:req.user.id},
        {totalPrice:0,productList:[]}
    );
    if(order){
        return res.status(201).json({success:true});
    }
    res.status(500).json({success:false});
}
module.exports.callbackFacebook= async (req,res)=>{
    let rules = {
        accessToken:"required",
      };
    let validation = new Validator(req.body, rules);
    if(validation.fails()){
        return res.status(422).json({msg:validation.errors.all()})
    }
    let token = req.body.accessToken
    
    var fields = ["name", "email", "gender", "verified", "link"]
    let meURL = graphUrl + "/" + version + "/me?access_token=" + token + "&fields=" + fields.join(",")
    let appSecretProof = CryptoJS.HmacSHA256(token, facebook_secret).toString();
    meURL += "&appsecret_proof=" + appSecretProof;
    axios.get(meURL,{
        headers: {
            "Content-Type": "application/json"
        },
    });
    const id=req.body.id;
    const email=req.body.email;
    const userByidFB=await User.findOne({id});
    const userByemail =await User.findOne({email})
       
    if(userByidFB==null && userByemail==null)
    {
        var user=await User.create(req.body);
        const set_pass = await User.findOneAndUpdate({_id:user.id}, {password: '1', groupid: 1},{
            new: true,
        })
        
        let accessToken = jwt.sign({
            id:user._id,
            email:user.email
            },secret, { expiresIn: "2d" });
        res.status(201).json({
            success: true,
            data: { accessToken, user: set_pass },
        });
    }
    else{
            const { email} = req.body;
            const userByEmail = await User.findOne({ email });
            
            const payload = {
                user: {
                    id: userByEmail.id,
                    email: userByEmail.email,
                    groupid: userByEmail.groupid,
                },
            };
            const accessToken = jwt.sign(payload, secret, {
                expiresIn: "2d",
            });
            res.status(201).json({
                success: true,
                data: { accessToken, user: userByEmail },
            });
        }
}
module.exports.callbackGoogle=async(req,res)=>{
    const {tokenId}=req.body;
    client.verifyIdToken({idToken: tokenId,audience:"75435593592-ibbekma2opi25sc4bnfnrr276ki2ne01.apps.googleusercontent.com"})
    .then(response=>{
        const {email_verified,name,email}=response.payload;
        if(email_verified){
            User.findOne({email}).exec((err,user)=>{
                if(err){
                    return res.status(400).json({
                        error:"====no"
                    })
                }else {
                    if(user){
                        const token=jwt.sign({_id:user._id},secret,{expiresIn:"2d"})
                        res.json({
                            success:true,
                            data: { token, user: user } 
                        })
                    }else{
                        const groupid=1;
                        let newUser=new User({name,email,groupid});
                        newUser.save((err,data)=>{
                            if(err){
                                return res.status(400).json({
                                    error:"====no"
                                })
                            }
                            const token=jwt.sign({_id:data._id},secret,{expiresIn:"2d"})
                        res.status(201).json({
                            success:true,
                            data: { token, user: newUser }, 
                            })
                        })
                    }
                }
            })
        }
    })
}
module.exports.postContact=async(req,res)=>{
    const Objectnew= await ContactModel.create({...req.body,createdAt:Date()});
    console.log(Objectnew)
    if(Objectnew){
        res.status(201).json({success:true});

    }
}
module.exports.postForgetPass=async(req,res)=>{
    const {email}=req.body;
    var text="";
    var possiable="0123456789";
    for(var i=0;i<10;i++)
    {
        text+=possiable.charAt(Math.floor(Math.random()*possiable.length));
    }
    const userByEmail=await User.findOne({email});
    if(!userByEmail){
        return res.status(202).json({ msg: "Email không tồn tại!",success:false})
    }
    let password=text;
    const newupdate=await User.findOneAndUpdate(
        {_id:userByEmail._id},
        {password},
        {
            new:true
        }
    )
        transporter= nodemailer.createTransport(//"smtps://huynhnhan199999%40gmail:Huynhnhan999@smtp.gmail.com"
        {
        host:"smtp.gmail.com",
        port:465,
        secure: true,
        auth:{
                user:"huynhnhan199999",
                pass:"Huynhnhan999"
            }
        }
    );
        let mainOptions = { 
            to: email,
            subject: "Thay đổi mật khẩu",
            text:"Mật khẩu mới của bạn là:"+ text+"",
        }
        transporter.sendMail(mainOptions,(error,mainOptions)=>{
            if(error){
                return res.status(201).json({ msg: error
                })
            }
            return res.status(200).json({success:true,
                msg:"Đã gửi mật khẩu mới cho bạn. Vui lòng kiểm tra email",
                data:{user: newupdate}
            })
        })
}
module.exports.postChangePassword = async function (req,res)  {
    const {newPassword,userId} = req.body;

    const newupdate=await User.findOneAndUpdate(
        {_id:userId},
        {password:newPassword},
        {
            new:true
        }
    )
    return res.status(200).json({
        success:true,
        msg:"Đã thay đổi mật khẩu thành công!",
        data:{user: newupdate}
    })
}
module.exports.postRegister = async function (req, res){
    
    const {email}=req.body;
    const userByEmail=await User.findOne({email});
    console.log(userByEmail)
    if(userByEmail){
        return res.status(201).json({
            success:false,
            msg: "Email đã tồn tại",
        });
    }
    var user = await User.create(req.body);
    const cart=new Cart({
        userID:user._id,
    });
    await cart.save();
    // let access_token = jwt.sign({
    //     id:user._id,
    //     email:user.email
    //   },secret, { expiresIn: 60 * 60 });
    res.status(201).json({ 
        success: true,
        msg: "Đã đăng kí thành công sẽ chuyển sang trang đăng nhập vài giây",
        data: { user } });
    // return res.status(201).json({
    //     message:"Create user successfully",
    //     access_token,
    // })
}

module.exports.postLogin = async (req, res) => {
    const { email, password, groupid } = req.body;
    const userByEmail = await User.findOne({ email });
    if (userByEmail === null) {
        return res
            .status(202)
            .json({ success: false, msg: "Username không tồn tại" });
    } else {
        if (password !== userByEmail.password) {
            return res
                .status(202)
                .json({ success: false, msg: "Mật khẩu không đúng" });
        }
        if ( groupid !== userByEmail.groupid ) {
            return res
                .status(202)
                .json({ success: false, msg: "Lỗi quyền truy cập" });
        }
        if (userByEmail.status === 0) {
            return res.status(202).json({
                success: false,
                msg: "Lỗi truy cập. Tài khoản đã bị khóa",
            });
        }
    
    }

    const payload = {
        user: {
            id: userByEmail.id,
            email: userByEmail.email,
            groupid: userByEmail.groupid,
        },
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2d",
    });
    res.status(201).json({
        success: true,
        data: { accessToken, user: userByEmail },
    });
};
module.exports.postUpdateUser=async(req,res)=>{
    let ObjUpdate=req.body;
    const result=await User.findOneAndUpdate(
        {_id:req.body.id},
        ObjUpdate,
        {
            new: true,
        }
    )
   return res.status(201).json({
        success:true,
        data: {user:result}
    })
}

module.exports.getCart = async (req, res) => {
    const cart = await Cart.findOne({ userID: req.user.id });
    return res.json(cart);  
};
module.exports.addToCart=async(req,res)=>{
    const {productID,amount,size,userId}=req.body;
    //let user=req.user;
    var duplicate=false;
    const product=await Product.findById(productID);
    const cart=await Cart.find({userID: userId});
    var totalPrice=0;
    if(cart[0].productList.forEach((element) => {
        if(element.productID._id==productID){
            element.amount=parseInt(element.amount)+parseInt(amount);
            dupticate=true;
        }
        totalPrice+=parseInt(element.amount*element.productID.price);
    }))
    var update;
    if(duplicate){
        update=await Cart.findOneAndUpdate(
            {userID:userId},
            {
                productList:cart[0].productList,
                totalPrice:totalPrice,
            }
        );
    }
    else{
        update=await Cart.findOneAndUpdate(
            {userID:userId},
            {
            $push:{
                productList:{
                    size:size,
                    amount:amount,
                    productID:product,
                },
            },
            $inc: {
                totalPrice:parseInt(amount*product.price)
            },
        }
        );
    }
    const result=await Cart.find({userID:userId});
    if(update)
    res.status(201).json({success:true,data:result});
};
module.exports.updateCart=async(req,res)=>{
    const{productID,amount,size}=req.body;
    const cart=await Cart.findOne({userID:req.user.id});
    let productList=[...cart.productList];

    let distance=0;
    for(let product of productList){
        if(productID===product.productID._id.toString()){
            distance=
                product.productID.price*amount-
                product.productID.price* product.amount;
            product.amount=amount;
            break;
        }
    }

    var totalPrice=parseInt(cart.totalPrice)+distance;
    console.log(totalPrice);
    const update=await Cart.findOneAndUpdate(
        {userID:req.user.id},
        {
            productList,
            totalPrice,
            size
        },
        {new:true}
    );
    const result=await Cart.findOne({userID:req.user.id});
    res.status(201).json({success:true,data:result});
};
module.exports.getUserById = async (req, res) => {
    const { ID } = req.query;
    const user = await User.findById(ID).populate("comments.author");
    return res.json(user);
};
module.exports.removeFromCart=async (req,res)=>{
    const{productID}=req.body;
    const cart=await Cart.find({userID:req.user.id});
    var totalPrice=cart[0].totalPrice;
    for(let i=0;i<cart[0].productList.length;i++){
        if(cart[0].productList[i].productID._id==productID){
            totalPrice-=parseInt(
                cart[0].productList[i].amount* cart[0].productList[i].productID.price
            );
            cart[0].productList.splice(i,1);
            break;
        }
    }
    const update=await Cart.findOneAndUpdate(
        {userID:req.user.id},
        {
            productList:cart[0].productList,
            totalPrice:totalPrice,
        }
    );
    const result=await Cart.findOne({userID:req.user.id});
    if(update)res.status(201).json({success:true,data:result});
}
module.exports.addOrder=async (req,res)=>{
    let cart=await Cart.findOne({userID:req.user.id});
    if(cart.totalPrice==0){
        return res.status(201).json({
            success:false,
            msg:"Giỏ hàng đang rỗng"
        })
    }
    let order=await Order.create({
        customer:ObjectId(req.user.id),
        cart:{
            totalPrice:cart.totalPrice,
            productList:cart.productList},
        status:0,
    });
    
    await Cart.findOneAndUpdate(
        {userID:req.user.id},
        {totalPrice:0,productList:[]}
    );
        //send mail
    const userBycustomer=await User.findOne(order.customer);
    transporter = nodemailer.createTransport(//"smtps://huynhnhan199999%40gmail:Huynhnhan999@smtp.gmail.com"
        {
        host:"smtp.gmail.com",
        port:465,
        secure: true,
        auth:{
            user:"huynhnhan199999",
            pass:"Huynhnhan999"
        }
    }
    );
    let mainOptions = { 
        to: userBycustomer.email,
        subject: "Thông tin đơn hàng từ TNShop",
        text:"Tổng hóa đơn của bạn là:"+ order.cart.totalPrice+"000đ"+"\n"+ "Cảm ơn sự ủng hộ của bạn",
    }
    transporter.sendMail(mainOptions,(error,mainOptions)=>{
        if(error){
            return res.status(201).json({ msg: error
            })
        }
        return res.status(200).json({success:false,
            msg:mainOptions
        })
    })
    if(order){
        return res.status(201).json({success:true});
    }
    res.status(500).json({success:false});
};
module.exports.orders=async (req,res)=>{
    const orders=await Order.find({customer:req.user.id});
    console.log(orders);
    res.status(200).json({success:true,orders});
};
module.exports.changeStatus=async(req,res)=>{
    let result=await Order.findByIdAndUpdate(req.params.idOrder,{
        status:req.body.status,
    });
    const orders=await Order.find({}).populate("customer");
    res.json({success:true,orders});
};
module.exports.Comment=async (req,res)=>{
    const {rating,content,sellerID} =req.body;
    let user =await User.findById(req.user.id);
    const createdAt= Date.now();
    const seller = await User.findOneAndUpdate(
        {_id:ObjectId(sellerID)},
        {
            $push:{
                comments:{
                    author:user,
                    rating:rating,
                    content:content,
                    createdAt:createdAt,
                },
            },
        },
        {new:true}
    ).populate("comments.author");
    console.log(seller);

    if(seller){
        return res.status(201).json({success:true,comments:seller.comments});
    }else{
        return res.status(204).json({success:false,data:"Comment Failed"});
    }
}
module.exports.commentProduct= async (req,res) => {
    const {rating,content,productID} =req.body;
    let user =await User.findById(req.user.id);
    const createdAt= Date.now();
    const product = await Product.findOneAndUpdate(
        {_id:ObjectId(productID)},
        {
            $push:{
                comments:{
                    author:user,
                    rating:rating,
                    content:content,
                    createdAt:createdAt,
                },
            },
        },
        {new:true}
    ).populate("comments.author");

    if(product){
        return res.status(201).json({success:true,comments:product});
    }else{
        return res.status(204).json({success:false,data:"Comment Failed"});
    }
}
module.exports.addToFavorite =async function(req,res) {
    let shirt =await Product.findById(req.body.idShirt);
    let user = await User.findById(req.user.id);
    let favorites =user.favorites;
    for(let item of favorites){
        if(req.body.idShirt==item.shirt){
            return res.json({
                success:false,
                msg:"Đã có trong danh sách yêu thích"
            });
        }
    }
    await User.findOneAndUpdate(
        {_id:ObjectId(req.user.id)},
        {$push:{favorites:{ shirt } } },
        {new:true}
    );
    res.status(201).json({success:true});
}
module.exports.getFavorites=async function (req,res){
    let user =await User.findById(req.user.id).populate("favorites.shirt");
    res.json({success:true,favorites:user.favorites});
}
module.exports.deleteFavorite= async function (req,res){
    let user= await User.findOneAndUpdate(
        {_id: ObjectId (req.user.id)},
        {
            $pull:{favorites:{shirt:req.body.idShirt}}
        },
        {new:true}
    ).populate("favorites.shirt");
    res.json({success:true,favorites:user.favorites});
}
module.exports.uploadAvatar=async function(req,res) {
    const uploader=async (path)=> await cloudinary.uploads(path,"images");
    const newPath=await uploader(req.file.path);
    const result = await User.findOneAndUpdate(
        {_id:ObjectId(req.user.id)},
        {avatar:newPath.url},
        {new:true}
    );
    res.status(200).json({success:true,avatar:newPath.url});
}

module.exports.deleteAvatar=async function(req,res){
    const result=await User.findOneAndUpdate(
        {_id:ObjectId(req.user.id)},
        {
            avatar:undefined
        }
    );
    res.status(201).json({success:true,avatar:undefined})
}
