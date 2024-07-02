const mongoose = require('mongoose');
const validator = require('validator');
const propertySchema = new mongoose.Schema(
  {
    // images: [String],
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
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
      // required: true,
      trim: true,
      select: false,
      required: [true, 'Property Address must be provided'],
    },
    propertyAge: {
      type: Number,
      required: [true, 'Property age must be provided'],
    },
    slug: String,
    furnished: {
      type: Boolean,
      default: false,
      required: [true, 'Select if your Property is furnished'],
    },
    finished: {
      type: Boolean,
      default: false,
      required: [true, 'Select if your Property is finished'],
    },
    elevator: {
      type: Boolean,
      default: false,
      required: [true, 'Select if your Home Has Elevator'],
    },
    isOwner: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    amenities: {
      type: [String],
      required: [true, 'select at least 1 amenity'],
    },

    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    createdAt: { type: Date, default: Date.now(), select: false },
    owner: { type: mongoose.Schema.ObjectId, ref: 'User' },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// propertySchema.index({ address: 'text' });
propertySchema.index({ 'locations.address': 'text' });
// propertySchema.index({ locations: '2dsphere' });
propertySchema.index({ 'locations.coordinates': '2dsphere' });
//virtual properties
// propertySchema.virtual('pricePerSquareMeter').get(function () {
//   return this.price / this.size;
// });

// propertySchema.virtual('isOwner').get(function() {
//   return req.user && req.user.id === this.owner.toString();
// });
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
