const catchAsyncronization = require('../utils/catchAsyncronization');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiMaestro');
const User = require('../models/userModel');

exports.deleteOne = (Model) =>
  catchAsyncronization(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('document with that id not found', 404));
    }
    res.status(204).json({
      status: 'success',
      message: 'deleted Successfully',
    });
  });

exports.updateOne = (Model) =>
  catchAsyncronization(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new AppError('document with that id is not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { data: document },
    });
  });

exports.createOne = (Model) =>
  catchAsyncronization(async (req, res, next) => {
    req.body.owner = req.user.id;
    const newDocument = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Created successfully',
      data: {
        data: newDocument,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsyncronization(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const document = await query;

    if (!document) {
      return next(new AppError('document with that id not found', 404));
    }

    document.isOwner =
      req.user && req.user.id === document.owner?._id.toString();
    console.log(req.user.id);
    console.log(document);
    res.status(200).json({
      status: 'success',
      data: { data: document },
    });
  });

exports.getAll = (Model) =>
  catchAsyncronization(async (req, res, next) => {
    let filter = {};
    if (req.params.reviewedUserId)
      filter = { reviewedUser: req.params.reviewedUserId };
    console.log(req.query);

    const features = new APIFeatures(Model.find(filter), req.query)
      .filtering()
      .sorting()
      .limitingFields()
      .pagination()
      .searching();
    const allDocuments = await features.query;

    const reviewedUserId = req.params.reviewedUserId;
    let totalAvgRating;

    if (reviewedUserId) {
      const reviewedUser = await User.findById(reviewedUserId).select(
        'ratingsAverage'
      );
      if (reviewedUser) {
        totalAvgRating = reviewedUser.ratingsAverage;
      }
    }

    allDocuments.forEach((document) => {
      if (document.reviewer) {
        document.isReviewer =
          req.user && req.user.id === document.reviewer._id.toString();
      } else {
        document.isReviewer = false;
      }
    });

    res.status(200).json({
      status: 'success',
      result: allDocuments.length,
      totalAvgRating,
      data: {
        data: allDocuments,
      },
    });
  });
