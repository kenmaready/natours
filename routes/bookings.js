const express = require('express');
const { getCheckout } = require('../controllers/bookings');
const { checkToken, restrictTo } = require('../utils/auth');

const router = express.Router();

// add middleware to require login for routes below:
router.use(checkToken);

router.get('/checkout/:tourId', checkToken, getCheckout);

module.exports = router;
