import React, { createContext, useState, useContext, useCallback } from "react";

const AlertContext = createContext();

export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((message, type = "info", timeout = 3000) => {
    setAlerts((prevAlerts) => {
      if (prevAlerts.some((alert) => alert.message === message)) {
        return prevAlerts;
      }

      const id = Date.now();
      const newAlert = { id, message, type };

      setTimeout(() => {
        setAlerts((currentAlerts) =>
          currentAlerts.filter((alert) => alert.id !== id)
        );
      }, timeout);

      return [...prevAlerts, newAlert];
    });
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ addAlert, removeAlert, alerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);
