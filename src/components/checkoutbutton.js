// src/components/CheckoutButton.js
import React from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Ensure Firebase is initialized in your project

const CheckoutButton = ({ priceId }) => {
  const stripe = useStripe();
  const functions = getFunctions(); // Get Firebase functions instance

  const handleCheckout = async () => {
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const { data } = await createCheckoutSession({ priceId });

      const { sessionId } = data;

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Error redirecting to checkout:', error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <button onClick={handleCheckout} className="checkout-button">
      Subscribe Now
    </button>
  );
};

export default CheckoutButton;