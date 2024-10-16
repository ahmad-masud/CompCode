// src/components/PremiumPage.js
import React from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Ensure Firebase is initialized in your project
import '../styles/premium.css';

const PremiumPage = ({ user }) => {
  const stripe = useStripe();
  const functions = getFunctions(); // Get Firebase functions instance
  //const [test, setTest] = useState(false);

  /*useEffect(() => {
    if (user && user.email === "ahmadmasud2027@gmail.com") {
      setTest(true);
    }
  }, [user]);*/

  const handleCheckout = async (priceId, isSubscription) => {
    if (!user) {
      console.error('User not logged in');
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

  // Replace with your actual Stripe price IDs
  const monthlyPriceId = 'price_1Q9xzfFyVXgjLrCzwNw8Hrxc';  // Example Price ID for Monthly
  const yearlyPriceId = 'price_1Q9y2rFyVXgjLrCzkuvHvh6A';   // Example Price ID for Annual
  const lifetimePriceId = 'price_1Q9vsaFyVXgjLrCzlSBcpK1L'; 
  //const testPriceId = 'price_1Q9yelFyVXgjLrCzlTulMhMt';  // Example Price ID for Monthly
  //const test2PriceId = 'price_1Q9zVcFyVXgjLrCzy2QNTmHf';  // Example Price ID for Monthly

  return (
    <div className="premium-page">
      <p className='premium-title'>Premium</p>
      <p className='premium-info'>Choose your subscription plan:</p>
      {/*test && <button onClick={() => handleCheckout(testPriceId, false)} className='test-button'>Test</button>*/}
      {/*test && <button onClick={() => handleCheckout(test2PriceId, true)} className='test-button'>Test 2</button>*/}
      <div className="subscription-options">
        <div className="subscription-option">
          <p className='subscription-title'>Monthly Plan</p>
          <p className='subscription-cost'>$ 5 <span>| month</span></p>
          <div className='subscription-features'>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Access to frequency count</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Access to solutions for company problems</p>
          </div>
          <button
            className="checkout-button"
            onClick={() => handleCheckout(monthlyPriceId, true)}
          >
            Subscribe
          </button>
        </div>
        <div className="subscription-option">
          <p className='subscription-title'>Yearly Plan</p>
          <p className='subscription-cost'>$ 50 <span>| year</span></p>
          <div className='subscription-features'>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Save $10 per year</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Access to frequency count</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Access to solutions for company problems</p>
          </div>
          <button
            className="checkout-button"
            onClick={() => handleCheckout(yearlyPriceId, true)}
          >
            Subscribe
          </button>
        </div>
        <div className="subscription-option">
          <p className='subscription-title'>Lifetime Plan</p>
          <p className='subscription-cost'>$ 75</p>
          <div className='subscription-features'>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Own forever</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Access to frequency count</p>
            <p className='subscription-feature'><i className="fa-solid fa-check"></i> Access to solutions for company problems</p>
          </div>
          <button
            className="checkout-button"
            onClick={() => handleCheckout(lifetimePriceId, false)}
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;