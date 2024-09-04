import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loading from './loading'; // Import your Loading component

const PageLoaderWrapper = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true); // Start loading on route change

    // Simulate a page load time (e.g., when fetching data or waiting for route to complete)
    const timer = setTimeout(() => {
      setIsLoading(false); // End loading when page has loaded
    }, 3000); // Simulate 3-second load, adjust accordingly

    return () => clearTimeout(timer); // Clean up on route change
  }, [location]);

  return (
    <>
      <Loading isLoading={isLoading} />
      {!isLoading && children} {/* Render content only after loading is done */}
    </>
  );
};

export default PageLoaderWrapper;
