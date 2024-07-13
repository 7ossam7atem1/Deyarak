const mongoose = require('mongoose');
const rentingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    required: [true, 'Renting Must belong to a property'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Renting Must belong to a user'],
  },
  price: {
    type: Number,
    required: [true, 'Renting price must be detected'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

rentingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'property',
    select: 'name',
  });
});
const Renting = mongoose.model('Renting', rentingSchema);
module.exports = Renting;
