import { getFunctions, httpsCallable } from "firebase/functions";
import { useAlerts } from "../context/alertscontext";
import { useUser } from "../context/usercontext";
import { useStripe } from "@stripe/react-stripe-js";

const usePayment = () => {
  const { user, premiumInfo } = useUser();
  const { addAlert } = useAlerts();
  const stripe = useStripe();
  const functions = getFunctions();

  const createCheckout = async (priceId, isSubscription = true) => {
    if (!user) {
      addAlert("You must login first", "warning");
      return;
    }

    if (premiumInfo.premium) {
      addAlert("You already have premium", "info");
      return;
    }

    try {
      addAlert("Redirecting to Stripe...", "info");

      const createCheckoutSession = httpsCallable(
        functions,
        "createCheckoutSession"
      );

      const { data } = await createCheckoutSession({
        priceId,
        email: user.email,
        isSubscription,
      });

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Checkout error:", error);
      addAlert("Error creating checkout session", "error");
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !premiumInfo?.customerId) {
      addAlert("Customer ID not found or user not logged in", "error");
      return;
    }

    try {
      addAlert("Loading customer portal...", "info");

      const createCustomerPortalSession = httpsCallable(
        functions,
        "createCustomerPortalSession"
      );

      const { data } = await createCustomerPortalSession({
        customerId: premiumInfo.customerId,
      });

      window.location.href = data.url;
    } catch (error) {
      console.error("Customer portal error:", error);
      addAlert("Error redirecting to customer portal", "error");
    }
  };

  const cancelSubscription = async () => {
    if (!user || !premiumInfo?.subscriptionId) {
      return;
    }

    try {
      const cancel = httpsCallable(functions, "cancelSubscription");
      const result = await cancel({
        subscriptionId: premiumInfo.subscriptionId,
        uid: user.uid,
      });

      if (result.data.status === "success") {
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
