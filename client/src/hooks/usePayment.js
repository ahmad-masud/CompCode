import axios from "axios";
import { useAlerts } from "../context/alertscontext";
import { useUser } from "../context/usercontext";
import { useStripe } from "@stripe/react-stripe-js";

const usePayment = () => {
  const { user, premiumInfo } = useUser();
  const { addAlert } = useAlerts();
  const stripe = useStripe();

  const createCheckout = async (priceId, isSubscription = true) => {
    if (!user) {
      addAlert("You must login first", "warning");
      return;
    }

    if (premiumInfo?.premium) {
      addAlert("You already have premium", "info");
      return;
    }

    try {
      addAlert("Redirecting to Stripe...", "info");

      const res = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/payment/create-checkout`,
        {
          priceId,
          isSubscription,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { error } = await stripe.redirectToCheckout({
        sessionId: res.data.sessionId,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Checkout error:", error);
      addAlert("Error creating checkout session", "error");
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !premiumInfo?.stripeCustomerId) {
      addAlert("Customer ID not found or user not logged in", "error");
      return;
    }

    try {
      addAlert("Loading customer portal...", "info");

      const res = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/payment/customer-portal`,
        {
          customerId: premiumInfo.stripeCustomerId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      window.location.href = res.data.url;
    } catch (error) {
      console.error("Customer portal error:", error);
      addAlert("Error redirecting to customer portal", "error");
    }
  };

  const cancelSubscription = async () => {
    if (!user || !premiumInfo?.subscriptionId) return;

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/payment/cancel-subscription`,
        {
          subscriptionId: premiumInfo.subscriptionId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.message === "Subscription canceled successfully") {
        addAlert("Subscription cancelled", "success");
      } else {
        throw new Error("Stripe cancellation failed");
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      addAlert("Error cancelling subscription", "error");
    }
  };

  return {
    createCheckout,
    openCustomerPortal,
    cancelSubscription,
  };
};

export default usePayment;
