"use client";
import React from "react";

const countriesData = [
  { name: "United States", flag: "/assets/images/flags/us.png", value: 110002, color: "#002c5f" },
  { name: "Germany", flag: "/assets/images/flags/germany.png", value: 103499, color: "#5b9bd5" },
  { name: "United Kingdom", flag: "/assets/images/flags/united-kingdom.png", value: 96998, color: "#002c5f" },
  { name: "England", flag: "/assets/images/flags/england.png", value: 89061, color: "#5b9bd5" },
  { name: "France", flag: "/assets/images/flags/france.png", value: 82000, color: "#002c5f" },
];

const EmployeeCountry = () => {
  const maxValue = Math.max(...countriesData.map((c) => c.value)); // Find max for scaling

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 w-[350px] h-[250px] flex flex-col justify-between">
      {/* Title */}
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Countries</h2>

      {/* List */}
      <div className="space-y-3 flex-1">
        {countriesData.map((country) => (
          <div key={country.name} className="flex items-center space-x-3">
            {/* Larger Flag & Name */}
            <div className="flex items-center space-x-3 w-[40%]">
              <img src={country.flag} alt={country.name} className="w-5 h-5 rounded-md shadow-md" />
              <span className="text-sm font-medium text-gray-700 truncate">{country.name}</span>
            </div>

            {/* Wider & Taller Progress Bar */}
            <div className="flex-1 h-3 bg-gray-200 rounded-lg overflow-hidden relative">
              <div
                className="h-3 rounded-lg absolute left-0 top-0"
                style={{
                  width: `${(country.value / maxValue) * 100}%`,
                  backgroundColor: country.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeCountry;
