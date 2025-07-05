import React from 'react';
import { detectLocation } from '../services/locationService';

const LocationDetector = ({ onLocationDetected, setLoading, setError }) => {
  const handleDetectLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const location = await detectLocation();
      onLocationDetected(location);
    } catch (error) {
      setError("Couldn't detect your location. Try entering it manually!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDetectLocation} className="primary-button">
      Roast Me! 🔥
    </button>
  );
};

export default LocationDetector;
