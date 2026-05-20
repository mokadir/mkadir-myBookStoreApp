import React from 'react';

/**
 * Reusable loading spinner component
 */
const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeMap = { small: '20px', medium: '40px', large: '60px' };
  const spinnerSize = sizeMap[size] || sizeMap.medium;

  return (
    <div className="loading-spinner-container">
      <div
        className="loading-spinner"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `3px solid var(--border-color)`,
          borderTop: `3px solid var(--primary-color)`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;