const mongoose = require('mongoose');
const validator = require('validator');
const propertySchema = new mongoose.Schema(
  {
    images: [String],
    price: {
      type: Number,
      required: [true, 'A property must have a price '],
    },
    size: {
      type: Number,
      required: [true, 'A property must have a Size'],
    },
    numberOfRooms: {
      type: Number,
      required: [true, 'Number of rooms must be provided'],
    },
    numberOfBathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms must be provided'],
    },
    category: {
      type: String,
      enum: ['apartment', 'furnished apartment', 'family house', 'villa'],
      required: true,
    },
    locations: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },

      coordinates: [Number],
      address: String,
      description: String,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    slug: String,
    furnished: {
      type: Boolean,
      default: false,
    },
    finished: {
      type: Boolean,
      default: false,
    },
    elevator: {
      type: Boolean,
      default: false,
    },
    amenities: {
      type: [String],
    },
    description: {
      type: String,
      trim: true,
      required: [false, 'A tour must have a description'],
    },
    createdAt: { type: Date, default: Date.now(), select: false },
    owner: { type: mongoose.Schema.ObjectId, ref: 'User' },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

propertySchema.index({ address: 'text' });
propertySchema.index({ locations: '2dsphere' });
//virtual properties
propertySchema.virtual('pricePerSquareMeter').get(function () {
  return this.price / this.size;
});

propertySchema.virtual('totalRooms').get(function () {
  return this.numberOfRooms + this.numberOfBathrooms;
});

//Query Middleware
propertySchema.pre(/^find/, function (next) {
  this.start = Date.now();
  next();
});

propertySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'owner',
    select: '-__v -passwordResetExpires -passwordResetToken -passwordChangedAt',
  });
  next();
});

propertySchema.post(/^find/, function (docs, next) {
  console.log(`Query took  ${Date.now() - this.start} milliseconds`);
  next();
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
