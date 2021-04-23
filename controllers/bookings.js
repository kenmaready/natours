const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/Tour');
const { ErrorRunner, catchWrapper } = require('../utils/errors');

exports.getCheckout = catchWrapper(async (req, res) => {
  // get currently booked tour info
  const tour = await Tour.findById(req.params.tourId);

  if (!tour)
    return next(new ErrorRunner('No tour found with the id provided.', 400));

  // create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name}`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });
  console.log('session:', session);

  res.status(200);
  res.json({ success: true, session });
});
