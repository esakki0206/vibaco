import React from 'react';

const Loading = ({ isLoading, children, text = 'Loading...', variant = 'circle' }) => {
  if (!isLoading) return children || null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        {variant === 'circle' && <div className="spinner"></div>}
        {variant === 'dots' && (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        {variant === 'skeleton' && <div className="skeleton-placeholder"></div>}
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
};

export default Loading;
