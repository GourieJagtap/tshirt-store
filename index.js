const app = require("./app");
const connectwithDB =require('./config/db')
require("dotenv").config();
const cloudinary= require('cloudinary');

connectwithDB();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

app.listen(process.env.PORT,()=>{console.log(`app is running at port ${process.env.PORT}`)});