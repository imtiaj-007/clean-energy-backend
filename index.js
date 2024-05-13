const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api/bills", billsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

app.listen(PORT, ()=>{
    console.log(`Server started at port: ${PORT}`);
})