import { roastDatabase } from '../data/roastDatabase';

export const getRoastsForLocation = (location) => {
  if (!location) return [];
  
  let roasts = [];
  const { city, state, country } = location;
  
  // Normalize location names
  const cityLower = city?.toLowerCase().replace(/\s+/g, '_');
  const stateLower = state?.toLowerCase().replace(/\s+/g, '_');
  const countryLower = country?.toLowerCase().replace(/\s+/g, '_');
  
  // Check for city-specific roasts
  if (cityLower) {
    // Look through all states for this city
    for (const [stateKey, stateData] of Object.entries(roastDatabase)) {
      if (stateData[cityLower]) {
        roasts = roasts.concat(stateData[cityLower]);
      }
    }
  }
  
  // Check for state/region roasts
  if (stateLower && roastDatabase[stateLower]?.generic) {
    roasts = roasts.concat(roastDatabase[stateLower].generic);
  }
  
  // Check for country roasts
  if (countryLower) {
    const countryMappings = {
      'united_states': 'usa',
      'united_states_of_america': 'usa',
      'us': 'usa',
      'united_kingdom': 'uk',
      'great_britain': 'uk',
      'england': 'uk',
      'scotland': 'uk',
      'wales': 'uk',
      'northern_ireland': 'uk'
    };
    
    const countryKey = countryMappings[countryLower] || countryLower;
    if (roastDatabase[countryKey]?.generic) {
      roasts = roasts.concat(roastDatabase[countryKey].generic);
    }
  }
  
  // If no specific roasts found, use defaults
  if (roasts.length === 0) {
    roasts = roastDatabase.default || [];
  }
  
  // Remove duplicates
  return [...new Set(roasts)];
};