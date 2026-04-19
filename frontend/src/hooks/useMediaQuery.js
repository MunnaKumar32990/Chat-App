import { useState, useEffect } from 'react';

/**
 * A hook that returns true if the provided media query matches
 * 
 * @param {string} query - The media query to check
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Create a media query list
    const mediaQuery = window.matchMedia(query);
    
    // Update the state with the current value
    setMatches(mediaQuery.matches);
    
    // Create an event listener
    const handler = (event) => setMatches(event.matches);
    
    // Add the listener to the media query
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Older browsers support
      mediaQuery.addListener(handler);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Older browsers support
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);
  
  return matches;
} 