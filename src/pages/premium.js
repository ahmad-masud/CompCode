import React, { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore'; // To fetch user data from Firestore
import { firestore } from '../config/firebase-config'; // Import Firestore instance
import Confirm from '../components/confirm';
import '../styles/premium.css';

const PremiumPage = ({ user }) => {
  const stripe = useStripe();
  const functions = getFunctions();
  const [email, setEmail] = useState('');
  const [displayConfirm, setDisplayConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [premiumInfo, setPremiumInfo] = useState({
    premium: false,
    subscriptionId: '',
    canceled: false,
  });

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setEmail(user.email);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });

      const userEmailRef = doc(firestore, 'users', user.email)
      getDoc(userEmailRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setPremiumInfo({
              premium: userData.premium,
              subscriptionId: userData.subscriptionId,
              canceled: userData.canceled,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    }
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!premiumInfo.subscriptionId) {
      console.log('No active subscription to cancel.');
      return;
    }

    const cancelSubscription = httpsCallable(functions, 'cancelSubscription');

    try {
      const result = await cancelSubscription({ subscriptionId: premiumInfo.subscriptionId, email: email });

      if (result.data.status === 'success') {
        console.log('Subscription canceled successfully.');
        setPremiumInfo({
          ...premiumInfo,
          canceled: true
        });
      } else {
        console.error('Failed to cancel subscription.');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  const handlePremium = async (priceId, isSubscription) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    if (premiumInfo.premium && !premiumInfo.canceled) {
      setConfirmMessage('Are you sure you want to cancel your subscription?');
      setDisplayConfirm(true);
      return;
    }

    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const { data } = await createCheckoutSession({ priceId: priceId, email: user.email, isSubscription: isSubscription });

      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        console.error('Error redirecting to checkout:', error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const handleConfirm = () => {
    handleCancelSubscription();
    setDisplayConfirm(false);
  }

  return (
    <div className="premium-page">
      {displayConfirm && <Confirm onClose={() => setDisplayConfirm(false)} message={confirmMessage} onConfirm={handleConfirm}/>}
      <p className='premium-title'>Premium</p>
      <p className='premium-info'>Choose your subscription plan:</p>
      <div className="subscription-options">
        <div className="subscription-option">
          <p className='subscription-title'>Free</p>
          <p className='subscription-cost'>$0<span>USD | month</span></p>
          <button
            className="checkout-button disabled"
          >
            {premiumInfo.premium && !premiumInfo.canceled ? 'Previous Plan' : 'Current Plan'}
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
            className={"checkout-button" + (premiumInfo.premium && !premiumInfo.canceled ? ' cancel' : '')}
            onClick={() => handlePremium("price_1Q9xzfFyVXgjLrCzwNw8Hrxc", true)}
          >
            {premiumInfo.premium && !premiumInfo.canceled ? 'Cancel Premium' : 'Upgrade to Premium'}
          </button>
          <div className='subscription-features'>
          <p className='subscription-feature'><i className="fa-solid fa-check"></i> Company-wise problems</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Data structure problems and solutions</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Algorithm problems and solutions</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Frequency count for company-wise problems</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Solutions for company problems</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;