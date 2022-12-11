const express = require('express');
const router= express.Router();
const {isLoggedIn,customRole} = require('../middlewares/user')
const {createOrder,getOneOrder,getLoggedInOrders,adminAllOrders,adminUpdateOrder,adminDeleteOrder}= require('../controllers/orderController');

router.route('/order/create').post(isLoggedIn,createOrder);

router.route('/myorder').get(isLoggedIn,getLoggedInOrders);
router.route('/adminroute').get(isLoggedIn,customRole('admin'),adminAllOrders);
router.route('/admin/order/:id').put(isLoggedIn,customRole('admin'),adminUpdateOrder).delete(isLoggedIn,customRole('admin'),adminDeleteOrder);
router.route('/order/:id').get(isLoggedIn,getOneOrder);
module.exports=router;