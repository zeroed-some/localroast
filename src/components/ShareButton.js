import React, { useState } from 'react';

const ShareButton = ({ roast, location }) => {
  const [copied, setCopied] = useState(false);
  
  const getLocationString = () => {
    if (!location) return 'somewhere';
    return location.city || location.state || location.country || 'somewhere';
  };
  
  const shareRoast = async () => {
    const text = `I just got roasted by LocalRoast! 🔥\n\n"${roast}"\n\nFrom: ${getLocationString()}\n\nGet roasted at localroast.lol`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LocalRoast',
          text: text
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };
  
  return (
    <button onClick={shareRoast} className="share-button">
      {copied ? 'Copied! 📋' : 'Share this burn 📤'}
    </button>
  );
};

export default ShareButton;
