const express = require('express');
const rentingController = require('../controllers/rentingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/checkout-session/:propertyId',
  authController.protect,
  rentingController.getCheckoutSession
);
module.exports = router;
