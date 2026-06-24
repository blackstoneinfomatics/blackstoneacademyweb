'use client';

import React, { useEffect } from 'react';
type Props = {
  readonly onClose: () => void;
  readonly title: string;
}
const SuccessPopup = ({ onClose ,title }: Props) => {
     useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 text-center dark:bg-[#1D1D1D]">
        <div className="flex justify-center mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2 dark:text-white">{title} Added</h2>
        <p className="text-gray-600 mb-6 text-sm dark:text-white">{title} added Successfully!</p>
         <div className="w-32 h-1 bg-green-800 my-6  rounded-full mx-auto"></div>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-[#576CBC] text-white rounded-md hover:bg-blue-700 transition-colors w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;