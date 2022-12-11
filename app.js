const express = require('express');
require("dotenv").config();
const app = express();
const morgan=require('morgan');
const cookieParser=require('cookie-parser');
const fileUpload= require('express-fileupload');

const swaggerUi = require("swagger-ui-express");
const yamljs=require('yamljs');
const swaggerDocuments=yamljs.load("./swagger.yaml");
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerDocuments));

app.set('view engine',"ejs")

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}));

const home = require("./routes/home");
const user =require("./routes/user");
const product =require("./routes/product");
const payment= require("./routes/payment");
const order = require("./routes/order");

app.use("/api/v1",home);
app.use("/api/v1",user);
app.use("/api/v1",product);
app.use("/api/v1",payment);
app.use("/api/v1",order);


app.get("/signuptest", (req, res) => {
    res.render("signuptest");
  });

module.exports=app;