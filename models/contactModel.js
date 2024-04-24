const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    messageTitle: String,
    message: String,
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
