/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(String(process.env.STRIPE_SECRET)); // Replace with your Stripe secret key

admin.initializeApp();

// A simple function to create a Stripe Checkout session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  const { priceId, email, isSubscription } = data;  // Add `isSubscription` flag

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,  // Use the user's email for the session
      line_items: [
        {
          price: priceId, // Ensure this is a valid Price ID from Stripe
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment', // Use 'subscription' or 'payment' based on the product
      success_url: 'https://ahmadmasud.com/CompCode',
      cancel_url: 'https://ahmadmasud.com/CompCode',
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create checkout session');
  }
});


// Cloud function to handle Stripe webhooks
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = String(process.env.STRIPE_WEBHOOK_SIGNING_SECRET); // Replace with your endpoint secret

  let event;

  try {
    // Verify webhook signature to ensure it came from Stripe
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.log('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event based on its type
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerId = session.customer;
      const userEmail = session.customer_email; // or session.customer if you're storing the Stripe customer ID

      // Store the subscription status in Firestore or Realtime Database
      const userDoc = admin.firestore().collection('users').doc(userEmail);
      await userDoc.set({
        premium: true,  // Set the premium status
        stripeCustomerId: customerId,
        subscriptionId: session.subscription,
        canceled: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const subscriptionId = invoice.subscription;

      // Update the user's premium status if the payment succeeded
      const userSnapshot = await admin.firestore().collection('users').where('stripeCustomerId', '==', customerId).get();
      if (!userSnapshot.empty) {
        userSnapshot.forEach(async (doc) => {
          await doc.ref.update({
            premium: true,
            lastPayment: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Mark the user as no longer premium
      const userSnapshot = await admin.firestore().collection('users').where('stripeCustomerId', '==', customerId).get();
      if (!userSnapshot.empty) {
        userSnapshot.forEach(async (doc) => {
          await doc.ref.update({
            premium: false,
            canceledAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send('Webhook received');
});

// Function to cancel a Stripe subscription
exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  const { subscriptionId, email } = data;  // Get the subscription ID passed from the frontend

  try {
    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      {cancel_at_period_end: true}
    );

    // Optionally, update Firestore to reflect the user's canceled subscription
    const userRef = admin.firestore().collection('users').doc(email);
    await userRef.update({ canceled: true });

    return { status: 'success', message: 'Subscription canceled successfully' };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new functions.https.HttpsError('internal', 'Unable to cancel subscription');
  }
});