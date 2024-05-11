const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: { type: String },
    messageTitle: {
      type: String,
    },
    message: {
      type: String,
    },
    createdAt: { type: Date, default: Date.now(), select: true },
    sender: { type: mongoose.Schema.ObjectId, ref: 'User' },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
