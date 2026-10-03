import React from 'react';
import './LoadingSpinner.css'; // Let's inline the CSS or create it next

const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>
      <span className="loading-text">Gemma is thinking...</span>
    </div>
  );
};

export default LoadingSpinner;
