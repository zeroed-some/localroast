import React, { useState } from 'react';

const ManualLocationInput = ({ onLocationSubmit, disabled }) => {
  const [input, setInput] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const location = input.trim();
    
    if (location) {
      // Parse the input - could be "City", "City, State", or "City, Country"
      const parts = location.split(',').map(p => p.trim());
      
      onLocationSubmit({
        city: parts[0],
        state: parts[1] || null,
        country: parts[2] || null
      });
      
      setInput('');
    }
  };
  
  return (
    <div className="manual-input">
      <p>Can't detect location? Enter it manually:</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter city or region"
          disabled={disabled}
        />
        <button type="submit" disabled={disabled || !input.trim()}>
          Roast! 🎯
        </button>
      </form>
    </div>
  );
};

export default ManualLocationInput;
