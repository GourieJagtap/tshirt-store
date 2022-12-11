const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,"Please enter the product name!"],
        maxlength:[120,'The name should contain max 120 charachters'],
        trim: true,
    },
    price:{
        type:Number,
        required: [true,"Please enter the product price"],
        maxlength:[6,"Product price should be less than 7 digits"],
    },
    stock:{
        type:Number,
        required: [true,"Please enter the the number of stock"]
    },
    description:{
        type:String,
        required:[true,"Please enter the product description"],
    },
    photos:[
        {
            id:{
                type:String,
                required:true,
            },
            secure_url:{
                type:String,
                required:true,
            }
        }
    ],
    category:{
        type:String,
        required:[true,"Please enter the category from- short-sleeves,long-sleeves,sweatshirts,hoodies"],
        enum:{
            values:["shortsleeves","longsleeves","sweatshirts","hoodies"],
            message:"Please enter the category ONLY from- short-sleeves,long-sleeves,sweatshirts,hoodies"
        }
    },
    brand:{
        type: String,
        required:true,
    },
    ratings:{
        type:Number,
        default:0,
    },
    numberOfReviews:{
        type: Number,
        default:0,
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:'User',
                required:true,
            },
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true,
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
});

module.exports=mongoose.model('Product',productSchema);