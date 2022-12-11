const express = require('express');
const router = express.Router();
const {sendStripeKey,sendRazorPayKey,captureStripePayment,captureRazorPayKey}= require('../controllers/paymentController');
const {isLoggedIn}= require('../middlewares/user');

router.route('/stripekey').get(isLoggedIn,sendStripeKey);
router.route('/razorpaykey').get(isLoggedIn,sendRazorPayKey);

router.route('/captureStripePayment').get(isLoggedIn,captureStripePayment);
router.route('/captureRazorPayKey').get(isLoggedIn,captureRazorPayKey);


module.exports=router;