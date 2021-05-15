var express = require("express");
var router = express.Router();
var categoriesController = require("../controller/categoriesController");


router.get("/category", categoriesController.getCategories);
router.get("/parentcategory",categoriesController.getParentCategories);
router.get("/:id_parent", categoriesController.getCategoriesByParentId);



module.exports = router;
