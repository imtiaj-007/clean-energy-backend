const Bills = require('../models/bills');
const Users = require('../models/user');

// const data = require('../BILLS_DATA.json');

// const getAllBills = async (req, res) => {
//     try {
//         const data = await Bills.find({});
//         return res.status(200).json(data);
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             error
//         })
//     }
// }

const getBills = async (req, res) => {
    try {
        const { _id, isAdmin } = req.user;
        const user = await Users.findById(_id);

        if (!user) return res.status(404).json({
            success: false,
            message: "User Not Found"
        });

        let queryObj = {};
        const { searchID, startDate, endDate, minValue, maxValue, minUnit, maxUnit, paymentStatus, connecType, sort } = req.query;

        if (searchID) {
            let user;
            if (searchID.includes('@'))
                user = await Users.findOne({ email: searchID });
            else
                user = await Users.findOne({ _id: searchID });
            queryObj = { ...queryObj, userID: user._id };
        }

        if (!isAdmin) queryObj = { ...queryObj, userID: _id };
        if (paymentStatus) queryObj = { ...queryObj, status: paymentStatus };
        if (startDate || endDate) queryObj = { ...queryObj, date: { $gte: startDate ? startDate : '2024-01-01', $lte: endDate ? endDate : new Date().toISOString().slice(0, 10) } };
        if (minValue || maxValue) queryObj = { ...queryObj, amount: { $gte: minValue ? minValue : 0, $lte: maxValue ? maxValue : 4000 } };
        if (minUnit || maxUnit) queryObj = { ...queryObj, units: { $gte: minUnit ? minUnit : 0, $lte: maxUnit ? maxUnit : 500 } };

        if (connecType) {
            let str = connecType.toLowerCase();
            let users = await Users.find({ connectionType: str });
            let userIds = users.map(ele => { return ele._id })
            queryObj = { ...queryObj, userID: { $in: userIds } };
        }

        let queryData = Bills.find(queryObj);
        if (sort) {
            let sortFix = sort.replaceAll(",", " ");
            queryData = queryData.sort(sortFix);
        }

        const bills = await queryData;
        return res.status(200).json({
            success: true,
            bills
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getUserBillsById = async (req, res) => {
    try {
        const searchID = req.params.id;

        let user;
        if (searchID) {
            if (searchID.includes('@'))
                user = await Users.findOne({ email: searchID });
            else
                user = await Users.findOne({ _id: searchID });
        }
        if (!user) return res.status(404).json("User Not Found");
    
        const bills = await Bills.find({ userID: user._id }).sort({ date: -1 });
        return res.status(200).json({
            success: true,
            bills,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const createBill = async (req, res) => {
    // await Bills.deleteMany({});
    // await Bills.insertMany(data);
    // return res.status(200).json({
    //     success: true,
    //     message: "Bills created Successfully",
    // });

    try {
        const { _id, units } = req.body;
        const user = await Users.findById({ _id });
        if (!user)
            return res.status(404).json({
                success: false,
                message: "User doesn't exists"
            });

        let date = new Date();
        const currentMonth = date.getMonth() + 1; // Month is zero-based
        const currentYear = date.getFullYear();

        // Calculate the start and end dates for the current month
        const startOfMonth = new Date(`${currentYear}-${currentMonth}-01`);
        const endOfMonth = new Date(`${currentYear}-${currentMonth + 1}-01`);
        
        console.log(startOfMonth, endOfMonth);
        const bill = await Bills.findOne({
            userID: _id,
            createdAt: {
                $gte: startOfMonth, // First day of the current month
                $lte: endOfMonth // Last day of the current month
            }
        });
        console.log(bill)
        if (bill)
            return res.status(400).json({
                success: false,
                message: `Bill already exists for the month of ${date.toLocaleString('default', { month: 'long' })}`
            });

        date = new Date().toISOString().slice(0, 10);
        let amount = 0, type = user.connectionType;
        switch (type) {
            case "domestic":
                amount = parseInt(units) * 8;
                break;
            case "workshop":
                amount = parseInt(units) * 11;
                break;
            case "industrial":
                amount = parseInt(units) * 14;
                break;
        }

        const newBill = await Bills.create({ userID: _id, date, units, amount });
        return res.status(200).json({
            success: true,
            message: "Bill created Successfully",
            newBill
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            error
        });
    }
}

const updateBill = async (req, res) => {
    try {
        const { _id, units, billNo } = req.body;
        const user = await Users.findById({ _id });
        if (!user)
            return res.status(404).json({
                success: false,
                message: "User doesn't exists"
            });
        let amount = 0, type = user.connectionType;

        switch (type) {
            case "domestic":
                amount = parseInt(units) * 8;
                break;
            case "workshop":
                amount = parseInt(units) * 11;
                break;
            case "industrial":
                amount = parseInt(units) * 14;
                break;
        }

        await Bills.updateOne({ _id: billNo, userID: _id }, { $set: { units: units, amount: amount } });
        const newBill = await Bills.findOne({ _id: billNo });
        return res.status(200).json({
            success: true,
            message: "Bill updated Successfully",
            newBill
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            error
        });
    }
}

const deleteBill = async (req, res) => {
    // console.log(req.body)
    // await Bills.deleteMany({ userID: req.body.userID });
    // return res.json({ success: true });

    try {
        const { _id, billNo } = req.body;
        const user = await Users.findById({ _id });
        if (!user)
            return res.status(404).json({
                success: false,
                message: "User doesn't exists"
            });

        const newBill = await Bills.findOne({ _id: billNo, userID: _id });
        if (!newBill)
            return res.status(404).json({
                success: false,
                message: "Bill doesn't exists"
            });

        await Bills.deleteOne({ _id: billNo });

        return res.status(200).json({
            success: true,
            message: "Bill deleted Successfully",
            newBill
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            error
        });
    }
}

const generatePdf = async (req, res)=> {
    console.log('generate pdf');
}


module.exports = {
    // getAllBills,
    getBills,
    getUserBillsById,
    generatePdf,
    createBill,
    updateBill,
    deleteBill
}