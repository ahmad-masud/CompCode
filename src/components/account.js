import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
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

  // Fetch user information when component loads
  useEffect(() => {
    if (user) {
      setUserInfo({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
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