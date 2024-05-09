const { Router } = require('express');
const { fetchUser, getUser } = require('../middlewares/auth');
const {
    getPayments,
    handleNewPayment,
    getLastPayment
} = require('../controllers/payments')

const router = Router();

router.route('/')
    .get(fetchUser, getPayments)
    .post(getUser, handleNewPayment)

router.get('/:userID', getLastPayment);

module.exports = router;