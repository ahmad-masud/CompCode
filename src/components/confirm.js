import React from 'react';
import '../styles/confirm.css';

const Confirm = ({ onClose, onConfirm, message }) => {
  return (
    <div className="confirm-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="confirm-content">
        <div className="confirm-message">{message ? message : "Are you sure?"}</div>
        <div className="confirm-buttons">
          <button className="confirm-button" onClick={onClose}>Cancel</button>
          <button className="confirm-button" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;