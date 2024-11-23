import React, { useState, useEffect } from "react";
import "../styles/settings.css";
import { firestore } from "../config/firebase-config";
import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, updateDoc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Confirm from "../components/confirm";
import { useAlerts } from "../context/alertscontext";
import { useUser } from "../context/usercontext";
import { useTheme } from "../context/themecontext";

const Settings = ({ onClose }) => {
  const auth = getAuth();
  const functions = getFunctions();
  const [displayConfirm, setDisplayConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmType, setConfirmType] = useState("");
  const { addAlert } = useAlerts();
  const { user, premiumInfo, setUser } = useUser();
  const { theme, changeTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setNotifications(userData.notifications || true);
          }
        })
        .catch((error) => {
          console.error("Error fetching user theme data:", error);
        });
    }
  }, [user]);

  const deleteUserData = async () => {
    if (user) {
      try {
        const userRef = doc(firestore, "users", user.uid);
        await updateDoc(userRef, {
          completedProblems: {},
          completedQuizzes: {},
          notifications: true,
          theme: "system",
        });
        addAlert("Completed problems deleted successfully.", "success");
        window.location.reload();
      } catch (error) {
        addAlert("Error deleting data.", "error");
        console.error("Error deleting completed problems: ", error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(firestore, "users", currentUser.uid);
        await deleteDoc(userRef);

        await currentUser.delete();

        handleCancelSubscription();
        onClose();
      } catch (error) {
        if (error.code === "auth/requires-recent-login") {
          addAlert("Please re-authenticate and try again.", "warning");
        } else {
          addAlert("Error deleting account.", "error");
          console.error("Error deleting account:", error);
        }
      }
    }
  };

  const handleCancelSubscription = async () => {
    if (!premiumInfo.subscriptionId) {
      return;
    }

    const cancelSubscription = httpsCallable(functions, "cancelSubscription");

    try {
      const result = await cancelSubscription({
        subscriptionId: premiumInfo.subscriptionId,
        uid: user.uid,
      });
      if (result.data.status === "success") {
        console.log("Subscription canceled successfully.");
      } else {
        console.error("Failed to cancel subscription.");
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
  };

  const confirmAction = () => {
    if (confirmType === "deleteData") {
      deleteUserData();
    } else if (confirmType === "deleteAccount") {
      handleDeleteAccount();
    } else if (confirmType === "logoutAllDevices") {
      logoutAllDevices();
      setUser(null);
      onClose();
    }
    setDisplayConfirm(false);
  };

  const showConfirm = (type, message) => {
    setConfirmType(type);
    setConfirmMessage(message);
    setDisplayConfirm(true);
  };

  const exportData = async () => {
    if (!user) {
      return;
    }

    try {
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const { premiumInfo, ...filteredData } = userData;
        const dataStr = JSON.stringify(filteredData, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = "userData.json";
        a.click();

        URL.revokeObjectURL(url);
      } else {
        addAlert("No data available for download.", "warning");
      }
    } catch (error) {
      console.error("Error downloading data:", error);
      addAlert("Error downloading data.", "error");
    }
  };

  const importData = async (data) => {
    if (!user) return;

    const validThemes = ["system", "dark", "light"];
    const sanitizedData = {};

    if (
      data.completedProblems &&
      typeof data.completedProblems === "object" &&
      !Array.isArray(data.completedProblems)
    ) {
      sanitizedData.completedProblems = data.completedProblems;
    }

    if (
      data.completedQuizzes &&
      typeof data.completedQuizzes === "object" &&
      !Array.isArray(data.completedQuizzes)
    ) {
      sanitizedData.completedQuizzes = data.completedQuizzes;
    }

    if (data.theme && validThemes.includes(data.theme)) {
      sanitizedData.theme = data.theme;
    }

    if (Object.keys(sanitizedData).length > 0) {
      try {
        const userRef = doc(firestore, "users", user.uid);
        await setDoc(userRef, sanitizedData, { merge: true });
        addAlert("Data uploaded successfully", "success");
      } catch (error) {
        console.error("Error uploading data:", error);
        addAlert("Error uploading data", "error");
      }
    } else {
      addAlert("No valid data to upload", "warning");
    }
  };

  const logoutAllDevices = async () => {
    const functions = getFunctions();

    try {
      const logoutAll = httpsCallable(functions, "logoutAllDevices");
      await logoutAll();
      addAlert("Logged out of all devices.", "success");
    } catch (error) {
      console.error("Error logging out of all devices:", error);
      addAlert("Error logging out of all devices.", "error");
    }
  };

  const changeNotifications = async (value) => {
    if (!user) return;

    try {
      setNotifications(value);
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        notifications: value,
      });
    } catch (error) {
      console.error("Error updating notifications:", error);
      addAlert("Error updating notifications.", "error");
    }
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
                  onChange={(e) => changeTheme(e.target.value)}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            )}
            {current === 0 && (
              <div className="setting-item">
                <label htmlFor="emails">Notifications</label>
                <select
                  id="emails"
                  className="setting-input"
                  value={notifications}
                  onChange={(e) => changeNotifications(e.target.value)}
                >
                  <option value={true}>Emails</option>
                  <option value={false}>None</option>
                </select>
              </div>
            )}
            {current === 1 && (
              <div className="setting-item">
                <label htmlFor="upload-doc">Import Data</label>
                <input
                  type="file"
                  accept=".json"
                  id="upload-doc"
                  style={{ display: "none" }}
                  onChange={async (event) => {
                    const file = event.target.files[0];
                    if (!file) return;

                    try {
                      const text = await file.text();
                      const parsedData = JSON.parse(text);

                      const dataToUpload = {
                        completedProblems: parsedData.completedProblems,
                        completedQuizzes: parsedData.completedQuizzes,
                        theme: parsedData.theme,
                      };

                      importData(dataToUpload);
                    } catch (error) {
                      console.error(
                        "Error reading or parsing the JSON file:",
                        error
                      );
                      addAlert("Invalid JSON file.", "error");
                    }
                  }}
                />
                <button
                  className="upload-doc"
                  onClick={() => document.getElementById("upload-doc").click()}
                >
                  Import
                </button>
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
                <label htmlFor="delete-doc">Delete Data</label>
                <button
                  className="delete-doc"
                  onClick={() =>
                    showConfirm(
                      "deleteData",
                      "Are you sure you want to delete all your data?"
                    )
                  }
                >
                  Delete
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
