const stripe = require("stripe")(String(process.env.STRIPE_SECRET));
const User = require("../models/User");

exports.createCheckoutSession = async (req, res) => {
  const { priceId, isSubscription = true } = req.body;
  const { email, uid } = req.user;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${process.env.CLIENT_URL}/premium`,
      cancel_url: `${process.env.CLIENT_URL}/premium`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ error: "Unable to create checkout session" });
  }
};

exports.createCustomerPortal = async (req, res) => {
  const { customerId } = req.body;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/premium`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Customer portal error:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
};

exports.cancelSubscription = async (req, res) => {
  const { subscriptionId } = req.body;

  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.status(200).json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const user = await User.findOneAndUpdate(
        { email: session.customer_email },
        {
          "premiumInfo.premium": true,
          "premiumInfo.stripeCustomerId": session.customer,
          "premiumInfo.subscriptionId": session.subscription,
          "premiumInfo.canceled": false,
        },
        { new: true }
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await User.updateOne(
        { "premiumInfo.stripeCustomerId": subscription.customer },
        { $unset: { premiumInfo: "" } }
      );
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const updates = {
        "premiumInfo.canceled": subscription.cancel_at_period_end,
      };

      if (subscription.cancel_at_period_end) {
        updates["premiumInfo.subscriptionEnd"] = new Date(
          subscription.current_period_end * 1000
        );
      } else {
        updates["premiumInfo.subscriptionEnd"] = undefined;
      }

      await User.updateOne(
        { "premiumInfo.stripeCustomerId": subscription.customer },
        { $set: updates }
      );
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send("Webhook received");
};
