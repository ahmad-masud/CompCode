import React from 'react';
import { useAlerts } from '../context/alertscontext';
import '../styles/alerts.css'; // Your CSS for alerts

const Alerts = () => {
  const { alerts } = useAlerts(); // Get alerts from context

  // Map alert types to FontAwesome icons and styles
  const getAlertIcon = (type) => {
    switch (type) {
      case 'success':
        return <i className="fa-solid fa-check-circle"></i>;
      case 'warning':
        return <i className="fa-solid fa-exclamation-triangle"></i>;
      case 'error':
        return <i className="fa-solid fa-circle-exclamation"></i>;
      default:
        return <i className="fa-solid fa-info-circle"></i>;
    }
  };

  const getAlertClass = (type) => {
    switch (type) {
      case 'success':
        return 'alert alert-success';
      case 'warning':
        return 'alert alert-warning';
      case 'error':
        return 'alert alert-error';
      default:
        return 'alert alert-info';
    }
  };

  return (
    <div className='alerts'>
      {alerts.map((alert) => (
        <div key={alert.id} className={getAlertClass(alert.type)}>
          {getAlertIcon(alert.type)}
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Alerts;