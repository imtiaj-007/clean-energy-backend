const express = require('express');
const { fetchUser } = require('../middlewares/auth');
const {
    getAllBills,
    getBills,
    getUserBillsById,
    createBill,
    updateBill,
    deleteBill,
    sendPDF,
} = require('../controllers/bills');

const router = express.Router();

// router.get('/getAllbills', getAllBills);
router.get('/getbills', fetchUser, getBills);
router.get('/getbills/:id', getUserBillsById);

router.route('/createBill')
    .post(fetchUser, createBill)
    .patch(fetchUser, updateBill)
    .delete(fetchUser, deleteBill);

    router.get('/createBill/:_id', sendPDF);

module.exports = router;