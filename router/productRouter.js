
const express=require("express");
const productController=require("../controller/productController")
const router=express.Router();
router.post("/search",productController.searchProducts);
router.get("/",productController.getProducts);
router.get ("/getByPrice",productController.getByPrice);
router.get("/all",productController.getAllProduct);
router.get("/new",productController.getNewProduct);
router.get("/:id_product",productController.getProduct);
router.get("/getproduct/:seller",productController.getProductBySeller);
router.post("/delete-product",productController.deleteProduct);
router.post("/update-product",productController.updateProduct);

module.exports = router;