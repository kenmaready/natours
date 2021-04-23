const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccountPage,
  updateMe,
} = require('../controllers/views');
const { login, logout } = require('../controllers/auth');
const { checkToken, isLoggedIn } = require('../utils/auth');

const router = express.Router();

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.post('/login', isLoggedIn, login);
router.get('/logout', isLoggedIn, logout);
router.get('/me', checkToken, getAccountPage);
router.post('/update/me', checkToken, updateMe);

module.exports = router;
