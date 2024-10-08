const Review = require('../models/reviewModel');
const factory = require('../controllers/factoryHandler');
const catchAsyncronization = require('../utils/catchAsyncronization');
const mongoose = require('mongoose');

exports.getAllReviews = factory.getAll(Review);

exports.setReviewedUserAndReviewerId = (req, res, next) => {
  console.log('Middleware executed.');

  // Check and set reviewedUser
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

exports.getReviewsStatistics = catchAsyncronization(async (req, res, next) => {
  const reviewedUserId = req.params.reviewedUserId;

  const stats = await Review.aggregate([
    {
      $match: { reviewedUser: new mongoose.Types.ObjectId(reviewedUserId) },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const ratingStats = Array(5).fill(0);

  stats.forEach((stat) => {
    ratingStats[stat._id - 1] = stat.count;
  });

  res.status(200).json({
    status: 'success',
    data: ratingStats,
  });
});

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
