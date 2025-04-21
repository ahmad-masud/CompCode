import React, { useState } from "react";
import "../styles/settings.css";
import Confirm from "../components/confirm";
import { useUser } from "../context/usercontext";
import useDelete from "../hooks/useDelete";
import useLogout from "../hooks/useLogout";
import useExport from "../hooks/useExport";

const Settings = ({ onClose }) => {
  const [displayConfirm, setDisplayConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmType, setConfirmType] = useState("");
  const { theme, setTheme } = useUser();
  const [current, setCurrent] = useState(0);
  const deleteAccount = useDelete();
  const { logoutAllDevices } = useLogout();
  const exportData = useExport();

  const confirmAction = () => {
    if (confirmType === "deleteAccount") {
      deleteAccount();
      onClose();
    } else if (confirmType === "logoutAllDevices") {
      logoutAllDevices();
      onClose();
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
        <div className="settings-header">
          <p className="settings-title">Settings</p>
          <button className="settings-close-button" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        <hr className="settings-divider" />
        <div className="settings-container">
          <div className="settings-sidebar">
            <button
              className={`settings-sidebar-item ${current === 0 ? "active" : ""}`}
              onClick={() => setCurrent(0)}
            >
              <i className="bi bi-gear"></i>General
            </button>
            <button
              className={`settings-sidebar-item ${current === 1 ? "active" : ""}`}
              onClick={() => setCurrent(1)}
            >
              <i className="bi bi-database"></i>Data
            </button>
            <button
              className={`settings-sidebar-item ${current === 2 ? "active" : ""}`}
              onClick={() => setCurrent(2)}
            >
              <i className="bi bi-shield-shaded"></i>Security
            </button>
          </div>
          <div className="settings">
            {current === 0 && (
              <div className="setting-item">
                <label htmlFor="theme">Theme</label>
                <select
                  id="theme"
                  className="setting-input"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            )}
            {current === 1 && (
              <div className="setting-item">
                <label htmlFor="delete-doc">Export Data</label>
                <button className="download-doc" onClick={() => exportData()}>
                  Export
                </button>
              </div>
            )}
            {current === 1 && (
              <div className="setting-item">
                <label htmlFor="delete-doc">Delete Account</label>
                <button
                  className="delete-doc"
                  onClick={() =>
                    showConfirm(
                      "deleteAccount",
                      "Are you sure you want to delete your account?"
                    )
                  }
                >
                  Delete
                </button>
              </div>
            )}
            {current === 2 && (
              <div className="setting-item">
                <label htmlFor="upload-doc">Logout of All Devices</label>
                <button
                  className="upload-doc"
                  onClick={() =>
                    showConfirm(
                      "logoutAllDevices",
                      "Are you sure you want to logout of all devices?"
                    )
                  }
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
