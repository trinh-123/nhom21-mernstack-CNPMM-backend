var express = require("express");
var router = express.Router();
var categoriesController = require("../controller/categoriesController");

router.get("/:id_parent", categoriesController.getCategoriesByParentId);
router.get("/category", categoriesController.getCategories);
router.get("/parentcategory",categoriesController.getParentCategories);

module.exports = router;
