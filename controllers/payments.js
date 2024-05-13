const Payments = require('../models/payments');
const Bills = require('../models/bills');
const Users = require('../models/user');

const getPayments = async (req, res)=> {
    const { _id, isAdmin } = req.user;
    
    let obj = {};
    if(!isAdmin) obj = { ...obj, userID: _id };
    
    try {
        const payments = await Payments.find(obj);
        return res.status(200).json({
            success: true,
            payments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            error
        })
    }
}

const handleNewPayment = async(req, res)=> {
    try {
        const { userID, billNo } = req.body;
        const user = await Users.findOne({ _id: userID });
        if (!user) return res.status(404).json({
            success: false,
            message: "User Not Found"
        });

        const bill = await Bills.findOne({ _id: billNo, userID });
        if (!bill) return res.status(404).json({
            success: false,
            message: "Bill doesn't Exists"
        });

        let method = 'Online';
        if(req.user && req.user.isAdmin)
            method = 'Offline'

        const { amount, units } = bill;
        let payment = await Payments.create({
            userID,
            billNo,
            amount,
            method
        })

        if(payment) await Bills.updateOne({ _id: billNo }, { $set: { status: 'Paid' } });
        payment = { ...payment._doc, customerName: user.customerName, units }

        return res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getLastPayment = async(req, res)=> {
    try {
        const { userID } = req.params;
        const user =  await Users.findById({ _id: userID });
        if (!user) return res.status(404).json({
            success: false,
            message: "User Not Found"
        });
    
        let data = await Payments.find({ userID }).sort({ createdAt: -1}).limit(1);
        const { _doc } = data[0];
        const bill = await Bills.findById({ _id: _doc.billNo });
        
        const payment = {  ..._doc, customerName: user.customerName, units: bill.units };
        return res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            error
        })
    }
}

const sendPdf = async (req, res) =>{
    
}

module.exports = {
    getPayments,
    handleNewPayment,
    getLastPayment,
    sendPdf
}