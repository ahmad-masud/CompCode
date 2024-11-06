import React, { createContext, useState, useContext, useCallback } from 'react';

// Create a context for managing alerts
const AlertContext = createContext();

// Alerts provider component to wrap your app
export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Function to add a new alert to the stack, memoized with useCallback
  const addAlert = useCallback((message, type = 'info', timeout = 3000) => {
    const id = Date.now();
    setAlerts((prevAlerts) => [...prevAlerts, { id, message, type }]);

    // Automatically remove the alert after a given timeout
    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== id));
    }, timeout);
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