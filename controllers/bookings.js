const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const factory = require('./handlerFactory');
const { ErrorRunner, catchWrapper } = require('../utils/errors');

exports.getAllBookings = factory.getAll(Booking, { path: 'tour' });
exports.getBooking = factory.getOne(Booking, { path: 'tour' });
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

exports.getCheckout = catchWrapper(async (req, res) => {
  // get currently booked tour info
  const tour = await Tour.findById(req.params.tourId);

  if (!tour)
    return next(new ErrorRunner('No tour found with the id provided.', 400));

  // create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get(
    //   'host'
    // )}/api/v1/bookings/success?tour=${req.params.tourId}&user=${
    //   req.user._id
    // }&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/api/v1/bookings/success`,
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

  res.status(200);
  res.json({ success: true, session });
});

// exports.createBookingCheckout = catchWrapper(async (req, res, next) => {
//   // Temporary solution before we deploy - this is not secure, so don't use in production:
//   const { tour, user, price } = req.query;

//   if (!tour || !user || !price) {
//     return next(
//       new ErrorRunner(
//         'There has been some error with the returning URL, must include valid tour, user and price parameters'
//       )
//     );
//   }

//   const booking = await Booking.create({ tour, user, price });

//   res.status(200);
//   res.redirect(`${req.protocol}://${req.get('host')}/`);
// });

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  const price = session.line_items[0].amount / 100;
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400);
    res.send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.complete')
    createBookingCheckout(event.data.object);

  res.status(200);
  res.json({ received: true });
};
