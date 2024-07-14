const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Property = require('../models/propertyModel');
const Renting = require('../models/rentingModel');
const catchAsyncronization = require('../utils/catchAsyncronization');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

exports.getCheckoutSession = catchAsyncronization(async (req, res, next) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/api/v1/rentings/renting-checkout?property=${
      req.params.propertyId
    }&user=${req.user.id}&price=${property.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/properties/${
      property._id
    }`,
    customer_email: req.user.email,
    client_reference_id: req.params.propertyId,
    line_items: [
      {
        price_data: {
          currency: 'EGP',
          product_data: {
            name: `${property.locations.address} Property For Renting by ${property.owner.name}`,
            description: property.description,
            images: property.images.map((image) => image.url),
          },
          unit_amount: property.price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      ownerName: property.owner.name,
      ownerEmail: property.owner.email,
      propertyAddress: property.locations.address,
      propertyDescription: property.description,
      renterName: req.user.name,
      renterEmail: req.user.email,
    },
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createRentingCheckout = catchAsyncronization(async (req, res, next) => {
  const { property, user, price } = req.query;
  console.log('Middleware executed');
  console.log('Query Parameters:', { property, user, price });

  if (!property || !user || !price) return next();

  try {
    const renting = await Renting.create({ property, user, price });
    console.log('Renting record created:', renting);

    res.redirect('/');
  } catch (error) {
    console.error('Error creating renting record:', error);
    next(error);
  }
});

exports.handleStripeWebhook = catchAsyncronization(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    await Renting.create({
      property: session.client_reference_id,
      user: session.metadata.renterEmail,
      price: session.amount_total / 100,
    });
  }

  res.status(200).json({ received: true });
});
