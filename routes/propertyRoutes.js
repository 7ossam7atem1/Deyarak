const express = require('express');
const propertyController = require('../controllers/propertyController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/property-stats').get(propertyController.calculateCriticalStats);

router
  .route('/related-suggestions/:id')
  .get(propertyController.getRelatedSuggestions);

router
  .route('/properties-within/:distance/:center/:latlng/unit/:unit')
  .get(propertyController.getPropertiesWithin);

router
  .route('/all-locations')
  .get(authController.protect, propertyController.getPropertiesLocations);
router
  .route('/distances/:latlng/unit/:unit')
  .get(propertyController.getDistances);

router
  .route('/view-on-map/:id')
  .get(authController.protect, propertyController.viewOnMap);
router
  .route('/top-5-cheap')
  .get(
    propertyController.aliastingTopProperties,
    propertyController.getAllProperties
  );
router
  .route('/')
  .get(propertyController.getAllProperties)
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    propertyController.uploadPropertiesImages,
    propertyController.resizePropertyImages,
    propertyController.createProperty
  );
router
  .route('/:userId')
  .get(authController.protect, propertyController.getUserProperties);
router
  .route('/:id')
  .get(authController.protect, propertyController.getProperty)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    propertyController.uploadPropertiesImages,
    propertyController.resizePropertyImages,
    propertyController.updateProperty
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    propertyController.deleteProperty
  );
module.exports = router;
