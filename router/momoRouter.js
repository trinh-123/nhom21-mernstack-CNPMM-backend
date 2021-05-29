const momoController=require("../controller/momoController");
const express = require("express");
const router = express.Router();

router.post("/create-order",momoController.createOrder);
router.post("/getorder",momoController.getData);
module.exports=router;