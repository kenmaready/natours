const express = require('express');
const {
  getCheckout,
  createBookingCheckout,
  createBooking,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookings');
const { checkToken, restrictTo } = require('../utils/auth');

const router = express.Router();

// add middleware to require login for routes below:
router.use(checkToken);

router.post('/', createBooking);
router.get('/', getAllBookings);
router.get('/:id', getBooking);
router.patch('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.get('/checkout/:tourId', getCheckout);
router.get('/success', createBookingCheckout);

module.exports = router;
