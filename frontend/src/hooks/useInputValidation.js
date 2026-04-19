import { useState } from 'react';

/**
 * A custom hook for input validation
 * @param {string} initialValue - Initial value for the input
 * @param {Function} validationFn - Optional validation function that returns error message
 * @returns {Object} - { value, error, changeHandler, reset, setError }
 */
export const useInputValidation = (initialValue = '', validationFn = null) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  
  const changeHandler = (e) => {
    const inputValue = e.target ? e.target.value : e;
    setValue(inputValue);
    
    if (validationFn) {
      const validationError = validationFn(inputValue);
      setError(validationError || '');
    }
  };
  
  const reset = () => {
    setValue(initialValue);
    setError('');
  };
  
  return {
    value,
    error,
    changeHandler,
    reset,
    setError,
    setValue
  };
}; 