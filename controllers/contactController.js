const catchAsyncronization = require('../utils/catchAsyncronization');
const Contact = require('../models/contactModel');

exports.contactUs = catchAsyncronization(async (req, res) => {
  const { name, phone, messageTitle, message } = req.body;
  const newContact = new Contact({
    name,
    phone,
    messageTitle,
    message,
    sender: req.user.id,
  });

  await newContact.save();
  res.status(201).json({
    status: 'Success',
    message: 'Your message has been sent',
  });
});

exports.getContacts = catchAsyncronization(async (req, res) => {
  const contacts = await Contact.find().populate({
    path: 'sender',
    select: '-_id photo name email',
  });
  res.status(200).json({
    status: 'Success',
    result: contacts.length,
    data: contacts,
  });
});
