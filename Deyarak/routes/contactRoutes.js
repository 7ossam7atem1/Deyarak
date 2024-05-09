const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const contactController = require('../controllers/contactController');
const router = express.Router();
router.use(authController.protect);
router.post(
  '/contactus',
  contactController.contactUs
);
router.get('/getcontacts', contactController.getContacts);

module.exports = router;
