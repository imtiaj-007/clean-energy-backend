const { Router } = require('express');
const { fetchUser, getUser } = require('../middlewares/auth');
const {
    getPayments,
    handleNewPayment,
    getLastPayment,
    sendPdf
} = require('../controllers/payments')

const router = Router();

router.route('/')
    .get(fetchUser, getPayments)
    .post(getUser, handleNewPayment)

router.get('/getPDF/:_id', sendPdf);
router.get('/:userID', getLastPayment);

module.exports = router;