// src/services/locationService.js
import axios from 'axios';

// API keys from environment variables (optional)
const IPAPI_KEY = process.env.REACT_APP_IPAPI_KEY;
const OPENCAGE_KEY = process.env.REACT_APP_OPENCAGE_KEY;

/**
 * Detect user's location using IP geolocation
 * Uses ipapi.co free tier (no API key required for limited requests)
 */
export const detectLocationByIP = async () => {
  try {
    // ipapi.co free tier - 1000 requests per day without API key
    const response = await axios.get('https://ipapi.co/json/');
    
    return {
      city: response.data.city,
      state: response.data.region,
      country: response.data.country_name,
      countryCode: response.data.country_code,
      latitude: response.data.latitude,
      longitude: response.data.longitude,
      ip: response.data.ip
    };
  } catch (error) {
    console.error('IP geolocation failed:', error);
    
    // Fallback to another free service
    try {
      const fallbackResponse = await axios.get('https://api.ipify.org?format=json');
      const ip = fallbackResponse.data.ip;
      
      // Try ip-api.com as fallback (free, no key needed)
      const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);
      
      return {
        city: geoResponse.data.city,
        state: geoResponse.data.regionName,
        country: geoResponse.data.country,
        countryCode: geoResponse.data.countryCode,
        latitude: geoResponse.data.lat,
        longitude: geoResponse.data.lon,
        ip: ip
      };
    } catch (fallbackError) {
      console.error('Fallback IP geolocation also failed:', fallbackError);
      throw new Error('Unable to detect location by IP');
    }
  }
};

/**
 * Reverse geocode coordinates to get location details
 * @param {number} latitude 
 * @param {number} longitude 
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    // If we have an OpenCage API key, use it for better accuracy
    if (OPENCAGE_KEY) {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_KEY}`
      );
      
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const components = result.components;
        
        return {
          city: components.city || components.town || components.village || components.municipality,
          state: components.state || components.county || components.state_district,
          country: components.country,
          countryCode: components.country_code?.toUpperCase(),
          latitude,
          longitude,
          formatted: result.formatted
        };
      }
    }
    
    // Fallback: Use Nominatim (OpenStreetMap) - free, no key required
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'LocalRoast/1.0' // Required by Nominatim
        }
      }
    );
    
    const address = response.data.address;
    
    return {
      city: address.city || address.town || address.village || address.municipality,
      state: address.state || address.county || address.state_district,
      country: address.country,
      countryCode: address.country_code?.toUpperCase(),
      latitude,
      longitude,
      formatted: response.data.display_name
    };
    
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    // If reverse geocoding fails, fall back to IP location
    return detectLocationByIP();
  }
};

/**
 * Main function to detect user location
 * Tries browser geolocation first, then falls back to IP
 */
export const detectLocation = async () => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Got coordinates, now reverse geocode them
            const location = await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            resolve(location);
          } catch (error) {
            // Reverse geocoding failed, try IP location
            try {
              const ipLocation = await detectLocationByIP();
              resolve(ipLocation);
            } catch (ipError) {
              reject(new Error('Unable to detect location'));
            }
          }
        },
        async (error) => {
          // User denied geolocation or it failed
          console.log('Browser geolocation failed:', error.message);
          
          // Fall back to IP geolocation
          try {
            const ipLocation = await detectLocationByIP();
            resolve(ipLocation);
          } catch (ipError) {
            reject(new Error('Unable to detect location'));
          }
        },
        {
          timeout: 5000, // 5 second timeout
          enableHighAccuracy: false // Don't need high accuracy for roasting
        }
      );
    } else {
      // Browser doesn't support geolocation, use IP
      detectLocationByIP()
        .then(resolve)
        .catch(() => reject(new Error('Unable to detect location')));
    }
  });
};

/**
 * Parse manual location input into structured format
 * @param {string} input - User's manual location input
 */
export const parseManualLocation = (input) => {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  // Split by commas and trim whitespace
  const parts = input.split(',').map(part => part.trim()).filter(Boolean);
  
  if (parts.length === 0) {
    return null;
  }
  
  // Try to intelligently parse the input
  let city, state, country;
  
  if (parts.length === 1) {
    // Could be city, state, or country
    const location = parts[0];
    
    // Check if it's a known state/country
    if (isKnownState(location) || isKnownCountry(location)) {
      if (isKnownCountry(location)) {
        country = location;
      } else {
        state = location;
        country = 'United States'; // Assume US for state names
      }
    } else {
      // Assume it's a city
      city = location;
    }
  } else if (parts.length === 2) {
    // Likely "City, State" or "City, Country"
    city = parts[0];
    
    if (isKnownCountry(parts[1])) {
      country = parts[1];
    } else {
      state = parts[1];
      // Assume US if state is provided without country
      country = 'United States';
    }
  } else if (parts.length >= 3) {
    // "City, State, Country" format
    city = parts[0];
    state = parts[1];
    country = parts[2];
  }
  
  return {
    city,
    state,
    country,
    formatted: input
  };
};

// Helper functions to identify known locations
const isKnownState = (location) => {
  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming',
    // Common abbreviations
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    // Canadian provinces
    'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba',
    'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland',
    'Prince Edward Island', 'Northwest Territories', 'Yukon', 'Nunavut'
  ];
  
  return states.some(state => 
    state.toLowerCase() === location.toLowerCase()
  );
};

const isKnownCountry = (location) => {
  const countries = [
    'United States', 'USA', 'US', 'America',
    'Canada', 'United Kingdom', 'UK', 'Britain', 'England',
    'Australia', 'New Zealand', 'Ireland', 'Scotland', 'Wales',
    'France', 'Germany', 'Spain', 'Italy', 'Netherlands',
    'Mexico', 'Brazil', 'Argentina', 'Japan', 'China', 'India'
  ];
  
  return countries.some(country => 
    country.toLowerCase() === location.toLowerCase()
  );
};

// Export all functions
export default {
  detectLocation,
  detectLocationByIP,
  reverseGeocode,
  parseManualLocation
};