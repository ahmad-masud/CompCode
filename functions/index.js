const functions = require('firebase-functions');
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const stripe = require('stripe')(String(process.env.STRIPE_SECRET));

admin.initializeApp();

exports.createCheckoutSession = functions.https.onCall(
  async (data, context) => {
    const { priceId, email, isSubscription } = data;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: isSubscription ? 'subscription' : 'payment',
        success_url: 'https://compcode.tech/premium',
        cancel_url: 'https://compcode.tech/premium',
      });

      return { sessionId: session.id };
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Unable to create checkout session'
      );
    }
  }
);

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = String(process.env.STRIPE_WEBHOOK_SIGNING_SECRET);

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.log('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerId = session.customer;
      const userEmail = session.customer_email;
      const userRecord = await admin.auth().getUserByEmail(userEmail);
      const userUid = userRecord.uid;
      const userDoc = admin.firestore().collection('users').doc(userUid);

      await userDoc.set(
        {
          premiumInfo: {
            premium: true,
            stripeCustomerId: customerId,
            subscriptionId: session.subscription,
            canceled: false,
          },
        },
        { merge: true }
      );

      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const subscriptionId = invoice.subscription;

      const userSnapshot = await admin
        .firestore()
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .get();
      if (!userSnapshot.empty) {
        userSnapshot.forEach(async (doc) => {
          await doc.ref.update({
            premium: true,
          });
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const userSnapshot = await admin
        .firestore()
        .collection('users')
        .where('premiumInfo.stripeCustomerId', '==', customerId)
        .get();

      if (!userSnapshot.empty) {
        userSnapshot.forEach(async (doc) => {
          await doc.ref.update({
            premiumInfo: admin.firestore.FieldValue.delete(),
          });
        });
      } else {
        console.log(`No user found for Stripe customer ID: ${customerId}`);
      }

      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const isCanceledAtPeriodEnd = subscription.cancel_at_period_end;
      const currentPeriodEnd = subscription.current_period_end * 1000;

      const userSnapshot = await admin
        .firestore()
        .collection('users')
        .where('premiumInfo.stripeCustomerId', '==', customerId)
        .get();

      if (!userSnapshot.empty) {
        userSnapshot.forEach(async (doc) => {
          const updateData = {
            'premiumInfo.canceled': isCanceledAtPeriodEnd,
          };

          if (isCanceledAtPeriodEnd) {
            updateData['premiumInfo.subscriptionEnd'] = new Date(
              currentPeriodEnd
            );
          } else {
            updateData['premiumInfo.subscriptionEnd'] =
              admin.firestore.FieldValue.delete();
          }

          await doc.ref.update(updateData);
        });
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send('Webhook received');
});

exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  const { subscriptionId, uid } = data;

  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return { status: 'success', message: 'Subscription canceled successfully' };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to cancel subscription'
    );
  }
});

exports.createCustomerPortalSession = functions.https.onCall(
  async (data, context) => {
    const { customerId } = data;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://compcode.tech/premium',
    });

    return { url: session.url };
  }
);

exports.logoutAllDevices = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const uid = context.auth.uid;

  try {
    await admin.auth().revokeRefreshTokens(uid);
    return { message: 'Successfully logged out of all devices.' };
  } catch (error) {
    console.error('Error logging out of all devices:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to logout user from all devices.'
    );
  }
});
