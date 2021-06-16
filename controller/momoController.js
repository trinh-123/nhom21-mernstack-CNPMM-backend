const crypto = require('crypto'); // npm install crypto-js
const moment = require('moment'); // npm install moment
const Order=require("../models/order");
const axios = require('axios').default; // npm install axios
const qs = require('qs');
const Cart=require("../models/cart")
const { v4: uuidv4 } = require("uuid")
const config = {
    parnerCode: "MOMOHLYQ20200323",  
    secretKey: "mfSHVrCOyNEoLommh9WK3WdZIHG4OwLL",
    endpoint: "https://test-payment.momo.vn/gw_payment/transactionProcessor",
    notifyUrl: "https://0cd56ecf8598.ngrok.io/momo/getorder",
    accessKey: "QghXGjTEoLJ4Hx8P"
  };

module.exports.getData= async(req,res)=>{
  console.log(req.body)
  if(req.body.errorCode!=0)
  arrOrderid=req.body.orderId.split(",")
  arrOrderid.forEach(async (element) =>{
    console.log("====",element)
    await Order.findOneAndUpdate(
      {
          _id:element
      },
      {
          status:3
      },
    )
  })
  
  
  {
    console.log("ko thanh coong")
    arrOrderid=req.body.orderId.split(",")
    console.log(arrOrderid)
    return res.status(200).json({success:false, msg:"Not success"})
  }
  arrOrderid=req.body.orderId.split(",")
  console.log("====",arrOrderid)
  let data = {
    "partnerCode": config.parnerCode,
    "requestId": uuidv4(),
    "orderId": req.body.orderId,
    "resultCode": 200,
    "message": "Thanh cong",
    responseTime: req.body.responseTime,
    extraData: req.body.extraData
  }
  let strSignature = `accessKey=$${config.accessKey}&extraData=${data.extraData}
  &message=${data.message}&orderId=${data.orderId}&partnerCode=${data.partnerCode}
  &requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=
  ${data.resultCode}`
  data.signature= crypto.createHmac("sha256",config.secretKey).update(strSignature).digest("hex");
  console.log(data)
  return res.status(200).json({success:true,data:data})
}

const embeddata = {
      merchantinfo: "embeddata123"
    };
const items = [{
    itemid: "knb",
    itemname: "kim nguyen bao",
    itemprice: 198400,
    itemquantity: 1
  }];
module.exports.createOrder=async(req,res)=>{
    // let cart= await Cart.findOne({userID:req.body.userId});
    const _amount= req.body.totalPrice;
    const orderID=req.body.listOrderId
    const embed_data = `userId=${req.body.userId}`;
    let order={
                partnerCode: config.parnerCode,
                requestId: uuidv4(),
                accessKey:config.accessKey,
                orderId: orderID, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
                returnUrl: "http://localhost:3000/", // miliseconds
                extraData: embed_data,
                notifyUrl: config.notifyUrl,
                amount: (_amount*1000).toString(),
                orderInfo: `TN - Payment for the orders #${req.body.listOrderID}`,
                requestType: "captureMoMoWallet",
                lang: "en",

            }
            const data = `partnerCode=${order.partnerCode}&accessKey=${order.accessKey}&requestId=${order.requestId}&amount=${order.amount}&orderId=${order.orderId}&orderInfo=${order.orderInfo}&returnUrl=${order.returnUrl}&notifyUrl=${order.notifyUrl}&extraData=${order.extraData}`;
            
            order.signature = crypto.createHmac("sha256",config.secretKey).update(data).digest("hex");
            let result={};
            try {
            let postConfig = {
                method: 'post',
                url: config.endpoint,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                data: order
            };
            
            axios(postConfig)
                .then(function (response) {
                    res.json({order:order,data:response.data})
                })
                .catch(function (error) {
                });
            } catch (error) {
            res.json(error)
            }

}
