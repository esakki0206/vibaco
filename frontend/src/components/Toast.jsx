import React, { useEffect } from 'react';
import { IoClose, IoCheckmarkCircle, IoErrorCircle, IoInformationCircle, IoWarning } from 'react-icons/io5';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <IoCheckmarkCircle className="toast-icon text-success" />,
    error: <IoErrorCircle className="toast-icon text-danger" />,
    info: <IoInformationCircle className="toast-icon text-info" />,
    warning: <IoWarning className="toast-icon text-warning" />,
  };

  return (
    <div className={`toast toast-${type} show`}>
      <div className="toast-content">
        {icons[type]}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>
        <IoClose />
      </button>
    </div>
  );
};

export default Toast;
