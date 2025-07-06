import { roastDatabase } from '../data/roastDatabase';

export const getRoastsForLocation = (location) => {
  if (!location) return [];
  
  let roasts = [];
  const { city, state, country } = location;
  
  // Normalize location names - convert spaces to underscores and lowercase
  const normalizeString = (str) => str?.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
  
  const cityNormalized = normalizeString(city);
  const stateNormalized = normalizeString(state);
  const countryNormalized = normalizeString(country);
  
  // If only city is provided, search through all states/countries for this city
  if (cityNormalized && !stateNormalized && !countryNormalized) {
    for (const [regionKey, regionData] of Object.entries(roastDatabase)) {
      // Skip the 'default' entry
      if (regionKey === 'default') continue;
      
      // Check if this region has the city
      if (regionData[cityNormalized]) {
        roasts = roasts.concat(regionData[cityNormalized]);
        // Also add some generic roasts from the parent region
        if (regionData.generic) {
          roasts = roasts.concat(regionData.generic.slice(0, 2)); // Add a couple generic ones
        }
        break; // Found the city, stop searching
      }
    }
  }
  
  // If we have state/country info, use it for more specific matching
  if (stateNormalized && roastDatabase[stateNormalized]) {
    // Check for city-specific roasts within the state
    if (cityNormalized && roastDatabase[stateNormalized][cityNormalized]) {
      roasts = roasts.concat(roastDatabase[stateNormalized][cityNormalized]);
    }
    // Add state generic roasts
    if (roastDatabase[stateNormalized].generic) {
      roasts = roasts.concat(roastDatabase[stateNormalized].generic);
    }
  }
  
  // Check for country roasts
  if (countryNormalized) {
    const countryMappings = {
      'united_states': 'usa',
      'united_states_of_america': 'usa',
      'us': 'usa',
      'america': 'usa',
      'united_kingdom': 'uk',
      'great_britain': 'uk',
      'england': 'uk',
      'scotland': 'uk',
      'wales': 'uk',
      'northern_ireland': 'uk'
    };
    
    const countryKey = countryMappings[countryNormalized] || countryNormalized;
    if (roastDatabase[countryKey]?.generic) {
      roasts = roasts.concat(roastDatabase[countryKey].generic);
    }
  }
  
  // Special handling for common state abbreviations
  const stateAbbreviations = {
    'ny': 'newyork',
    'nyc': 'newyork',
    'ca': 'california',
    'tx': 'texas',
    'fl': 'florida',
    'il': 'illinois',
    'pa': 'pennsylvania',
    'oh': 'ohio',
    'mi': 'michigan',
    'ga': 'georgia',
    'nc': 'north_carolina',
    'va': 'virginia',
    'ma': 'massachusetts',
    'az': 'arizona',
    'wa': 'washington',
    'co': 'colorado',
    'or': 'oregon',
    'nv': 'nevada',
    'la': 'louisiana',
    'wi': 'wisconsin'
  };
  
  // If no roasts found yet, check if the input matches a state abbreviation
  if (roasts.length === 0 && cityNormalized) {
    const stateKey = stateAbbreviations[cityNormalized];
    if (stateKey && roastDatabase[stateKey]?.generic) {
      roasts = roasts.concat(roastDatabase[stateKey].generic);
    }
  }
  
  // If still no roasts, check if the city input might actually be a state name
  if (roasts.length === 0 && cityNormalized && roastDatabase[cityNormalized]?.generic) {
    roasts = roasts.concat(roastDatabase[cityNormalized].generic);
  }
  
  // If no specific roasts found, use defaults
  if (roasts.length === 0) {
    roasts = roastDatabase.default || [];
  }
  
  // Remove duplicates
  return [...new Set(roasts)];
};