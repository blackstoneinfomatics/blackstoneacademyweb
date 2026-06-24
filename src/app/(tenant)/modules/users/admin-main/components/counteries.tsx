"use client";

const countriesData = [
  {
    name: "United States",
    flag: "/assets/images/flags/us.png",
    value: 110002,
    color: "#002c5f",
  },
  {
    name: "Germany",
    flag: "/assets/images/flags/germany.png",
    value: 103499,
    color: "#5b9bd5",
  },
  {
    name: "United Kingdom",
    flag: "/assets/images/flags/united-kingdom.png",
    value: 96998,
    color: "#002c5f",
  },
  {
    name: "England",
    flag: "/assets/images/flags/england.png",
    value: 89061,
    color: "#5b9bd5",
  },
];

const CountriesCard = () => {
  const maxValue = Math.max(...countriesData.map((c) => c.value)); // Find max for bar scaling

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 w-[350px] h-[250px] flex flex-col justify-between">
      <h2 className="text-lg font-semibold  text-gray-700">
      Countries</h2>
      <div className="space-y-4 mt-4">
        {countriesData.map((country) => (
          <div key={country.name}>
            {/* Country Row */}
            <div className="flex items-center justify-between">
              {/* Flag & Name */}
              <div className="flex items-center space-x-3">
                <img
                  src={country.flag}
                  alt={country.name}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-[12px] text-gray-700">{country.name}</span>
              </div>

              {/* Value */}
              <span className="text-[12px] font-medium text-gray-900">
                {country.value.toLocaleString()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-gray-200 mt-1">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(country.value / maxValue) * 100}%`,
                  background: country.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountriesCard;
