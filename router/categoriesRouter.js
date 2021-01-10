var express = require("express");
var router = express.Router();
var categoriesController = require("../controller/categoriesController");

router.get("/", categoriesController.getCategories);

module.exports = router;
