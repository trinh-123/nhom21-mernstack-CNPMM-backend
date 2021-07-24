const User=require("../models/user");
const Product=require("../models/product");
const Cart=require("../models/cart")
const Order=require("../models/order");
const Discount =require("../models/discount");
const Mes=require("../models/messenger");
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
const facebook_secret = "6a08f065f06bb21286b9373da7b713cf"
const {OAuth2Client}=require("google-auth-library");
const client=new OAuth2Client("75435593592-ibbekma2opi25sc4bnfnrr276ki2ne01.apps.googleusercontent.com")
//code here

//get all user for chat
module.exports.getAllUserForChat = async (req, res) => {
    let id = req.user.id
    console.log(id)
    const users = await Mes.find({id_user1:ObjectId(id)})
    let arr =[]
    for(const element of users){
        let items=await User.findOne({_id:ObjectId(element.id_user2)})
        arr.push(items)
    }
    res.json(arr)

}

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
    if(userByEmail){
        return res.status(201).json({
            success:false,
            msg: "Email đã tồn tại",
        });
    }
    var user = await User.create(req.body);
    const cart=new Cart({
        userID:user._id,
        feeDelivery:11
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
//#region Cart
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
    var feeDelivery=11;
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
                    sellerId:product.seller.toString()
                },
            },
            $inc: {
                totalPrice:parseInt(amount*product.price)
            },
        }
        );
    }
    update =await Cart.findOneAndUpdate(
        {userID:userId},
        {
            feeDelivery:feeDelivery,
        },
        {new:true}
    )
    const result=await Cart.find({userID:userId});
    if(update)
    res.status(201).json({success:true,data:result});
};
module.exports.updateFeeDelivery=async(req,res)=>{
    const {fee} =req.body;
    await Cart.findOneAndUpdate(
        {userID:req.user.id},
        {
            feeDelivery:fee
        },
        {new:true}
    );
    const result=await Cart.findOne({userID:req.user.id});
    res.status(201).json({success:true,data:result});
}
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
module.exports.updateCartWhenApplyDiscount = async (req,res) =>{
    const {code,userID}=req.body;
    const cart = await Cart.findOne({ userID: userID});
    let sellerIDList = [];
    let count =0;
    cart.productList.forEach(x=>{
        sellerIDList.push(x.sellerID);
    })
    for(var i=1;i<sellerIDList.length;i++){
        if(sellerIDList[0]!=sellerIDList[i]){
            count++;
        }
    }
    if(count>0){
        res.status(201).json({success:false,msg:"Mã này chỉ áp dụng cho 1 cửa hàng"});
    }else{
        const discountTable = await Discount.find({});
        let sellerID="";
        discountTable.forEach(x=>{
            x.discount.forEach(y=>{
                if(y.code==code ){
                    sellerID=x.userID;
                }
            })
        })
        if(sellerID!="" && cart.productList[0].sellerId==sellerID){
            const discountOfSeller=await Discount.findOne({userID:sellerID});
            let totalPrice=cart.totalPrice;
            let discount=[...discountOfSeller.discount];
            discount.map(x=>{
                if(x.code==code){
                    x.status=1;
                    totalPrice=totalPrice-x.price/1000;
                }
            })
            await Discount.findOneAndUpdate(
                {userID:sellerID},
                {
                    discount,
                },
                {new:true}
            );
            await Cart.findOneAndUpdate(
                {userID:userID},
                {
                    totalPrice,
                },
                {new:true}
            )
            res.status(201).json({success:true,msg:"Áp dụng voucher thành công"});
        }else{
            res.status(201).json({success:false,msg:"Mã voucher của bạn không hợp lệ hoặc áp dụng sai cửa hàng"});
        }
    }
}
module.exports.getDiscount = async (req,res)=>{
    const { ID } = req.query;
    const user = await Discount.findOne({userID:ID}).populate("comments.author");
    return res.json(user);
}
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
//#endregion Cart
module.exports.getUserById = async (req, res) => {
    const { ID } = req.query;
    const user = await User.findById(ID).populate("comments.author");
    return res.json(user);
};

//#region 
module.exports.OrderDetail = async(req,res) => {
    const {id_order:idOrder} = req.params;
    console.log(idOrder);
    const orderDetail = await Order.findById(idOrder);
    res.status(200).json({success:true,orderDetail});
};

