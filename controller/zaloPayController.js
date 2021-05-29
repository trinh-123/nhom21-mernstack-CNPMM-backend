const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment
const axios = require('axios').default; // npm install axios
const qs = require('qs');
const Cart=require("../models/cart")
const config = {
    appid: "8888",
    key1: "Edk3lhaw7W79Rhj80pgvNV8xSF9ANLXn",
    key2: "LdprWagvRv5l2iXauSYXEyS6LZMbFEp2",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
  };

module.exports.getData= async(req,res)=>{
  console.log(req.body)
  return res.json({
    "returncode": 1,
    "returnmessage": "[returnmessage]"
  })
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
    let cart= await Cart.findOne({userID:req.body.userId});
    const _amount= cart.totalPrice;
    const transID = Math.floor(Math.random() * 1000000);
    const embed_data = {};
    let order={
                app_id: config.appid,
                app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
                app_user: "user123",
                app_time: Date.now(), // miliseconds
                item: JSON.stringify(items),
                embed_data: JSON.stringify(embed_data),
                amount: _amount*1000,
                description: `Lazada - Payment for the order #${transID}`,
                bank_code: "zalopayapp",
            }
            const data = config.appid + "|" + order.app_trans_id + "|" + order.app_user + "|" + 
            order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
            order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
            let result={};
            try {
            let postConfig = {
                method: 'post',
                url: config.endpoint,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: qs.stringify(order)
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
