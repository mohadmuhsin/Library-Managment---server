const express = require('express');
const app = express()
const mongoose = require("mongoose")
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const commonRoute = require('./Routes/common.routes');
const adminRoute = require('./Routes/admin.routes')
const userRoute = require('./Routes/user.routes')

mongoose.connect(process.env.MONGO)
    .then(() => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

app.use(cookieParser());
app.use(express.json())
app.use(
    cors({
        origin: process.env.ORIGIN,
        methods: ["GET", "POST", "PATCH"],
        credentials:true
    })
)

app.use('',commonRoute);
app.use('/admin',adminRoute);
app.use('/user',userRoute);

app.listen(process.env.PORT, () => {
    console.log(`App is listning to port:${process.env.PORT}`);
})


module.exports = app;