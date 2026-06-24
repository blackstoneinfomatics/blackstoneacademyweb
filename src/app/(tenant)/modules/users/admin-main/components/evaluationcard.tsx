"use client";

import { useEffect, useState } from "react";
import countries from "i18n-iso-countries";
import Flag from "react-world-flags";

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";

interface CourseStats {
  totalPercentage: number;
  quranPercentage: string;
  arabicPercentage: string;
  islamicPercentage: string;
}

interface CountryData {
  country: string;
  count: number;
  percentage: number;
}
interface ApiResponse {
  evaluationCount: number;
  studentCountByCountry: CountryData[];
}
//////////////////TotalRequestChart//////////////

const TotalRequestChart = () => {
  const [chartData, setChartData] = useState([
    { name: "male", value: 0, color: "#9FD0FF" },
    { name: "female", value: 0, color: "#FECAFF" },
  ]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchData(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchData = async (token: string) => {
    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TOTAL_TRAIL_CLASS}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();
      console.log("ress", result)

      const evalData = Array.isArray(result) ? result[0] : result.evaluation;

      if (evalData) {
        const { totalCount = 0, maleCount = 0, femaleCount = 0 } = evalData;
      
        setChartData([
          { name: "male", value: maleCount, color: "#9FD0FF" },
          { name: "female", value: femaleCount, color: "#FECAFF" },
        ]);
      
        setTotal(totalCount);
      }
      
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    }
  };

  return (
    <div className="rounded-3xl w-full p-2 h-[270px]">
      <div className="w-full flex justify-between items-center px-3 py-2">
        <h3 className="text-[#010E30] text-[14px] font-semibold dark:text-white">
          Total Requests
        </h3>
      </div>

      <div className="flex justify-center items-center mt-1 dark:text-[#242424]">
        <PieChart width={150} height={150}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={70}
            dataKey="value"
            labelLine={false}
            stroke="none"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[14px] font-semibold fill-[#010E30] dark:fill-white"
          >
            {total}
          </text>
          <Tooltip
            wrapperStyle={{
              fontSize: "10px",
              padding: "4px 6px",
            }}
          />
        </PieChart>
      </div>

      <div className="grid grid-cols-2 gap-1 w-full mt-8">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex flex-col items-center text-start"
          >
            <div className="flex items-center gap-[3px]">
              <div
                className="w-[12px] h-[12px] rounded-[2px]"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-[10px] font-medium text-[#010E30] dark:text-white">
                {item.name.charAt(0).toUpperCase() +
                  item.name.slice(1).toLowerCase()}
              </span>
            </div>
            <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-white/70">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/////////////////countriesData//////////////////

const CountriesCard = () => {
  const [data, setData] = useState<CountryData[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchData(token); // pass token into the function
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchData = async (token: string) => {
    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.GET_COUNTRIES_COUNT}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result: ApiResponse = await res.json();
      setData(result.studentCountByCountry);
    } catch (err) {
      console.error("Failed to fetch country data:", err);
    }
  };

  return (
    <div>
      <h3 className="text-[#010E30] text-[14px] font-semibold dark:text-white">
        Countries
      </h3>

      <div className="space-y-4 mt-4 h-52 overflow-y-scroll scrollbar-none">
        {data?.map((countryInfo) => {
          const countryCode = countries.getAlpha2Code(
            countryInfo.country,
            "en"
          );

          return (
            <div key={countryInfo.country}>
              {/* Country Row */}
              <div className="flex items-center justify-between border-b dark:border-b-[#f3f2f2] py-1">
                {/* Flag & Name */}
                <div className="flex items-center space-x-3">
                  {countryCode ? (
                    <Flag
                      code={countryCode}
                      style={{
                        width: "24px",
                        height: "16px",
                        borderRadius: "10%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="w-5  h-5 bg-gray-300" />
                  )}
                  <span className="text-[11px] text-gray-700 dark:text-white">
                    {countryInfo.country}
                  </span>
                </div>

                {/* Count */}
                <span className="text-[11px] font-medium text-gray-900 dark:text-white">
                  {countryInfo.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

///////////////////PreferredTeachersCard//////////////

const COLORS = ["#9FD0FF", "#FECAFF", "#78A1DB"];



const PreferredTeachersCard = () => {
  const [male, setMale] = useState(0);
  const [female, setFemale] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchData(token); // pass token into the function
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchData = async (token: string) => {
    const response = await fetch(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.PREFERRED_TEACHERS}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();

    // Calculate actual counts based on percentage
    const total = result.preferedTeacherPercentage;
    const maleCount = Math.round(
      (parseFloat(result.preferedTeacherMalePercentage) / 100) * total
    );
    const femaleCount = Math.round(
      (parseFloat(result.preferedTeacherFemalePercentage) / 100) * total
    );

    setMale(maleCount);
    setFemale(femaleCount);
  };

  const getPieLabelPosition = (
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const midAngle = (startAngle + endAngle) / 2;
    const radius = (innerRadius + outerRadius) / 2;
    const RADIAN = Math.PI / 180;
    return {
      x: cx + radius * Math.cos(-midAngle * RADIAN),
      y: cy + radius * Math.sin(-midAngle * RADIAN),
    };
  };

  return (
    <div>
      <div>
        <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">
          Preferred Teachers
        </h2>
        <div className="relative flex items-center justify-center -ml-2 mt-2">
          <PieChart width={150} height={150}>
            {/* Male Segment */}
            {(() => {
              const total = male + female;
              const percent = total > 0 ? Math.round((male / total) * 100) : 0;
              const startAngle = -90;
              const endAngle = -90 + (male / (total || 1)) * 360;
              const pos = getPieLabelPosition(75, 75, 0, 55, startAngle, endAngle);
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
                    fill={COLORS[0]}
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
              const total = male + female;
              const percent = total > 0 ? Math.round((female / total) * 100) : 0;
              const startAngle = -90 + (male / (total || 1)) * 360;
              const endAngle = 270;
              const pos = getPieLabelPosition(75, 75, 0, 50, startAngle, endAngle);
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
                    fill={COLORS[1]}
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
              const startAngle = -90;
              const endAngle = -90 + (male / (male + female || 1)) * 360;
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
                  fill={COLORS[2]}
                />
              );
            })()}
          </PieChart>
        </div>
        <div className="grid grid-cols-2 gap-1 w-full mt-10">
          {/* Legend for Male and Female */}
          <div className="flex flex-col items-center text-start">
            <div className="flex items-center gap-[3px]">
              <div className="w-[12px] h-[12px] rounded-[2px]" style={{ backgroundColor: COLORS[0] }}></div>
              <span className="text-[10px] font-medium text-[#010E30] dark:text-white">Male</span>
            </div>
            <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-white/70">{male}</div>
          </div>
          <div className="flex flex-col items-center text-start">
            <div className="flex items-center gap-[3px]">
              <div className="w-[12px] h-[12px] rounded-[2px]" style={{ backgroundColor: COLORS[1] }}></div>
              <span className="text-[10px] font-medium text-[#010E30] dark:text-white">Female</span>
            </div>
            <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-white/70">{female}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

///////////////////////CoursesCard/////////////////

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white text-gray-900 text-sm px-2 py-1 rounded shadow-md border">
        {payload[0]?.value}%
      </div>
    );
  }
  return null;
};

const CoursesChart = () => {
  const [courseData, setCourseData] = useState([
    { name: "Islamic Studies", value: 0, color: "#9FD0FF" },
    { name: "Arabic", value: 0, color: "#AFC0FF" },
    { name: "Quran", value: 0, color: "#78A1DB" },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchCourseData(token); // pass token into the function
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);
  const fetchCourseData = async (token: string) => {
    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.STUDENT_COURSE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: CourseStats = await res.json();

      setCourseData([
        {
          name: "Islamic Studies",
          value: parseFloat(parseFloat(data.islamicPercentage).toFixed()),
          color: "#9FD0FF",
        },
        {
          name: "Arabic",
          value: parseFloat(parseFloat(data.arabicPercentage).toFixed()),
          color: "#AFC0FF",
        },
        {
          name: "Quran",
          value: parseFloat(parseFloat(data.quranPercentage).toFixed(1)),
          color: "#78A1DB",
        },
      ]);
    } catch (err) {
      console.error("Error fetching course data:", err);
    }
  };

  return (
    <div>
      <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">Courses</h2>

      <ResponsiveContainer width="100%" height={198}>
        <BarChart data={courseData} barCategoryGap={30}>
          <Tooltip
            content={<CustomTooltip active={undefined} payload={undefined} />}
            wrapperStyle={{
              backgroundColor: "transparent",
              border: "none",
              boxShadow: "none",
              padding: 0,
            }}
            cursor={{ fill: "transparent" }} // Optional: removes the bar hover highlight
          />
          <Bar dataKey="value" radius={[15, 15, 15, 15]} barSize={25}>
            {courseData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-center mt-4 space-x-6">
        {courseData.map((entry) => (
          <div key={entry.name} className="flex items-center space-x-2">
            <div
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-[10px] text-[#010E30] dark:text-white font-medium">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-full w-full py-4 md:mr-10 scrollbar-none">
      <div className="bg-[#FFFFFF] dark:bg-[#343434] p-0 rounded-2xl shadow-md  h-full w-full">
        <TotalRequestChart />
      </div>
      <div className="bg-white dark:bg-[#343434] p-4 rounded-2xl shadow-md  h-full w-full">
        <CountriesCard />
      </div>
      <div className="bg-white dark:bg-[#343434] p-4 rounded-2xl shadow-md  h-full w-full">
        <PreferredTeachersCard />
      </div>
      <div className="bg-white dark:bg-[#343434] p-4 rounded-2xl shadow-md  h-full w-full">
        <CoursesChart />
      </div>
    </div>
  );
}
