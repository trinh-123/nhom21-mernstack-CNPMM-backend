var express = require("express");
var router = express.Router();
const {verifyUser}=require("./verifyUser");
const upload = require("../multer");
const utils = require("../utils/utils");
const sellerController=require("../controller/sellerController")


var cpUpload=upload.fields([
    {name:"images",maxCount:5},
    {
        name:"previewImgs",maxCount:20
    },
]);
router.get("/best-seller/:id_Seller",sellerController.productBestSeller)
router.use(verifyUser);
router.post(
    "/upload",
    utils.requireRole(2),
    cpUpload,
    sellerController.postUpload
);
router.get("/order-by-seller",utils.requireRole(2),sellerController.findOrderBySeller);
router.put(
    "/orders/:idOrder/status",
    sellerController.changeStatus
);
module.exports= router;

