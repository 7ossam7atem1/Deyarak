const mongoose = require('mongoose');
const User = require('../models/userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    reviewer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer must be specified'],
    },
    reviewedUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Reviewed user must be specified'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ reviewer: 1, reviewedUser: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'reviewer',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (reviewedUserId) {
  const stats = await this.aggregate([
    {
      $match: { reviewedUser: reviewedUserId },
    },
    {
      $group: {
        _id: '$reviewedUser',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  //if you removed this if you will get an errror because array stats is empty
  if (stats.length > 0) {
    await User.findByIdAndUpdate(reviewedUserId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await User.findByIdAndUpdate(reviewedUserId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.reviewedUser);
});

//HUGEEEEEEEEEE HACKKKKKKKKKKKKKKK
reviewSchema.pre(/^findOneAnd/, async function (next) {
  if (!this.r) {
    this.r = await this.findOne();
  }
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r && this.r.constructor === Review) {
    await Review.calcAverageRatings(this.r.reviewedUser);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
