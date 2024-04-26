const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const sharp = require('sharp');
const User = require('../models/userModel');
const Contact = require('../models/contactModel');
const factory = require('../controllers/factoryHandler');
const AppError = require('../utils/appError');
const catchAsyncronization = require('../utils/catchAsyncronization');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Incorrect Format, Please choose an Image to be uploaded'),
      false
    );
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserProfilePhoto = upload.single('photo');

exports.resizeUserProfilePhoto = catchAsyncronization(
  async (req, res, next) => {
    if (!req.file) return next();

    const resizedPhotoBuffer = await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toBuffer();

    cloudinary.v2.uploader
      .upload_stream(
        {
          resource_type: 'image',
          folder: 'users',
          public_id: `user-${req.user.id}`,
          overwrite: true,
          invalidate: true,
        },

        async (error, result) => {
          if (error) {
            return next(
              new AppError(
                'Error Uploading the profile photo to cloudinary',
                500
              )
            );
          }
          if (!result || !result.secure_url || !result.public_id) {
            return next(new AppError('Cloudinary Uploading failed', 500));
          }

          req.file.cloudinaryUrl = result.secure_url;
          req.file.cloudinaryPublicId = result.public_id;

          console.log(
            `Image Uploaded Successfully, Image Id is : ${result.public_id}`
          );
          next();
        }
      )
      .end(resizedPhotoBuffer);
  }
);

const filterObject = (obj, ...allowedFieldsToUpdate) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFieldsToUpdate.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsyncronization(async (req, res, next) => {
  if (req.file && req.file.cloudinaryUrl && req.file.cloudinaryPublicId) {
    req.body.photo = {
      url: req.file.cloudinaryUrl,
      publicId: req.file.cloudinaryPublicId,
    };
  }

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updating, Please use /updateMyPassword',
        400
      )
    );
  }

  const filteredBody = filterObject(
    req.body,
    'name',
    'email',
    'phone',
    'photo'
  );
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

exports.deleteMe = catchAsyncronization(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.addToWishlist = catchAsyncronization(async (req, res, next) => {
  const userId = req.params.userId;
  const propertyId = req.params.propertyId;
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User with that id not found', 404));
  }
  if (!user.wishlist.includes(propertyId)) {
    user.wishlist.push(propertyId);
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Property Added to wishlist',
    });
  } else {
    res.status(200).json({
      statusbar: 'success',
      message: 'Property already exists on the wishlist',
    });
  }
});

exports.removeFromWishlist = catchAsyncronization(async (req, res, next) => {
  const userId = req.params.userId;
  const propertyId = req.params.propertyId;
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User with that id not found', 404));
  }
  const index = user.wishlist.indexOf(propertyId);
  if (index !== -1) {
    user.wishlist.splice(index, 1);
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Property removed from wishlist',
    });
  } else {
    res.status(200).json({
      status: 'success',
      message: 'Property has been already removed',
    });
  }
});

exports.getWishlist = catchAsyncronization(async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findById(userId).populate({
    path: 'wishlist',
    select:
      'price size numberOfRooms location images numberOfBathrooms address',
  });

  if (!user) {
    return next(new AppError('User with that id not found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    wishlist: user.wishlist,
  });
});

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User, { path: 'reviews' });
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'This Route is not defined! / Please use /signup instead.',
  });
};

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

