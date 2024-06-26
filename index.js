require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const billsRoutes = require("./routes/bills");
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payments');

const url = process.env.MONGO_URL;

mongoose
    .connect(url)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log(`Internal Server Error : ${error}`);
    })

const app = express();
const PORT = process.env.PORT;

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api/bills", billsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

app.listen(PORT, ()=>{
    console.log(`Server started at port: ${PORT}`);
})