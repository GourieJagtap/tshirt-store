const BigPromise=require('../middlewares/bigPromise');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.sendStripeKey=BigPromise(async(req,res,next)=>{
    res.status(200).json({
        apikey:process.env.STRIPE_API_KEY,
    })
});

exports.captureStripePayment=BigPromise(async(req,res,next)=>{
    const paymentIntent = await stripe.paymentIntents.create({
        amount:req.body.amount,
        currency:'inr',

       metadata:{integration_checks:'accept_a_payment'}
    })

    res.status(200).json({
        success:true,
        client_secret:paymentIntent.client_secret,
    })
});

exports.sendRazorPayKey=BigPromise(async(req,res,next)=>{
    res.status(200).json({
        apikey:process.env.RAZORPAY_API_KEY,
    })
});

exports.captureRazorPayKey=BigPromise(async(req,res,next)=>{
    var instance = new Razorpay({ 
        key_id: process.env.RAZORPAY_API_KEY, 
        key_secret: process.env.RAZORPAY_SECRET_KEY })
    

    var options={
        amount:req.body.amount,
        currency:'inr',
        receipt: "receipt#1",
    }
    const myOrder=instance.orders.create(options)

    res.status(200).json({
        success:true,
        amount:req.body.amount,
        order:myOrder,
    })
});