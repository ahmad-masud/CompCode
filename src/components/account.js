import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Import Firebase Functions
import { doc, getDoc } from 'firebase/firestore'; // To fetch user data from Firestore
import { firestore } from '../config/firebase-config'; // Import Firestore instance
import '../styles/account.css'; // Import your CSS file for styles

const Account = ({ user, onClose }) => {
  const auth = getAuth();
  const [userInfo, setUserInfo] = useState({
    displayName: '',
    email: '',
    photoURL: '',
  });
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [premiumInfo, setPremiumInfo] = useState({
    premium: false,
    subscriptionId: '',
    canceled: false,
  });

  // Firebase Functions instance
  const functions = getFunctions();

  // Fetch user information when component loads
  useEffect(() => {
    if (user) {
      // Fetch additional user info from Firestore (premium status and subscription ID)
      const userRef = doc(firestore, 'users', user.uid);
      const userEmailRef = doc(firestore, 'users', user.email)
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setUserInfo({
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL, // Set the premium status
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
      
      // Fetch user's premium status and subscription ID
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

  // Handle Sign Out
  const handleSignOut = () => {
    signOut(auth).then(() => {
      onClose();
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  };

  // Handle Account Deletion with Email Confirmation
  const handleDeleteAccount = () => {
    if (confirmEmail === userInfo.email) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        currentUser.delete().then(() => {
          onClose();
        }).catch((error) => {
          if (error.code === 'auth/requires-recent-login') {
            alert('Please re-authenticate and try again.');
          } else {
            console.error('Error deleting account:', error);
          }
        });
      }
    } else {
      setEmailError("Email does not match.");
    }
  };

  // Handle Cancel Subscription
  const handleCancelSubscription = async () => {
    if (!premiumInfo.subscriptionId) {
      setCancelError('No active subscription to cancel.');
      return;
    }

    const cancelSubscription = httpsCallable(functions, 'cancelSubscription');

    try {
      const result = await cancelSubscription({ subscriptionId: premiumInfo.subscriptionId, email: userInfo.email });

      if (result.data.status === 'success') {
        setCancelSuccess('Subscription canceled successfully.');
        setCancelError('');
      } else {
        setCancelError('Failed to cancel subscription.');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setCancelError('Error canceling subscription. Please try again.');
    }
  };

  return (
    <div className="account-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="account-overlay-content">
        <button className="close-button" onClick={onClose}><i className="bi bi-x"></i></button>

        {/* User Information */}
        <div className="account-info">
          <img src={userInfo.photoURL} alt="Profile" className="profile-image" />
          <h3>{userInfo.displayName}</h3>
          <p>{userInfo.email}</p>
        </div>

        {/* Account Settings */}
        <div className="account-settings">
          <button onClick={handleSignOut} className="account-button signout-btn">
            Sign Out
          </button>

          {/* Show Cancel Subscription Button if user has premium */}
          {premiumInfo.premium && premiumInfo.subscriptionId && !premiumInfo.canceled && (
            <div className="cancel-subscription-section">
              <button 
                onClick={handleCancelSubscription} 
                className="account-button cancel-sub-btn delete-btn">
                Cancel Subscription
              </button>
              {cancelSuccess && <p className="success-message">{cancelSuccess}</p>}
              {cancelError && <p className="error-message">{cancelError}</p>}
            </div>
          )}

          {/* Delete Account Section */}
          <div className="delete-account-section">
            <input 
              type="email" 
              placeholder="To delete your account, please confirm your email" 
              value={confirmEmail} 
              onChange={(e) => setConfirmEmail(e.target.value)} 
              className="email-input"
              required
            />
            {emailError && <p className="error-message">{emailError}</p>}
            <button 
              onClick={handleDeleteAccount} 
              className="account-button delete-btn">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;