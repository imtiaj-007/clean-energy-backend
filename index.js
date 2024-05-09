const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const env = require('dotenv').config();

const billsRoutes = require("./routes/bills");
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payments');

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/cleanEnergy";

mongoose
    .connect(uri)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log(`Internal Server Error : ${error}`);
    })

const App = express();
const PORT = process.env.PORT || 5000;

App.use(cors());
App.use(express.json());
App.use(express.urlencoded({extended: false}));

App.use("/api/bills", billsRoutes);
App.use("/api/users", userRoutes);
App.use("/api/payments", paymentRoutes);

App.listen(PORT, ()=>{
    console.log(`Server started at port: ${PORT}`);
})