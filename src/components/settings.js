import React from 'react';
import '../styles/settings.css'; // Create and import your settings-specific CSS file
import { firestore } from '../config/firebase-config';
import { doc, deleteDoc } from 'firebase/firestore';

const Settings = ({ user, onClose, theme, onThemeChange }) => {
  const deleteUserData = async () => {
    if (user) {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        await deleteDoc(userRef);  // Deletes the user's Firestore document
        localStorage.removeItem('completedProblems');
        console.log("User document deleted successfully");
        window.location.reload();
      } catch (error) {
        console.error("Error deleting user document: ", error);
      }
    }
  };

  return (
    <div className="settings-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
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
        <div className="setting-item">
          <label htmlFor="delete-doc">Delete All Data</label>
          <button className="delete-doc" onClick={deleteUserData}>Delete All</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;