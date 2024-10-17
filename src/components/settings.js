import React, { useState, useEffect } from 'react';
import '../styles/settings.css'; // Create and import your settings-specific CSS file
import { firestore } from '../config/firebase-config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Confirm from '../components/confirm';
import { useAlerts } from '../context/alertscontext';

const Settings = ({ user, onClose, theme, onThemeChange }) => {
  const auth = getAuth();
  const functions = getFunctions();
  const [displayConfirm, setDisplayConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('');
  const [premiumInfo, setPremiumInfo] = useState({
    premium: false,
    subscriptionId: '',
    canceled: false,
  });
  const { addAlert } = useAlerts();

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid)
      getDoc(userRef)
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

  const deleteUserData = async () => {
    if (user) {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        
        // Use updateDoc with FieldValue.delete() to remove only the 'completedProblems' field
        await updateDoc(userRef, {
          completedProblems: {},
        });
  
        localStorage.removeItem('completedProblems');  // Optionally remove from localStorage too
        console.log("Completed problems deleted successfully");
        addAlert('Completed problems deleted successfully.', 'success');
        window.location.reload();
      } catch (error) {
        console.error("Error deleting completed problems: ", error);
        addAlert('Error deleting data.', 'error');
      }
    }
  };

  const handleDeleteAccount = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      currentUser.delete().then(() => {
        handleCancelSubscription();
        onClose();
      }).catch((error) => {
        if (error.code === 'auth/requires-recent-login') {
          addAlert('Please re-authenticate and try again.', 'warning');
        } else {
          console.error('Error deleting account:', error);
          addAlert('Error deleting account.', 'error');
        }
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!premiumInfo.subscriptionId) {
      console.log('No active subscription to cancel.');
      return;
    }

    const cancelSubscription = httpsCallable(functions, 'cancelSubscription');

    try {
      const result = await cancelSubscription({ subscriptionId: premiumInfo.subscriptionId, uid: user.uid });

      if (result.data.status === 'success') {
        console.log('Subscription canceled successfully.');
      } else {
        console.error('Failed to cancel subscription.');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  const confirmAction = () => {
    if (confirmType === 'deleteData') {
      deleteUserData();
    } else if (confirmType === 'deleteAccount') {
      handleDeleteAccount();
    }
    setDisplayConfirm(false);
  };

  const showConfirm = (type, message) => {
    setConfirmType(type);
    setConfirmMessage(message);
    setDisplayConfirm(true);
  };

  return (
    <div className="settings-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      {displayConfirm && (
        <Confirm 
          onClose={() => setDisplayConfirm(false)} 
          message={confirmMessage} 
          onConfirm={confirmAction} 
        />
      )}
      <div className="settings-content">
        <button className="close-button" onClick={onClose}><i className="bi bi-x"></i></button>
        <h2>Settings</h2>
        <div className="setting-item">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            className="setting-input"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
          >
            <option value="auto">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <hr className='divider' />
        <div className="setting-item">
          <label htmlFor="delete-doc">Delete All Data</label>
          <button 
            className="delete-doc" 
            onClick={() => showConfirm('deleteData', 'Are you sure you want to delete all your data?')}
          >
            Delete All
          </button>
        </div>
        <hr className='divider' />
        <div className="setting-item">
          <label htmlFor="delete-doc">Delete Account</label>
          <button 
            className="delete-doc" 
            onClick={() => showConfirm('deleteAccount', 'Are you sure you want to delete your account?')}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;