import React, { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore'; // To fetch user data from Firestore
import { firestore } from '../config/firebase-config'; // Import Firestore instance
import '../styles/premium.css';
import { useAlerts } from '../context/alertscontext';

const Premium = ({ user }) => {
  const stripe = useStripe();
  const functions = getFunctions();
  const [premiumInfo, setPremiumInfo] = useState({
    premium: false,
    subscriptionId: '',
    canceled: false,
    customerId: '',
    subscriptionEnd: null,
  });
  const { addAlert } = useAlerts();

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // Check if premiumInfo exists before trying to access its fields
            if (userData.premiumInfo) {
              setPremiumInfo({
                premium: userData.premiumInfo.premium || false,  // Set a default value if undefined
                subscriptionId: userData.premiumInfo.subscriptionId || "",  // Set default empty string if undefined
                canceled: userData.premiumInfo.canceled || false,  // Set default to false if undefined
                customerId: userData.premiumInfo.stripeCustomerId || "",  // Set default empty string if undefined
                subscriptionEnd: userData.premiumInfo.subscriptionEnd || null,  // Set default to null if undefined
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
          addAlert('Error fetching user data!', 'error');
        });
    }
  }, [user, addAlert]);
  
  const handleManageSubcription = async () => {
    if (!user) {
      console.error('User not logged in');
      addAlert('User not logged in!', 'error');
      return;
    }

    if (!premiumInfo.customerId) {
      console.error('Customer ID not found.');
      addAlert('Customer ID not found!', 'error');
      return;
    }
    addAlert('Loading customer portal...', 'info');
    const createCustomerPortalSession = httpsCallable(functions, 'createCustomerPortalSession');
  
    try {
      const { data } = await createCustomerPortalSession({ customerId: premiumInfo.customerId }); // Make sure you have the user's Stripe customer ID stored in Firestore
  
      window.location.href = data.url; // Redirect to the Stripe Customer Portal
    } catch (error) {
      console.error('Error redirecting to customer portal:', error);
      addAlert('Error redirecting to customer portal!', 'error');
    }
  };  

  const handlePremium = async (priceId, isSubscription) => {
    if (!user) {
      console.error('User not logged in');
      addAlert('User not logged in!', 'error');
      return;
    }

    if (premiumInfo.premium) {
      return;
    }

    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const { data } = await createCheckoutSession({ priceId: priceId, email: user.email, isSubscription: isSubscription });

      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        console.error('Error redirecting to checkout:', error);
        addAlert('Error redirecting to checkout!', 'error');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      addAlert('Error creating checkout session!', 'error');
    }
  };

  return (
    <div className="premium-page">
      <p className='premium-title'>Premium</p>
      <p className='premium-info'>Choose your subscription plan:</p>
      <div className="subscription-options">
        <div className="subscription-option">
          <p className='subscription-title'>Free</p>
          <p className='subscription-cost'>$0<span>USD | month</span></p>
          <button
            className="checkout-button disabled"
          >
            {premiumInfo.premium ? 'Previous Plan' : 'Current Plan'}
          </button>
          <div className='subscription-features'>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Company-wise problems</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Data structure problems and solutions</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Algorithm problems and solutions</p>
          </div>
        </div>
        <div className="subscription-option">
          <p className='subscription-title'>Premium</p>
          <p className='subscription-cost'>$5<span>USD | month</span></p>
          <button
            className={"checkout-button" + (premiumInfo.premium ? ' disabled' : '')}
            onClick={() => handlePremium("price_1Q9xzfFyVXgjLrCzwNw8Hrxc", true)}
          >
            {premiumInfo.premium ? 'Current Plan' : 'Upgrade to Premium'}
          </button>
          <div className='subscription-features'>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Company-wise problems</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Data structure problems and solutions</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Algorithm problems and solutions</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Frequency count for company-wise problems</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Solutions for company problems</p>
          </div>
          {premiumInfo.premium && (
            <button className='manage-button' onClick={handleManageSubcription}>
              Manage my subscription
            </button>
          )}
          {premiumInfo.premium && premiumInfo.canceled && premiumInfo.subscriptionEnd && (
            <p className='cancel-info'>
              You will have access to premium until {premiumInfo.subscriptionEnd.toDate().toLocaleDateString()}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Premium;