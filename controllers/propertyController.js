const mongoose = require('mongoose');
const { Types } = require('mongoose');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const sharp = require('sharp');
const Property = require('../models/propertyModel');
const catchAsyncronization = require('../utils/catchAsyncronization');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not An Image! Please upload correct file formats.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPropertiesImages = upload.fields([
  { name: 'images', maxCount: 7 },
]);

exports.resizePropertyImages = catchAsyncronization(async (req, res, next) => {
  if (!req.files.images) return next();
  if (req.files.images.length < 5) {
    return next(new AppError('You must insert at least 5 images'), 400);
  }

  const imagesUploadPromises = req.files.images.map(async (file, i) => {
    const imageBuffer = await sharp(file.buffer)
      .resize({
        fit: 'cover',
      })
      .toBuffer();

    const imageUploadPromise = new Promise((resolve) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'properties',
            overwrite: true,
            invalidate: true,
          },
          async (err, result) => {
            if (err) {
              return next(
                new AppError('Error uploading the image to Cloudinary', 500)
              );
            }

            if (!result || !result.secure_url || !result.public_id) {
              return next(new AppError('Cloudinary upload failed', 500));
            }

            const imageObj = {
              url: result.secure_url,
              public_id: result.public_id,
            };
            req.body.images.push(imageObj);

            resolve(imageObj);
          }
        )
        .end(imageBuffer);
    });

    return imageUploadPromise;
  });

  req.body.images = [];

  await Promise.all(imagesUploadPromises);

  next();
});

exports.updateProperty = catchAsyncronization(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('Property with that id not found', 404));
  }

  const oldPublicIds = property.images.map((image) => image.public_id);
  const newPublicIds = req.body.images
    ? req.body.images.map((image) => image.public_id)
    : [];

  const publicIdsToDelete = oldPublicIds.filter(
    (oldPublicId) => !newPublicIds.includes(oldPublicId)
  );

  const deletePromises = publicIdsToDelete.map(async (public_id) => {
    await cloudinary.v2.uploader.destroy(public_id);
  });

  await Promise.all(deletePromises);

  if (req.body.images) {
    property.images = req.body.images;
  }

  Object.keys(req.body).forEach((key) => {
    if (key !== 'images') {
      property[key] = req.body[key];
    }
  });

  await property.save();

  res.status(200).json({
    status: 'Success',
    message: 'Property updated successfully!',
    data: {
      data: property,
    },
  });
});

exports.deleteProperty = catchAsyncronization(async (req, res, next) => {
  const property = await Property.findById(req.params.id).populate('images');

  if (!property) {
    return next(new AppError('Property with that id not found', 404));
  }

  const deletePromises = property.images.map(async (image) => {
    await cloudinary.v2.uploader.destroy(image.public_id);
  });

  await Promise.all(deletePromises);

  await property.deleteOne();

  res.status(204).json({
    status: 'success',
  });
});

exports.aliastingTopProperties = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price';
  req.query.fields =
    'price,size,numberOfRooms,location,images,numberOfBathrooms,address';
  next();
};

