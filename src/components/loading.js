import React, { useState, useEffect } from 'react';
import '../style/Loading.css';

const Loading = ({ isLoading }) => {
  const [loadingPercentage, setLoadingPercentage] = useState(0);

  useEffect(() => {
    let percentageInterval;

    if (isLoading) {
      setLoadingPercentage(0); // Reset percentage when loading starts

      percentageInterval = setInterval(() => {
        setLoadingPercentage((prev) => {
          if (prev >= 100) {
            clearInterval(percentageInterval);
            return 100; // Ensure it reaches 100%
          }
          return prev + 1; // Increment percentage
        });
      }, 50); // Adjust speed
    }

    return () => clearInterval(percentageInterval); // Cleanup on unmount
  }, [isLoading]);

  return isLoading ? (
    <div className="loading-wrapper">
      <div className="loading-container">
        <div className="loading-circle"></div>
        <div className="loading-percentage">{loadingPercentage}%</div>
      </div>
    </div>
  ) : null;
};

export default Loading;
