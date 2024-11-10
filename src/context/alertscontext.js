import React, { createContext, useState, useContext, useCallback } from 'react';

// Create a context for managing alerts
const AlertContext = createContext();

// Alerts provider component to wrap your app
export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Function to add a new alert to the stack, memoized with useCallback
  const addAlert = useCallback((message, type = 'info', timeout = 3000) => {
    setAlerts((prevAlerts) => {
      // Check if an alert with the same message already exists
      if (prevAlerts.some(alert => alert.message === message)) {
        return prevAlerts; // Do not add duplicate alerts
      }

      const id = Date.now();
      const newAlert = { id, message, type };

      // Automatically remove the alert after a given timeout
      setTimeout(() => {
        setAlerts((currentAlerts) => currentAlerts.filter(alert => alert.id !== id));
      }, timeout);

      return [...prevAlerts, newAlert];
    });
  }, []);

  // Function to remove an alert manually by its ID
  const removeAlert = useCallback((id) => {
    setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ addAlert, removeAlert, alerts }}>
      {children}
    </AlertContext.Provider>
  );
};

// Hook to use the alert context
export const useAlerts = () => useContext(AlertContext);