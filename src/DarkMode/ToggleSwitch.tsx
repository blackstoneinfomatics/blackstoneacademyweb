

import React from 'react';
import { useDarkMode } from './DarkModeContext';

const ToggleSwitch = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        darkMode ? 'bg-gray-700 focus:ring-gray-500' : 'bg-gray-300 focus:ring-gray-400'
      }`}
      onClick={toggleDarkMode}
      aria-label={`Toggle ${darkMode ? 'light' : 'dark'} mode`}
    >
      <div
        className={`h-6 w-6 rounded-full shadow-md transform transition-transform ${
          darkMode ? 'bg-white translate-x-6' : 'bg-gray-800'
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;