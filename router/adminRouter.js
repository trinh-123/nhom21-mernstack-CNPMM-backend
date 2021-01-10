var express = require("express");
var router =express.Router();
const utils = require("../utils/utils");
const jwt = require("jsonwebtoken");
const adminController = require("../controller/adminController");
let secret = process.env.JWT_SECRET
function requireLogin(req, res, next) {
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
//admin route here

router.use(requireLogin);
router.get("/user-list",  adminController.getUser);
router.get("/orders",  adminController.getOrders);
router.get("/contact",adminController.getContacts);
router.post("/delete-contact",adminController.deleteContacts);
router.put(
    "/orders/:idOrder/status",
    
    adminController.changeStatus
);
router.post("/ban", adminController.banUser);
module.exports = router;
