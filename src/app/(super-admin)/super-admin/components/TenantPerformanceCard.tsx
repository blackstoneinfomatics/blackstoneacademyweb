"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect } from "react";

const percentage = 92;

export default function PerformanceCard() {
  // State to track if dark mode is active
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Function to check if dark mode is active
    const checkDarkMode = () => {
      // Checks if the <html> or <body> has the 'dark' class (Tailwind standard)
      const isDark = document.documentElement.classList.contains('dark') || 
                     document.body.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Check on mount
    checkDarkMode();

    // Create a MutationObserver to watch for class changes on the html tag
    // This ensures it updates instantly when you toggle the theme
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white dark:bg-[#343434] rounded-2xl shadow-sm p-4 h-[342px] border border-transparent dark:border-gray-700/50 transition-colors">

      {/* Header */}
      <h2 className="text-[22px] font-semibold text-[#1E293B] dark:text-white">
        Performance
      </h2>

      {/* Circle */}
      <div className="w-[150px] h-[150px] mx-auto mt-4">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textSize: "18px",
            pathColor: "#16A34A",
            trailColor: "#DFF5E8",
            // DYNAMIC TEXT COLOR BASED ON STATE
            textColor: isDarkMode ? "#FFFFFF" : "#111827", 
            strokeLinecap: "round",
          })}
        />
      </div>

      {/* Badge */}
      <div className="flex justify-center mt-5">
        <span className="bg-[#DDF8E8] dark:bg-[#1D3A2A] text-[#16A34A] dark:text-[#4ADE80] text-[16px] font-semibold px-3 py-1 rounded-md transition-colors">
          Excellent
        </span>
      </div>

      {/* Message */}
      <p className="text-center text-[16px] text-[#374151] dark:text-gray-300 mt-5 transition-colors">
        Your tenant is performing great
      </p>

    </div>
  );
}