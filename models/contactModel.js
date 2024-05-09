const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'You must provide your name'],
    },
    phone: { type: String, required: [true, 'You must provide your phone'] },
    messageTitle: {
      type: String,
      required: [true, 'You must provide your message Title'],
    },
    message: {
      type: String,
      required: [true, 'You must provide your message'],
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
