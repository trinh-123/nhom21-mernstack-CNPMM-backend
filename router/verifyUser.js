const jwt = require("jsonwebtoken");
let secret = process.env.JWT_SECRET

exports.verifyUser = (req, res, next)=>{
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