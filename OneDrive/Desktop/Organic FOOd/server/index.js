const express = require("express")    // importing express from node modules
const bodyParser = require("body-parser")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require('dotenv').config()

const  connectDb  = require("./config/connectDb")
const userRoutes = require ("./routes/userRoutes")
const postRoutes = require ("./routes/postRoutes")
const productRoutes = require ("./routes/productRoutes")
const orderRoutes = require ("./routes/orderRoutes")
const addressRoutes = require ("./routes/addressRoutes")
const cartRoutes = require ("./routes/cartRoutes")
const contactRoutes = require("./controllers/contact");

const app = express()   // creating an express app
const port = process.env.PORT

connectDb()
// middlewares
// app.use(express.json())    // body ka format json hai    // use kerpatey hai req.body
// alternative 
// body parser
// app.use(bodyParser.urlencoded({extended :true}))

app.use(bodyParser.json())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL || "http://localhost:3000"
}));     // cors policy unblocked
app.use(cookieParser())



//test Route For testing if the server is working 
app.get("/" , (req,res)=>{res.status(201).send("Api Server Working ......." )})
// user Routes
app.use("/user" , userRoutes)   // single middleware with multiple Routes inside
//post aka blog Routes
app.use("/post" , postRoutes)     // single middleware with multiple Routes inside

//product Routes

app.use("/product",  productRoutes)

//Order Routes
app.use("/order",  orderRoutes)

//Address Routes
app.use("/address",  addressRoutes)

//Cart Routes
app.use("/cart",  cartRoutes)

//contact
app.use("/contact", contactRoutes);

app.listen(port , ()=>{console.log(`Server listening on port ${port}!`)} )