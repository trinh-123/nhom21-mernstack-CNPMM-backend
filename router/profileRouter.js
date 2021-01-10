const express = require("express");
const { getProfile } = require("../controller/profileController");
const { verifyUser } = require("./verifyUser");
const router = express.Router();

router.use(verifyUser)
router.get("",getProfile)
module.exports = router