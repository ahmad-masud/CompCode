import React from 'react';
import '../styles/settings.css'; // Create and import your settings-specific CSS file

const Settings = ({ onClose, theme, onThemeChange }) => {
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
      </div>
    </div>
  );
};

export default Settings;