exports.calculateCriticalStats = catchAsyncronization(
  async (req, res, next) => {
    const stats = await Property.aggregate([
      {
        $group: {
          _id: { $toUpper: '$category' },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          averageSize: { $avg: '$size' },
          minSize: { $min: '$size' },
          maxSize: { $max: '$size' },
          totalProperties: { $sum: 1 },
          averageRooms: { $avg: '$numberOfRooms' },
          averageBathrooms: { $avg: '$numberOfBathrooms' },
          totalFurnished: {
            $sum: { $cond: { if: '$furnished', then: 1, else: 0 } },
          },
          totalFinished: {
            $sum: { $cond: { if: '$finished', then: 1, else: 0 } },
          },
          totalWithElevator: {
            $sum: { $cond: { if: '$elevator', then: 1, else: 0 } },
          },
          averagePricePerRoom: {
            $avg: { $divide: ['$price', '$numberOfRooms'] },
          },
          averagePricePerSquareMeter: {
            $avg: { $divide: ['$price', '$size'] },
          },
          uniqueAddresses: { $addToSet: '$address' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          averagePrice: 1,
          minPrice: 1,
          maxPrice: 1,
          averageSize: 1,
          minSize: 1,
          maxSize: 1,
          totalProperties: 1,
          averageRooms: 1,
          averageBathrooms: 1,
          totalFurnished: 1,
          totalFinished: 1,
          totalWithElevator: 1,
          averagePricePerRoom: 1,
          averagePricePerSquareMeter: 1,
          uniqueAddresses: 1,
        },
      },
      {
        $sort: { averagePrice: 1 },
      },
    ]);

    res.status(200).json({
      status: 'Success',
      results: stats.length,
      data: {
        stats: stats,
      },
    });
  }
);

exports.getAllProperties = factory.getAll(Property);

exports.getProperty = factory.getOne(Property);

exports.createProperty = factory.createOne(Property);
exports.getRelatedSuggestions = catchAsyncronization(async (req, res, next) => {
  const propertyId = req.params.id;
  const currentProperty = await Property.findById(propertyId);
  if (!currentProperty) {
    return next(new AppError('Property with that id not found', 404));
  }

  const locationCriteria = {
    'locations.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: currentProperty.locations.coordinates,
        },
        $maxDistance: 10000,
      },
    },
  };

  const sizeAndRoomCriteria = {
    $and: [
      {
        _id: { $ne: propertyId },
      },
      {
        $or: [
          {
            size: {
              $gte: currentProperty.size - 100,
              $lte: currentProperty.size + 100,
            },
          },
          {
            numberOfRooms: {
              $gte: currentProperty.numberOfRooms - 2,
              $lte: currentProperty.numberOfRooms + 2,
            },
          },
          {
            category: currentProperty.category,
          },
        ],
      },
    ],
  };

  const criteria = {
    $and: [locationCriteria, sizeAndRoomCriteria],
  };

  let relatedProperties = await Property.find(criteria)
    .select(
      'price size numberOfRooms locations images numberOfBathrooms address category'
    )
    .limit(8);

  if (relatedProperties.length === 0) {
    relatedProperties = await Property.find({
      _id: { $ne: propertyId },
    })
      .select(
        'price size numberOfRooms locations images numberOfBathrooms address category'
      )
      .limit(5);
  }

  res.status(200).json({
    status: 'success',
    results: relatedProperties.length,
    data: {
      data: relatedProperties,
    },
  });
});

exports.getPropertiesWithin = catchAsyncronization(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  console.log(radius);
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please Provide  latitude and longitude in correct format lat,lng.',
        400
      )
    );
  }

  console.log(distance, lat, lng, unit);
  const properties = await Property.find({
    locations: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  if (!properties) {
    return next(new AppError('No Properties Found in your area', 404));
  }
  res.status(200).json({
    status: 'success',
    result: properties.length,
    data: {
      data: properties,
    },
  });
});

exports.getDistances = catchAsyncronization(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please Provide latitude and longitude in correct format lat,lng.',
        400
      )
    );
  }

  const distances = await Property.aggregate([
    {
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});

exports.getPropertiesLocations = catchAsyncronization(
  async (req, res, next) => {
    const properties = await Property.find({
      locations: { $exists: true, $ne: [] },
    });

    const locationsWithPrices = properties.map((property) => ({
      ...property.locations,
      price: property.price,
    }));

    res.status(200).json({
      status: 'success',
      result: locationsWithPrices.length,
      data: {
        locations: locationsWithPrices,
      },
    });
  }
);

exports.viewOnMap = catchAsyncronization(async (req, res, next) => {
  const propertyId = req.params.id;
  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Property with that id not Found', 404));
  }
  const markOnMap = property.locations;
  res.status(200).json({
    status: 'success',
    data: {
      locations: markOnMap,
    },
  });
});

exports.getUserProperties = catchAsyncronization(async (req, res, next) => {
  const userId = req.params.userId;
  const userProperties = await Property.find({ owner: userId });
  if (!userProperties) {
    return next(new AppError(`This user didn't post any properties`, 404));
  }
  res.status(200).json({
    status: 'success',
    result: userProperties.length,
    data: {
      data: userProperties,
    },
  });
});
