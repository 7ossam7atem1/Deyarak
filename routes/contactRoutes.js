const express = require('express');
const authController = require('../controllers/authController');
const contactController = require('../controllers/contactController');
const router = express.Router();
router.use(authController.protect);
router.post(
  '/contactus',
  authController.restrictTo('user'),
  contactController.contactUs
);
router.get('/getcontacts', contactController.getContacts);

module.exports = router;
