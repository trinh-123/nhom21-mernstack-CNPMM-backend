const express = require("express");
const router = express.Router();
const authController=require("../controller/authController");
const upload = require("../multer");
const utils = require("../utils/utils");
const jwt = require("jsonwebtoken");
const { uploads } = require("../cloudinary");
let secret = process.env.JWT_SECRET
function verifyUser(req, res, next) {
    let accessToken = req.header("Authorization");
    if (accessToken && accessToken.startsWith("Bearer ")) {
        accessToken = accessToken.slice(7, accessToken.length);
    }
    jwt.verify(accessToken,secret,(err,decoded)=>{
        if(err){
            return res.status(401).send("Not Authenticated");
        }
        req.user=decoded.user;
        req.authenticated=true;
        return next();
    })
}
router.get("/user", authController.getUserById);
router.post("/forgot",authController.postForgetPass);
router.post("/changepassword",authController.postChangePassword);
router.post("/register",authController.postRegister);
router.post("/login-google",authController.callbackGoogle);
router.post("/login-facebook",authController.callbackFacebook);
router.post("/login",authController.postLogin);
router.post("/contact",authController.postContact);
router.use(verifyUser);
router.post("/add-to-cart",utils.requireRole(1), authController.addToCart);
router.post("/update-cart",utils.requireRole(1),authController.updateCart);
router.post("/remove-from-cart",utils.requireRole(1),authController.removeFromCart)
router.get("/cart",utils.requireRole(1), authController.getCart);
router.post("/updateuser",authController.postUpdateUser);
// router.post("/update-cart",authController.updateCart);
//order
router.get("/callback",utils.requireRole(1),authController.callback);
router.get("/orders/order-detail/:id_order",authController.OrderDetail);
router.post("/orders/add-order",utils.requireRole(1),authController.addOrder);
router.get("/orders",utils.requireRole(1),authController.orders);
router.put("/orders/:idOrder/status",authController.changeStatus);
router.post("/comment",authController.Comment);
router.post("/comment-product",authController.commentProduct);
router.post("/add-to-favorite",utils.requireRole(1),authController.addToFavorite);
router.post("/get-favorite",utils.requireRole(1),authController.getFavorites);
router.post("/delete-favorite",utils.requireRole(1),authController.deleteFavorite);
router.post(
    "/upload-avatar",
    upload.single("avatar"),
    authController.uploadAvatar
);
router.get(
    "/delete-avatar",
    authController.deleteAvatar
)
module.exports = router;