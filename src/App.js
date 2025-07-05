// src/App.js - Complete working app in one file for quick testing
import React, { useState } from 'react';
import './App.css';

// Mini roast database for testing
const roastDatabase = {
  'New York': [
    "NYC? Let me guess, you've mentioned you're from New York within 5 minutes of every conversation you've ever had.",
    "From NYC? Cool, how's that superiority complex and vitamin D deficiency working out?",
    "New York City: Where everyone walks fast to nowhere important and calls it ambition."
  ],
  'California': [
    "California? How's that $8 gas and $15 avocado toast treating you?",
    "Oh, you're from California? Which wellness trend are you pretending changed your life this week?",
    "California: Come for the weather, stay because you can't afford to leave."
  ],
  'Texas': [
    "Texas? Everything's bigger there, especially the egos and the power grid failures.",
    "From Texas? Let me guess, you've already mentioned how big your state is three times today.",
    "Texas: Where 105°F is 'nice weather' and a light dusting of snow shuts down civilization."
  ],
  'Virginia': [
    "Virginia? The state that can't decide if it's the South or just South of Maryland.",
    "From Virginia? Home of 'Virginia is for Lovers' - because you need a slogan when you have no personality.",
    "Virginia: Where Northern Virginia pretends it's DC and the rest pretends it's still 1865.",
    "Oh, Virginia? The state whose biggest achievement is being close to somewhere important.",
    "Virginia: Where everyone works for the government but swears they're a 'small government conservative'."
  ],
  'default': [
    "Your location is so irrelevant, even Google Maps just shrugs.",
    "From there? I'd roast your hometown but it would require me to care about it first.",
    "Your area is so forgettable, even this roast generator had nothing prepared."
  ]
};

function App() {
  const [location, setLocation] = useState(null);
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
        
        // Build location string from most specific to least specific
        let locationStr = '';
        if (data.city) {
          locationStr = data.city;
          if (data.region) {
            locationStr = data.region; // Use state/region as primary identifier
          }
        } else if (data.region) {
          locationStr = data.region;
        } else if (data.country_name) {
          locationStr = data.country_name;
        }
        
        handleLocationFound(locationStr || 'Unknown');
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
    setLocation(loc);
    
    // Normalize the location for database lookup
    const normalizedLoc = loc.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Try exact match first, then try just the first word (for "Los Angeles, California" -> "California")
    let roasts = roastDatabase[normalizedLoc];
    
    if (!roasts && loc.includes(',')) {
      // Try the state/country part after the comma
      const parts = loc.split(',');
      const statePart = parts[1].trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      roasts = roastDatabase[statePart];
    }
    
    if (!roasts) {
      // Try some common variations
      const variations = {
        'Ny': 'New York',
        'Nyc': 'New York',
        'La': 'California',
        'Los Angeles': 'California',
        'San Francisco': 'California',
        'Sf': 'California',
        'Tx': 'Texas',
        'Va': 'Virginia',
        'Cali': 'California'
      };
      
      const variation = variations[normalizedLoc];
      if (variation) {
        roasts = roastDatabase[variation];
      }
    }
    
    // Default to generic roasts if nothing found
    roasts = roasts || roastDatabase.default;
    
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    setCurrentRoast(randomRoast);
    setLoading(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleLocationFound(manualInput.trim());
      setManualInput('');
    }
  };

  const getAnotherRoast = () => {
    if (location) {
      const roasts = roastDatabase[location] || roastDatabase.default;
      const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
      setCurrentRoast(randomRoast);
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