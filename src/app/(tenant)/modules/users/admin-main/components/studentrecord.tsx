"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  TooltipProps,
} from "recharts";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface GenderResponse {
  studentFemalePercentage: string;
  studentMalePercentage: string;
}

interface CountryStat {
  country: string;
  count: number;
  percentage: number;
}
countries.registerLocale(enLocale);

const StudentsRecord = () => {
  const [barData, setBarData] = useState<ChartDataItem[]>([]);
  const [genderData, setGenderData] = useState<ChartDataItem[]>([]);
  const [countryData, setCountryData] = useState<CountryStat[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchStudentCounts(token);
        fetchGenderData(token);
        fetchCountryStats(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchStudentCounts = async (token: string) => {
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET_STUDENTS_RECORD_COUNT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const count = response.data[0];
      const chartData: ChartDataItem[] = [
        {
          name: "Total Students",
          value: count.studentTotalCount,
          color: "#AFC0FF",
        },
        {
          name: "Students on Hold",
          value: count.onHoldStudent,
          color: "#B9DDFF",
        },
        {
          name: "Active Students",
          value: count.activeStudent,
          color: "#78A1DB",
        },
        {
          name: "Inactive Students",
          value: count.inActiveStudent,
          color: "#C9D5F3",
        },
        {
          name: "Students on Break",
          value: count.studentOnBreak,
          color: "#9FD0FF",
        },
      ];
      setBarData(chartData);
    } catch (error) {
      console.error("Error fetching student status count:", error);
    }
  };

  const fetchGenderData = async (token: string) => {
    try {
      const response = await axios.get<GenderResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET_STUDENTS_GENDER_COUNT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const genderChartData: ChartDataItem[] = [
        {
          name: "Female",
          value: parseFloat(response.data.studentFemalePercentage),
          color: "#FF82F5",
        },
        {
          name: "Male",
          value: parseFloat(response.data.studentMalePercentage),
          color: "#00CFFF",
        },
      ];
      setGenderData(genderChartData);
    } catch (error) {
      console.error("Error fetching gender data:", error);
    }
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<any, any>) => {
    const isDark =
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark");
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-2 rounded shadow-md text-[12px] border ${
            isDark
              ? "bg-[#22223b] text-white border-[#444]"
              : "bg-white text-[#22223b] border-gray-200"
          }`}
        >
          <div
            className={`font-normal ${
              isDark ? "text-white" : "text-[#22223b]"
            }`}
          >
            {label}
          </div>
          <div>
            {payload.map((entry: any, idx: number) => (
              <div
                key={idx}
                className={
                  isDark
                    ? "text-white text-[10px]"
                    : "text-[#22223b] text-[10px]"
                }
              >
                {entry.value} Students
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getPieLabelPosition = (
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
    const r = (innerRadius + outerRadius) / 2;
    const x = cx + r * Math.cos(midAngle);
    const y = cy + r * Math.sin(midAngle);
    return { x, y };
  };

  const fetchCountryStats = async (token: string) => {
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET_STUDENTS_COUNTRY_COUNT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCountryData(response.data.studentCountByCountry);
    } catch (error) {
      console.error("Failed to fetch country stats", error);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full ">
      <div className=" overflow-y-auto scrollbar-none">
        <div className="flex flex-row gap-4 sm:gap-4 md:gap-4 lg:gap-4 xl:gap-4">
          {/* Student Record */}
          <div className="bg-[#FFFFFF] dark:bg-[#343434] p-5 rounded-2xl shadow-md w-full sm:max-w-[370px] md:max-w-[390px] lg:max-w-[620px] h-[280px]">
            <h2 className="text-[16px] font-semibold text-[#0B0F19] dark:text-white mb-4">
              Student Record
            </h2>
            <div className="flex items-start justify-between gap-10">
              {/* Legend Section */}
              <div className="space-y-5 text-[13px] mt-3 text-[#0B0F19] dark:text-white">
                {barData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-[4px]"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>

              {/* Bar Chart Section */}
              <div className="flex-1 h-[220px] pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={40}>
                    <XAxis dataKey="name" axisLine={false} tick={false} />
                    <YAxis hide />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                      {barData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Gender Chart */}
          <div className="bg-[#FFFFFF] dark:bg-[#343434] p-5 rounded-2xl shadow-md w-full sm:max-w-[312px] h-[280px] flex flex-col items-center justify-between relative">
            <h2 className="text-[16px] font-semibold text-[#0B0F19] dark:text-white self-start">
              Gender
            </h2>

            {/* Chart */}
            <div className="relative flex items-center justify-center w-full h-[170px]">
              <PieChart width={150} height={150}>
                {/* Male Segment */}
                {(() => {
                  const male =
                    genderData.find((g) => g.name === "Male")?.value || 0;
                  const female =
                    genderData.find((g) => g.name === "Female")?.value || 0;
                  const total = male + female;
                  const percent =
                    total > 0 ? Math.round((male / total) * 100) : 0;
                  const startAngle = -90;
                  const endAngle = -90 + (male / (total || 1)) * 360;
                  const pos = getPieLabelPosition(
                    75,
                    75,
                    0,
                    55,
                    startAngle,
                    endAngle
                  );
                  return (
                    <>
                      <Pie
                        data={[{ name: "Male", value: male }]}
                        cx={75}
                        cy={75}
                        innerRadius={0}
                        outerRadius={55}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        dataKey="value"
                        strokeWidth={0}
                        fill="#9FD0FF"
                        label={false}
                        labelLine={false}
                      />
                      {male > 0 && (
                        <text
                          x={pos.x}
                          y={pos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="14px"
                          fontWeight="bold"
                          fill="#fff"
                        >
                          {percent}%
                        </text>
                      )}
                    </>
                  );
                })()}
                {/* Female Segment */}
                {(() => {
                  const male =
                    genderData.find((g) => g.name === "Male")?.value || 0;
                  const female =
                    genderData.find((g) => g.name === "Female")?.value || 0;
                  const total = male + female;
                  const percent =
                    total > 0 ? Math.round((female / total) * 100) : 0;
                  const startAngle = -90 + (male / (total || 1)) * 360;
                  const endAngle = 270;
                  const pos = getPieLabelPosition(
                    75,
                    75,
                    0,
                    50,
                    startAngle,
                    endAngle
                  );
                  return (
                    <>
                      <Pie
                        data={[{ name: "Female", value: female }]}
                        cx={75}
                        cy={75}
                        innerRadius={0}
                        outerRadius={50}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        dataKey="value"
                        strokeWidth={0}
                        fill="#FECAFF"
                        label={false}
                        labelLine={false}
                      />
                      {female > 0 && (
                        <text
                          x={pos.x}
                          y={pos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="13px"
                          fontWeight="bold"
                          fill="#fff"
                        >
                          {percent}%
                        </text>
                      )}
                    </>
                  );
                })()}
                {/* Outline */}
                {(() => {
                  const male =
                    genderData.find((g) => g.name === "Male")?.value || 0;
                  const total =
                    male +
                    (genderData.find((g) => g.name === "Female")?.value || 0);
                  const startAngle = -90;
                  const endAngle = -90 + (male / (total || 1)) * 360;
                  return (
                    <Pie
                      data={[{ name: "Male", value: male }]}
                      cx={75}
                      cy={75}
                      innerRadius={58}
                      outerRadius={62}
                      startAngle={startAngle}
                      endAngle={endAngle}
                      dataKey="value"
                      strokeWidth={0}
                      fill="#78A1DB"
                    />
                  );
                })()}
              </PieChart>
            </div>

            {/* Legends */}
            <div className="grid grid-cols-2 gap-1 w-full mt-10">
              <div className="flex flex-col items-center text-start">
                <div className="flex items-center gap-[3px]">
                  <div
                    className="w-[12px] h-[12px] rounded-[2px]"
                    style={{ backgroundColor: "#9FD0FF" }}
                  ></div>
                  <span className="text-[10px] font-semibold text-[#010E30] dark:text-white">
                    Male
                  </span>
                </div>
                <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-white/70">
                  {genderData.find((g) => g.name === "Male")?.value || 0}
                </div>
              </div>
              <div className="flex flex-col items-center text-start">
                <div className="flex items-center gap-[3px]">
                  <div
                    className="w-[12px] h-[12px] rounded-[2px]"
                    style={{ backgroundColor: "#FECAFF" }}
                  ></div>
                  <span className="text-[10px] font-semibold text-[#010E30] dark:text-white">
                    Female
                  </span>
                </div>
                <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-white/70">
                  {genderData.find((g) => g.name === "Female")?.value || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Countries Block */}
          <div className="bg-[#FFFFFF] dark:bg-[#343434] p-5 rounded-2xl shadow-md w-full sm:max-w-[312px] h-[280px] flex flex-col">
            <h2 className="text-[16px] font-semibold text-[#0B0F19] dark:text-white">
              Countries
            </h2>
            <div className="space-y-2 mt-2 flex-1 overflow-y-auto scrollbar-none">
              {countryData.map((country, i) => {
                const countryCode = countries.getAlpha2Code(
                  country.country,
                  "en"
                );
                const flagUrl = countryCode
                  ? `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
                  : "/assets/images/flags/default.png";

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b dark:border-b-[#5C5C5C] py-1"
                  >
                    <div className="flex items-center gap-2">
                      {countryCode ? (
                        <img
                          src={flagUrl}
                          alt={country.country}
                          className="w-6 h-4 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="w-6 h-4 bg-gray-300 rounded" />
                      )}
                      <span className="text-[12px] text-gray-700 dark:text-white">
                        {country.country}
                      </span>
                    </div>
                    <span className="text-[12px] font-medium text-gray-900 dark:text-white">
                      {country.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsRecord;
