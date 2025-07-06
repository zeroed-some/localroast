// src/App.js - Complete working app with fixes
import React, { useState } from 'react';
import './App.css';
import { getRoastsForLocation } from './services/roastService';

function App() {
  const [location, setLocation] = useState(null);
  const [locationObj, setLocationObj] = useState(null); // Store the structured object separately
  const [currentRoast, setCurrentRoast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');

  const detectLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try IP geolocation first (more reliable for getting city/state names)
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Build location object from API response
        const locationObj = {
          city: data.city || null,
          state: data.region || null,
          country: data.country_name || null
        };
        
        // Create display string
        let locationStr = '';
        if (data.city) {
          locationStr = data.city;
          if (data.region) {
            locationStr += `, ${data.region}`;
          }
          if (data.country_name) {
            locationStr += `, ${data.country_name}`;
          }
        } else if (data.region) {
          locationStr = data.region;
          if (data.country_name) {
            locationStr += `, ${data.country_name}`;
          }
        } else if (data.country_name) {
          locationStr = data.country_name;
        }
        
        setLocation(locationStr || 'Unknown');
        setLocationObj(locationObj); // Store the structured object
        handleLocationFound(locationObj);
      } catch (err) {
        setError("Couldn't detect location. Try entering manually!");
        setLoading(false);
      }
    } catch (err) {
      setError("Couldn't detect location. Try entering manually!");
      setLoading(false);
    }
  };

  const handleLocationFound = (loc) => {
    // Parse the location string if needed
    let parsedLocationObj = { city: null, state: null, country: null };
    
    if (typeof loc === 'string') {
      // If it's a string, try to parse it
      const parts = loc.split(',').map(p => p.trim());
      
      if (parts.length === 1) {
        // Could be city, state, or country
        parsedLocationObj.city = parts[0];
      } else if (parts.length === 2) {
        // Likely "City, State" or "City, Country"
        parsedLocationObj.city = parts[0];
        parsedLocationObj.state = parts[1];
      } else if (parts.length >= 3) {
        // "City, State, Country" format
        parsedLocationObj.city = parts[0];
        parsedLocationObj.state = parts[1];
        parsedLocationObj.country = parts[2];
      }
    } else if (typeof loc === 'object') {
      // If it's already an object, use it directly
      parsedLocationObj = loc;
    }
    
    // Store the parsed object for reuse
    setLocationObj(parsedLocationObj);
    
    // Get roasts using the service
    const roasts = getRoastsForLocation(parsedLocationObj);
    
    if (roasts.length > 0) {
      const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
      setCurrentRoast(randomRoast);
    } else {
      setCurrentRoast("Your location is so irrelevant, even our roast database gave up.");
    }
    
    setLoading(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      const inputLocation = manualInput.trim();
      setLocation(inputLocation);
      handleLocationFound(inputLocation);
      setManualInput('');
    }
  };

  const getAnotherRoast = () => {
    if (locationObj) {
      // Use the stored location object instead of parsing the display string
      const roasts = getRoastsForLocation(locationObj);
      if (roasts.length > 0) {
        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
        setCurrentRoast(randomRoast);
      }
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="logo">🔥</div>
        <h1>LocalRoast</h1>
        <p className="subtitle">Get absolutely torched based on where you're from</p>
        
        <div className="roast-box">
          {loading ? (
            <div className="loading"></div>
          ) : currentRoast ? (
            <p className="roast-text">{currentRoast}</p>
          ) : (
            <p className="roast-text">
              Ready to get roasted? Hit the button if you can handle it...
            </p>
          )}
        </div>
        
        {location && (
          <div className="location-display">📍 {location}</div>
        )}
        
        {!currentRoast && !loading && (
          <button onClick={detectLocation} className="primary-button">
            Roast Me! 🔥
          </button>
        )}
        
        {currentRoast && (
          <div className="button-group">
            <button onClick={getAnotherRoast} className="primary-button">
              Hit me again! 😤
            </button>
          </div>
        )}
        
        <div className="manual-input">
          <p>Can't detect location? Enter it manually:</p>
          <form onSubmit={handleManualSubmit}>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter city or region"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !manualInput.trim()}>
              Roast! 🎯
            </button>
          </form>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <div className="footer">
          <p>Made with 🔥 and tears | Not responsible for hurt feelings</p>
        </div>
      </div>
    </div>
  );
}

export default App;