const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsyncronization = require('../utils/catchAsyncronization');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const signedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signedToken(user._id);
  const expiresInMilliSeconds =
    process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000;
  const expiresDate = new Date(Date.now() + expiresInMilliSeconds);
  const cookieOptions = {
    expires: expiresDate,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user: user },
  });
};

exports.signup = catchAsyncronization(async (req, res, next) => {
  const defaultImageUrl =
    'https://res.cloudinary.com/dptpklbgm/image/upload/v1714231241/defaultuserimage/xwxxpjhlgmhcayhuoadk.jpg';
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    active: req.body.active,
    photo: { url: defaultImageUrl },
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsyncronization(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 404));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 401));
  }
  if (user.active === false) {
    return next(new AppError('Your account has been deActivated', 403));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsyncronization(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(req.headers.authorization);

  if (!token) {
    return next(
      new AppError('You Are not logged in, please login to get Access!', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this Token does no longer exist', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'You recently changed your password, Please login Again!',
        401
      )
    );
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 401)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsyncronization(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    let resetURL;

    if (req.headers['x-client-type'] === 'mobile') {
      // resetURL = `myapp://resetPassword/${resetToken}`;
      resetURL = `${req.protocol}://${req.get(
        'host'
      )}/resetPassword/${resetToken}`;
    } else {
      resetURL = `http://localhost:3000/resetPassword/${resetToken}`;
    }

    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email, check your inbox please!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email, try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsyncronization(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or has been expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsyncronization(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) {
    return next(new AppError('User is not found , Please login dude!', 404));
  }

  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(
      new AppError('Please fill the missing fields with correct values', 401)
    );
  }
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Current password is not correct', 401));
  }
  if (newPassword !== newPasswordConfirm) {
    return next(
      new AppError('New Password does not match with confirm password', 401)
    );
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
