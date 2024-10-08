const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const propertyController = require('../controllers/propertyController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
router.use('/:reviewedUserId/reviews', reviewRouter);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updateMyPassword/:id', authController.updatePassword);
router.patch(
  '/updateMe',
  userController.uploadUserProfilePhoto,
  userController.resizeUserProfilePhoto,
  userController.updateMe
);

router.route('/deleteMe').delete(userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);
router.get(
  '/my-properties',
  userController.getMe,
  userController.getMyProperties
);

router.post(
  '/add-to-wishlist/:userId/:propertyId',
  userController.addToWishlist
);
router.post(
  '/remove-from-wishlist/:userId/:propertyId',
  userController.removeFromWishlist
);

router.get('/wishlist/:userId', userController.getWishlist);
router.get('/userProperties/:userId', propertyController.getUserProperties);
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
