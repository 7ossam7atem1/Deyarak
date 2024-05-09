const Review = require('../models/reviewModel');
const factory = require('../controllers/factoryHandler');

exports.getAllReviews = factory.getAll(Review);

exports.setReviewedUserAndReviewerId = (req, res, next) => {
  console.log('Middleware executed.');

//   // Check and set reviewedUser
  if (!req.body.reviewedUser) {
    req.body.reviewedUser = req.params.reviewedUserId;
    console.log('Reviewed user set to:', req.body.reviewedUser);
  }

  // Check and set reviewer
  if (!req.body.reviewer) {
    req.body.reviewer = req.user.id;
    console.log('Reviewer set to:', req.body.reviewer);
  }

  next();
};

// exports.setTourandUserIds = (req, res, next) => {
//   //Allow nested routes
//   if (!req.body.reviewedUser) req.body.reviewedUser = req.params.reviewedUserId;
//   if (!req.body.reviewer) req.body.reviewer = req.reviewer.id;
//   next();
// };
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
