const BigPromise=require('../middlewares/bigPromise');
const customErrors= require("../utils/cutomErrors");
const cloudinary=require("cloudinary");
const WhereClause=require("../utils/whereClause");
const Product=require("../models/product")

exports.addProduct=BigPromise(async(req,res,next)=>{

    const imageArray=[];

    if(!req.files){
        return next(new customErrors('Images are required',400))
    }

    if(req.files){
        for(index=0;index<req.files.photos.length;index++){
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                folder:"product"
            });

            imageArray.push({
                id:result.public_id,
                secure_url:result.secure_url,
            })
        }
    }
    req.body.photos=imageArray;
    req.body.user=req.user.id;

    const product= await Product.create(req.body);

    res.status(200).json({
        success:true,
        product
    })
});

exports.getAllProducts=BigPromise(async(req,res,next)=>{

    const resultPerPage = 6;
  const totalcountProduct = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductNumber = products.length;

  //products.limit().skip()

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalcountProduct,
  });
});

exports.getOneProducts=BigPromise(async(req,res,next)=>{
    const product= await Product.findById(req.params.id);

    if(!product){
        return next(new customErrors('Product does not exist',400));
    }

    res.status(200).json({
        success: true,
        product
    })
});

exports.addReview = BigPromise(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
  
    const product = await Product.findById(productId);
  
    const AlreadyReview = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
  
    if (AlreadyReview) {
      product.reviews.forEach((review) => {
        if (review.user.toString() === req.user._id.toString()) {
          review.comment = comment;
          review.rating = rating;
        }
      });
    } else {
      product.reviews.push(review);
      product.numberOfReviews = product.reviews.length;
    }
  
    // adjust ratings
  
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
  
    //save
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
  });

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  const numberOfReviews = reviews.length;

  // adjust ratings

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //update the product

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getOneReviewForOneProduct=BigPromise(async(req,res,next)=>{
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews:product.reviews,
  })
})

exports.admingetAllProducts=BigPromise(async(req,res,next)=>{
    const products= await Product.find();

    res.status(200).json({
        success:true,
        products
    })
});

exports.adminUpdateproduct=BigPromise(async(req,res,next)=>{
    let product = Product.findById(req.params.id);
    
    const imageArray=[];

    if(!product){
        return next(new customErrors('Product does not exist',400));
    }

    if(req.files){

        for(let index=0;index<req.files.photos.length;index++){
            const res= await cloudinary.uploader.destroy(product.photos[index].id)
        }

        for(let index=0;index<req.files.photos.length;index++){
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                folder:"product"
            });

            imageArray.push({
                id:result.public_id,
                secure_url:result.secure_url,
            })
        }
    }

    req.body.photos=imageArray;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

    res.status(200).json({
        success:true,
        product
    })
});

exports.adminDeleteproduct=BigPromise(async(req,res,next)=>{
    const product =await Product.findById(req.params.id);
    
    if(!product){
        return next(new customErrors('Product does not exist',400));
    }
    
    for(let index=0;index< product.photos.length;index++){
        const res= await cloudinary.v2.uploader.destroy(product.photos[index].id)
    }

    await product.remove()

    res.status(200).json({
        success:true,
        message:'product deleted !'
    })
})