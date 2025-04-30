const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  createCustomerPortal,
  cancelSubscription,
  stripeWebhook,
} = require("../controllers/paymentController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/create-checkout", authenticate, createCheckoutSession);
router.post("/customer-portal", authenticate, createCustomerPortal);
router.post("/cancel-subscription", authenticate, cancelSubscription);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

module.exports = router;