module.exports.addOrder = async (req, res) => {
    let cart = await Cart.findOne({ userID: req.user.id });
    if (cart.totalPrice == 0) {
        return res.status(201).json({
            success: false,
            msg: "Giỏ hàng đang rỗng"
        })
    }
    
    function groupBy(objectArray, property) {
        return objectArray.reduce(function (acc, obj) {
            var key = obj[property];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(obj);
            return acc;
        }, {});
    }
    let arrOrderID=[]
    var groupOrder = Object.values(groupBy(cart.productList, 'sellerId'));
    if(groupOrder.length>1){
        for (let i = 0; i < groupOrder.length; i++) {
            let totalPrice = 0;
            var seller = "";
            groupOrder[i].forEach(async (element) => {
                totalPrice = totalPrice + (element.amount * element.productID.price);
                seller = element.sellerId;
                const product= await Product.findOne(element.productID._id);
                await Product.findOneAndUpdate(
                    {
                        _id:element.productID._id
                    },
                    {
                        quantitysold:product.quantitysold + element.amount
                    },
                    {
                        new:true
                    }
                )
            })
            let order = await Order.create({
                customer: ObjectId(req.user.id),
                totalPrice: totalPrice,
                seller: seller,
                productList: groupOrder[i],
                city:req.body.city,
                street:req.body.street,
                phone:req.body.phone,
                district:req.body.district,
                ward:req.body.ward,
                status: 0,
                statusRating:0,
                isUpdate:0,
            });
            
            //push list id vào mảng
            arrOrderID.push(order._id)
    
        }
    }else{
        for (let i = 0; i < groupOrder.length; i++) {
            let totalPrice = 0;
            var seller = "";
            groupOrder[i].forEach(async (element) => {
                totalPrice = totalPrice + (element.amount * element.productID.price);
                seller = element.sellerId;
                const product= await Product.findOne(element.productID._id);
                await Product.findOneAndUpdate(
                    {
                        _id:element.productID._id
                    },
                    {
                        quantitysold:product.quantitysold + element.amount
                    },
                    {
                        new:true
                    }
                )
            })
            let order = await Order.create({
                customer: ObjectId(req.user.id),
                totalPrice: cart.totalPrice,
                seller: seller,
                productList: groupOrder[i],
                city:req.body.city,
                street:req.body.street,
                phone:req.body.phone,
                district:req.body.district,
                ward:req.body.ward,
                status: 0,
                statusRating:0,
                isUpdate:0,
            });
            
            //push list id vào mảng
            arrOrderID.push(order._id)
    
        }
    }
    
//update cart null
    await Cart.findOneAndUpdate(
        { userID: req.user.id },
        { totalPrice: 0, productList: [] }
    );
    let stringArr=arrOrderID.toString()
    console.log(stringArr)
    return res.status(201).json({ success: true, data:stringArr });
};
module.exports.orders=async (req,res)=>{
    const orders=await Order.find({customer:req.user.id});
    res.status(200).json({success:true,orders});
};
module.exports.changeStatus=async(req,res)=>{
    console.log("1",req.body.status);
    let result=await Order.findByIdAndUpdate(req.params.idOrder,{
        status:req.body.status,
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
    const orders=await Order.find({customer:req.user.id});
    res.json({success:true,orders});
};
//#endregion
module.exports.AddDiscount = async (req,res) =>{
    const {amount,code,price,sellerID} = req.body;
    const createdAt =Date.now();
    let result;
    for(var i=0;i<amount;i++){
        const seller = await Discount.findOne({userID:sellerID});
        if(seller){
            result = await Discount.findOneAndUpdate(
                {userID:sellerID},
                {
                    $push:{
                        discount:{
                            code:code[i],
                            price:price,
                            status:0,
                            createdAt:createdAt,
                        }
                    }
                },
                {new:true}
            )
        }else{
            const dis=new Discount({
                userID:sellerID,
                discount:{
                    code:code[i],
                    price:price,
                    status:0,
                    createdAt:createdAt,
                }
            });
            await dis.save();
        }
        
    }
    if(result){
        return res.status(201).json({success:true});
    }
}
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

    if(seller){
        return res.status(201).json({success:true,comments:seller.comments});
    }else{
        return res.status(204).json({success:false,data:"Comment Failed"});
    }
}
module.exports.commentProduct= async (req,res) => {
    const {rating,content,productID,orderID} =req.body;
    let user =await User.findById(req.user.id);
    const createdAt= Date.now();
    await Order.findOneAndUpdate(
        {_id:ObjectId(orderID)},
        {
            statusRating:1
        },
        {new:true}
    )
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
module.exports.addToFollow =async (req,res) =>{
    let {sellerId} =req.body;
    let user = await User.findById(req.user.id);
    let seller = await User.findById(sellerId);
    const name = seller.name;
    const avatar =seller.avatar;
    let follows =user.follows;
    for(let item of follows){
        if(req.body.sellerId==item.sellerId){
            return res.json({
                success:false,
                msg:"Đã có trong danh sách theo dõi"
            });
        }
    }
    await User.findOneAndUpdate(
        {_id:ObjectId(req.user.id)},
        {$push:{follows:{ sellerId,name,avatar } } },
        {new:true}
    );
    res.status(201).json({success:true});
}
module.exports.addToFavorite =async (req,res) =>{
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
module.exports.addAndgetToViewed =async (req,res) =>{
    let shirt =await Product.findById(req.body.idShirt);
    let user = await User.findById(req.user.id);
    let viewed =user.viewed;
    let flag=0;
    if(viewed.length>0){
        for(let item of viewed){
            if(req.body.idShirt==item.shirt){
                flag=1;
                await User.findOneAndUpdate(
                    {_id:ObjectId(req.body.idUser)},
                    {$pull: {viewed:item }},
                    { multi: true }
                );
                await User.findOneAndUpdate(
                    {_id:ObjectId(req.body.idUser)},
                    {$push:{viewed:{ shirt } } },
                    {new:true}
                );
            } 
        }
    }else{
        flag=1;
        await User.findOneAndUpdate(
            {_id:ObjectId(req.body.idUser)},
            {$push:{viewed:{ shirt } } },
            {new:true}
        );
    }
    if(flag==0){
        await User.findOneAndUpdate(
            {_id:ObjectId(req.body.idUser)},
            {$push:{viewed:{ shirt } } },
            {new:true}
        );
    }
    let user2 =await User.findById(req.body.idUser).populate("viewed.shirt");
    res.status(201).json({success:true,viewed:user2.viewed});
}
module.exports.getFavorites=async function (req,res){
    let user =await User.findById(req.user.id).populate("favorites.shirt");
    res.json({success:true,favorites:user.favorites});
}
module.exports.getFollows=async function (req,res){
    let user =await User.findById(req.user.id).populate("favorites.shirt");
    res.json({success:true,follows:user.follows});
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
module.exports.deleteFollow= async function (req,res){
    let user= await User.findOneAndUpdate(
        {_id: ObjectId (req.user.id)},
        {
            $pull:{follows:{sellerId:req.body.sellerID}}
        },
        {new:true}
    ).populate("favorites.shirt");
    res.json({success:true,follows:user.follows});
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
module.exports.getRevenueByAdmin = async (req, res) => {
  const {seller_id}=req.body
  console.log("a",seller_id);

  const order = await Order.find({ seller: ObjectId(seller_id) });

  let arr = [
    { month: 1, total: 0, year: 2021 },
    { month: 2, total: 0, year: 2021 },
    { month: 3, total: 0, year: 2021 },
    { month: 4, total: 0, year: 2021 },
    { month: 5, total: 0, year: 2021 },
    { month: 6, total: 0, year: 2021 },
    { month: 7, total: 0, year: 2021 },
    { month: 8, total: 0, year: 2021 },
    { month: 9, total: 0, year: 2021 },
    { month: 10, total: 0, year: 2021 },
    { month: 11, total: 0, year: 2021 },
    { month: 12, total: 0, year: 2021 },
  ];
  for (const element of order) {
    if(element.status !=4){
        let date = new Date(element.createdAt);
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if (arr.length == 0) {
      let item = {
        month: month,
        total: element.totalPrice,
      };
      arr.push(item);
    } else {
      for (const e of arr) {
        if (month == e.month) {
          if (year == e.year) {
            e.year = year;
            e.total = e.total + element.totalPrice;
          } else {
            let item = {
              month: month,
              year: year,
              total: 0,
            };
            arr.push(item);
          }
        } else {
          let item = {
            month: month,
            year: year,
            total: element.totalPrice,
          };
        }
      }
    }
    }
  }
  res.json({ data: arr });
};
// Doanh thu
module.exports.getRevenueBySeller = async (req, res) => {
  let sellerID = req.user.id;
  const order = await Order.find({ seller: ObjectId(sellerID) });

  let arr = [
    { month: 1, total: 0, year: 2021 },
    { month: 2, total: 0, year: 2021 },
    { month: 3, total: 0, year: 2021 },
    { month: 4, total: 0, year: 2021 },
    { month: 5, total: 0, year: 2021 },
    { month: 6, total: 0, year: 2021 },
    { month: 7, total: 0, year: 2021 },
    { month: 8, total: 0, year: 2021 },
    { month: 9, total: 0, year: 2021 },
    { month: 10, total: 0, year: 2021 },
    { month: 11, total: 0, year: 2021 },
    { month: 12, total: 0, year: 2021 },
  ];
  for (const element of order) {
    if(element.status !=4){
        let date = new Date(element.createdAt);
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        if (arr.length == 0) {
        let item = {
            month: month,
            total: element.totalPrice,
        };
        arr.push(item);
        } else {
        for (const e of arr) {
            if (month == e.month) {
            if (year == e.year) {
                e.year = year;
                e.total = e.total + element.totalPrice;
            } else {
                let item = {
                month: month,
                year: year,
                total: 0,
                };
                arr.push(item);
            }
            } else {
            let item = {
                month: month,
                year: year,
                total: element.totalPrice,
            };
            }
        }
        }
    }
  }
  res.json({ data: arr });
};
module.exports.getBestSoldByQuarter = async (req,res) =>{
    let sellerID = req.user.id;
    const order = await Order.find({ seller: ObjectId(sellerID) });
    let arrOrder1=[];
    let arrOrder2=[];
    let arrOrder3=[];
    let arrOrder4=[];
    order.forEach((x)=>{
        let date = new Date(x.createdAt);
        let month = date.getMonth() + 1;
        let condition1 = month==1 || month==2 || month==3;
        let condition2 = month==4 || month==5 || month==6;
        let condition3 = month==7 || month==8 || month==9;
        let condition4 = month==10 || month==11 || month==12;
        if(x.status!=4 && condition1){
            arrOrder1.push(x);
        }
        if(x.status!=4 && condition2){
            arrOrder2.push(x);
        }
        if(x.status!=4 && condition3){
            arrOrder3.push(x);
        }
        if(x.status!=4 && condition4){
            arrOrder4.push(x);
        }
    })
    var productListQ1=[];
    var productListQ2=[];
    var productListQ3=[];
    var productListQ4=[];
    arrOrder1.forEach((x)=>{
        x.productList.forEach(y=>{
            productListQ1.push(y.productID);
        })
    })
    arrOrder2.forEach((x)=>{
        x.productList.forEach(y=>{
            productListQ2.push(y.productID);
        })
    })
    arrOrder3.forEach((x)=>{
        x.productList.forEach(y=>{
            productListQ3.push(y.productID);
        })
    })
    arrOrder4.forEach((x)=>{
        x.productList.forEach(y=>{
            productListQ4.push(y.productID);
        })
    })
    function compareById( a, b ) {
        if ( a._id < b._id ){
          return -1;
        }
        if ( a._id > b._id ){
          return 1;
        }
        return 0;
      }
    function compareByCount(a,b){
        if ( a.count < b.count ){
            return -1;
          }
          if ( a.count > b.count ){
            return 1;
          }
          return 0;
    }
    productListQ1.sort( compareById );
    productListQ2.sort( compareById );
    productListQ3.sort( compareById );
    productListQ4.sort( compareById );
    function count(array_elements) {
        var a=[];
        var current = "null";
        var cnt = 0;
        for (var i = 0; i < array_elements.length; i++) {
            if (array_elements[i]._id.toString() != current.toString()) {
                if (cnt > 0) {
                    a.push({"product": current,"count": cnt})
                }
                current = array_elements[i]._id;
                cnt = 1;
            } else {
                cnt++;
            }
        }
        if (cnt > 0) {
            a.push({"product": current,"count": cnt})
        }
        return a;
    }
    var arrQ1= count(productListQ1)
    var arrQ2= count(productListQ2)
    var arrQ3= count(productListQ3)
    var arrQ4= count(productListQ4)
    arrQ1.sort(compareByCount);
    arrQ2.sort(compareByCount);
    arrQ3.sort(compareByCount);
    arrQ4.sort(compareByCount);
    const getProduct= async (arr) =>{
        var flagCount=0;
        var newArr=[];
        var product;
        for(var i=arr.length-1;i>=0;i--){
            if(flagCount<5){
                product = await Product.findById({_id:arr[i].product})
                newArr.push({"product":product,"count":arr[i].count});
                flagCount++;
            }
        }
        return newArr;
    }
    const arrQuarter1=await getProduct(arrQ1);
    const arrQuarter2=await getProduct(arrQ2);
    const arrQuarter3=await getProduct(arrQ3);
    const arrQuarter4=await getProduct(arrQ4);
    res.json({ data1:arrQuarter1,data2:arrQuarter2,data3:arrQuarter3,data4:arrQuarter4});
}
module.exports.getListBestSold = async (req, res) => {
    const result=await Product.find().sort({"quantitysold": -1}).limit(8);
    res.json({ data: result });
}
module.exports.getDiscountPrice = async (req,res)=>{
    const discount = await Discount.find({userID: req.user.id})
    
    res.json({ data: discount });
}
module.exports.getSeller = async (req, res) => {
    const seller = await User.find({ groupid: 2 });
    return res.json({ success: true, data: seller });
};