import React from 'react';
import { useAlerts } from '../context/alertscontext';
import { createPortal } from 'react-dom';
import '../styles/alerts.css';

const Alerts = () => {
  const { alerts } = useAlerts();

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

  // Render alerts through a portal
  return createPortal(
    <div className='alerts'>
      {alerts.map((alert) => (
        <div key={alert.id} className={getAlertClass(alert.type)}>
          {getAlertIcon(alert.type)}
          <span>{alert.message}</span>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default Alerts;