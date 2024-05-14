const { Router } = require('express');
const {
    handleGetAllUsers,
    handleGetUser,
    handleCreateUser
} = require('../controllers/user');
const { fetchUser } = require('../middlewares/auth');

const router = Router();

router.get('/', fetchUser, handleGetAllUsers);
router.post('/login', handleGetUser);
router.post('/signup', handleCreateUser);

module.exports = router;