const express = require('express');
const router = express.Router();
const {isLoggedIn,customRole} = require('../middlewares/user');
const {addProduct,getAllProducts,admingetAllProducts,getOneProducts,adminUpdateproduct,adminDeleteproduct,addReview,deleteReview,getOneReviewForOneProduct}=require('../controllers/productController')

router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getOneProducts);
router.route("/adddeletereview").put(isLoggedIn,addReview).delete(isLoggedIn,deleteReview);
router.route("/reviews").get(isLoggedIn,getOneReviewForOneProduct);


router.route("/admin/products/add").post(isLoggedIn,customRole('admin'),addProduct);
router.route("/admin/products").get(isLoggedIn,customRole('admin'),admingetAllProducts);
router.route("/admin/products/:id")
.put(isLoggedIn,customRole('admin'),adminUpdateproduct)
.delete(isLoggedIn,customRole('admin'),adminDeleteproduct);


module.exports=router;
