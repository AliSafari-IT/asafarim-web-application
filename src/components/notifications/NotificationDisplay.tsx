import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import './NotificationDisplay.css';

const NotificationDisplay: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            {notification.action && (
              <button
                className="notification-action"
                onClick={notification.action.onClick}
              >
                {notification.action.label}
              </button>
            )}
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationDisplay;
