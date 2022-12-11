const Product = require("../models/product");
const Order = require("../models/order");
const BigPromise=require("../middlewares/bigPromise");
const customRole = require("../utils/cutomErrors")

exports.createOrder=BigPromise(async(req,res,next)=>{
    const {shippingInfo,orderItems,paymentInfo,taxAmount,shippingAmount,totalAmount,}= req.body;

    const order= await Order.create({
        shippingInfo,orderItems,paymentInfo,taxAmount,shippingAmount,totalAmount,user:req.user._id
    });

    res.status(200).json({
        success: true,
        order,
    })
});

exports.getOneOrder=BigPromise(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate('user','name email');

    if(!order){
        return next(new customErrors('order not found',400));
    }

    res.status(200).json({
        success: true,
        order,
    })
});

exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
    const order = await Order.find({ user: req.user._id });
  
    if (!order) {
      return next(new CustomError("please check order id", 401));
    }
  
    res.status(200).json({
      success: true,
      order,
    });
  });

exports.adminAllOrders=BigPromise(async(req,res,next)=>{
    const order= await Order.find();

    res.status(200).json({
        success: true,
        order,
    })
});

exports.adminUpdateOrder=BigPromise(async(req,res,next)=>{
    const order= await Order.findbyId(req.params.id);

    if(order.orderStatus==='Delivered'){
        return next(new customErrors('Order already delivered ',401));
    }
    
    order.orderItems.forEach(async(prod)=>{
        await UpdateProductStock(prod.product,prod.quantity)
    })

    order.orderStatus=req.body.orderStatus;

    await order.save();

    res.status(200).json({success:true,})
});

exports.adminDeleteOrder=BigPromise(async(req,res,next)=>{
    const order= await Order.findbyId(req.params.id);

    
    await order.remove();

    res.status(200).json({success:true,})
});

async function UpdateProductStock(productId,quantity) {
    const product= await Product.findById(productId);

    product.stock=product.stock-quantity;

    await product.save({ validateBeforeSave: false});

}