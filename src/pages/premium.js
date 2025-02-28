import React from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { getFunctions, httpsCallable } from "firebase/functions";
import "../styles/premium.css";
import { useAlerts } from "../context/alertscontext";
import { useUser } from "../context/usercontext";

const Premium = () => {
  const stripe = useStripe();
  const functions = getFunctions();
  const { addAlert } = useAlerts();
  const { user, premiumInfo } = useUser();

  const handleManageSubscription = async () => {
    if (!user) {
      console.error("User not logged in");
      addAlert("You must login first", "warning");
      return;
    }

    if (!premiumInfo.customerId) {
      console.error("Customer ID not found.");
      addAlert("Customer ID not found", "error");
      return;
    }

    addAlert("Loading customer portal...", "info");
    const createCustomerPortalSession = httpsCallable(
      functions,
      "createCustomerPortalSession"
    );

    try {
      const { data } = await createCustomerPortalSession({
        customerId: premiumInfo.customerId,
      });
      window.location.href = data.url;
    } catch (error) {
      console.error("Error redirecting to customer portal:", error);
      addAlert("Error redirecting to customer portal", "error");
    }
  };

  const handlePremium = async (priceId, isSubscription) => {
    if (!user) {
      console.error("User not logged in");
      addAlert("You must login first", "warning");
      return;
    }

    if (premiumInfo.premium) {
      return;
    }

    addAlert("Loading Customer Portal...", "info");

    try {
      const createCheckoutSession = httpsCallable(
        functions,
        "createCheckoutSession"
      );
      const { data } = await createCheckoutSession({
        priceId: priceId,
        email: user.email,
        isSubscription: isSubscription,
      });

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      if (error) {
        console.error("Error redirecting to checkout:", error);
        addAlert("Error redirecting to checkout", "error");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      addAlert("Error creating checkout session", "error");
    }
  };

  return (
    <div className="premium-page">
      <p className="premium-title">Premium</p>
      <p className="premium-info">Choose your subscription plan</p>
      <div className="subscription-options">
        <div className="subscription-option">
          <p className="subscription-title">Free</p>
          <p className="subscription-cost">
            <span>$</span>0<span>USD | month</span>
          </p>
          <button className="checkout-button disabled">
            {user
              ? premiumInfo.premium
                ? "Previous Plan"
                : "Current Plan"
              : "Free Plan"}
          </button>
          <div className="subscription-features">
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Company-wise problems
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Roadmap problems and
              solutions
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Free-tier lessons
            </p>
          </div>
        </div>
        <div className="subscription-option">
          <p className="subscription-title">Premium</p>
          <p className="subscription-cost">
            <span>$</span>5<span>USD | month</span>
          </p>
          <button
            className={
              "checkout-button" + (premiumInfo.premium ? " disabled" : "")
            }
            onClick={() =>
              handlePremium("price_1Q9xzfFyVXgjLrCzwNw8Hrxc", true)
            }
          >
            {premiumInfo.premium ? "Current Plan" : "Upgrade to Premium"}
          </button>
          <div className="subscription-features">
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Company-wise problems
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Roadmap problems and
              solutions
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Free-tier lessons
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Frequency count for
              company-wise problems
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Premium-tier lessons
            </p>
          </div>
          {premiumInfo.premium && (
            <button
              className="manage-button"
              onClick={handleManageSubscription}
            >
              Manage my subscription
            </button>
          )}
          {premiumInfo.premium &&
            premiumInfo.canceled &&
            premiumInfo.subscriptionEnd && (
              <p className="cancel-info">
                You will have access to premium until{" "}
                {premiumInfo.subscriptionEnd.toDate().toLocaleDateString()}.
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Premium;
