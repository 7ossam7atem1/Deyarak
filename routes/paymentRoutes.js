const express = require('express');
const rentingController = require('../controllers/rentingController');
const authController = require('../controllers/authController');

const router = express.Router();

const logRequestDetails = (req, res, next) => {
  console.log('Incoming request URL:', req.originalUrl);
  console.log('Query Parameters:', req.query);
  next();
};

router.get(
  '/checkout-session/:propertyId',
  authController.protect,
  rentingController.getCheckoutSession
);

router.get(
  '/renting-checkout',
  logRequestDetails,
  rentingController.createRentingCheckout
);

router.post('/webhook', rentingController.handleStripeWebhook);

module.exports = router;
