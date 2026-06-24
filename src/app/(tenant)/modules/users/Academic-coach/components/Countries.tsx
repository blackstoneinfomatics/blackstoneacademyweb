"use client";

import React, { useEffect, useState } from "react";
import countries from "i18n-iso-countries";
import { FaGlobeAmericas } from "react-icons/fa";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// Register English country names
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

interface EmpCountryData {
  country: string;
  count: number;
}

export default function Countries() {
  const [countryDataemp, setCountryDataemp] = useState<EmpCountryData[]>([]);

  useEffect(() => {
    const fetchCountryData = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;
      const id =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachPortalId")
          : null;

      if (!id) {
        console.warn("⚠️ Missing academicCoachId in URL query params.");
        return;
      }

      try {
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET_STUDENTS_COUNTRY_COUNT}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json = await res.json();
        console.log(json);
        setCountryDataemp(json.studentCountByCountry || []);
      } catch (error) {
        console.error("Error fetching country data:", error);
      }
    };

    fetchCountryData();
  }, []);

  return (
    <div className="col-span-12 rounded-xl p-2 text-[#000] dark:text-[#fff]">
      <h2 className="text-[16px] font-semibold text-[#000] dark:text-[#fff] mb-2 px-3 py-2">
        Countries
      </h2>
      <div className="overflow-y-scroll h-[275px] scrollbar-none px-4 -mt-[5px]">
        {countryDataemp.map((country, i) => {
          const countryCode = countries.getAlpha2Code(country.country, "en");

          const flagUrl = countryCode
            ? `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
            : "/assets/images/flags/default.png";

          return (
            <div
              key={country.country}
              className="flex items-center gap-2 border-b border-[#E6E6E6] dark:border-[#585858] -mt-[2px] py-[1px]"
            >
              <div>
                <img
                  src={flagUrl}
                  alt={country.country}
                  className="w-6 h-4 rounded-[2px] -mt-1"
                />
              </div>

              <div className="w-full mt-1">
                <div className="flex justify-between mt-1 text-[12px] font-normal text-[#010E30E5] dark:text-[#fff] opacity-90 mb-[8px]">
                  <span className="opacity-90">{country.country}</span>
                  <span className="text-[#010e30] dark:text-[#fff] font-medium text-[13px]">
                    {country.count.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
