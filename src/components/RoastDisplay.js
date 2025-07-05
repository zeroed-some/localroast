import React from 'react';

const RoastDisplay = ({ roast, location, loading }) => {
  const getLocationString = () => {
    if (!location) return '';
    
    let parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    return parts.join(', ');
  };

  return (
    <>
      <div className="roast-box">
        {loading ? (
          <div className="loading-spinner">
            <span className="loading"></span>
          </div>
        ) : roast ? (
          <p className="roast-text">{roast}</p>
        ) : (
          <p className="roast-text">
            Ready to get roasted? Hit the button if you can handle it...
          </p>
        )}
      </div>
      
      {location && (
        <div className="location-display">
          📍 {getLocationString()}
        </div>
      )}
    </>
  );
};

export default RoastDisplay;