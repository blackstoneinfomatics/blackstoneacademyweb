"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  DotProps,
} from "recharts";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { io, Socket } from "socket.io-client";
import AdminHeader from "../../components/AdminHeader";
import { TooltipProps } from "recharts";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";

interface CountryStat {
  revenue: number;
  count: number;
  country: string;
  percentage?: number;
}
countries.registerLocale(enLocale);

interface ChartDataItem {
  courseName: string;
  revenue: number;
  color: string;
}

interface StudentInvoice {
  student: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPhone: number;
  };
  _id: string;
  courseName: string;
  amount: number;
  status: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: Date;
  invoiceStatus: string;
}

interface ApiResponse {
  totalCount: number;
  invoice: StudentInvoice[];
}

const visitorDataStatic = [
  { date: "Jan", Friend: 320, SocialMedia: 280, Email: 120, Google: 150, Other: 200 },
  { date: "Feb", Friend: 300, SocialMedia: 270, Email: 140, Google: 130, Other: 190 },
  { date: "Mar", Friend: 330, SocialMedia: 260, Email: 130, Google: 140, Other: 180 },
  { date: "Apr", Friend: 310, SocialMedia: 250, Email: 150, Google: 145, Other: 170 },
  { date: "May", Friend: 340, SocialMedia: 240, Email: 160, Google: 155, Other: 175 },
  { date: "Jun", Friend: 370, SocialMedia: 245, Email: 170, Google: 180, Other: 165 },
  { date: "Jul", Friend: 420, SocialMedia: 260, Email: 180, Google: 210, Other: 170 },
  { date: "Aug", Friend: 410, SocialMedia: 270, Email: 175, Google: 200, Other: 160 },
  { date: "Sep", Friend: 390, SocialMedia: 265, Email: 160, Google: 190, Other: 150 },
  { date: "Oct", Friend: 350, SocialMedia: 255, Email: 145, Google: 170, Other: 140 },
  { date: "Nov", Friend: 330, SocialMedia: 240, Email: 135, Google: 160, Other: 130 },
  { date: "Dec", Friend: 310, SocialMedia: 230, Email: 120, Google: 150, Other: 120 },
];

const CustomDot = (props: DotProps & { payload?: any }) => {
  const { cx, cy, payload } = props;
  if (payload?.date === "Jul" && cx !== undefined && cy !== undefined) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#0F172A"
        stroke="#fff"
        strokeWidth={1.5}
      />
    );
  }
  return null;
};


const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-md p-2 text-xs border shadow-sm bg-black text-white dark:bg-white dark:text-black border-gray-300 dark:border-gray-700">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.stroke }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};



const CountriesCard = () => {
  const [countryData, setCountryData] = useState<CountryStat[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) fetchData(token);
    }
  }, []);

  const fetchData = async (token: string) => {
    try {
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ANALYTICS.AMOUNT_BY_COUNTRY}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (Array.isArray(result)) {
        const filtered = result.filter((c) => c.country !== "TotalAllCountries");
        setCountryData(filtered);
      }
    } catch (err) {
      console.error("Error fetching countries", err);
    }
  };

  return (
    <div className="bg-white dark:bg-[#343434] rounded-xl shadow-sm p-4 w-full h-full border border-gray-200 dark:border-[#555555]">
      <h2 className="text-sm font-semibold dark:text-white text-gray-800 mb-3">Countries</h2>

      <div className="max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#555555] pr-1">
        {countryData.length > 0 ? (
          countryData.map((country, index) => {
            const code = countries.getAlpha2Code(country.country, "en");
            const flagUrl = code
              ? `https://flagcdn.com/w40/${code.toLowerCase()}.png`
              : "/assets/images/flags/default.png";

            return (
              <div
                key={index}
                className="flex justify-between items-center border-b dark:border-[#555555] last:border-none py-2"
              >
                <div className="flex items-center gap-2">
                  <img src={flagUrl} alt={country.country} className="w-6 h-4 object-cover rounded-sm" />
                  <span className="text-sm font-medium dark:text-white text-gray-700">{country.country}</span>
                </div>
                <span className="text-sm font-semibold dark:text-white text-gray-800">{country.count}</span>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-gray-500 dark:text-white">Loading country data...</p>
        )}
      </div>
    </div>
  );
};

const CoursesChart = () => {
  const [barData, setBarData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    const fetchData = async (token: string) => {
      try {
        const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ANALYTICS.AMOUNT_BY_COURSE}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const allCourses = response.data;

        const filteredCourses = allCourses.filter((course: any) =>
          ["Quran Studies", "Islamic Studies", "Arabic Studies"].includes(course.courseName)
        );

        const colorMap: Record<string, string> = {
          "Quran Studies": "#9FD0FF",
          "Islamic Studies": "#AFC0FF",
          "Arabic Studies": "#78A1DB",
        };

        const chartData: ChartDataItem[] = filteredCourses.map(
          (course: { courseName: string; revenue: number }) => ({
            courseName: course.courseName.replace(" Studies", ""),
            revenue: course.revenue,
            color: colorMap[course.courseName] || "#ccc",
          })
        );

        setBarData(chartData);
      } catch (error) {
        console.error("Error fetching course revenue data:", error);
      }
    };

    const token = localStorage.getItem("AdminAuthToken");
    if (token) {
      fetchData(token);
    }
  }, []);

  return (
    <div className="bg-white dark:bg-[#343434] p-4 rounded-xl shadow-sm w-full h-full border border-gray-200 dark:border-[#555555]">
      <h2 className="text-sm font-semibold mb-4 dark:text-white text-gray-800">Courses</h2>
      <div className="w-full max-w-full overflow-x-auto h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} barCategoryGap={25}>
            <XAxis hide />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div
                    className={`
                      text-xs px-2 py-[2px] rounded shadow
                      border border-gray-300 dark:border-[#666666]
                      bg-white text-[#0F172A] 
                      dark:bg-[#222222] dark:text-white
                    `}
                    style={{
                      fontWeight: 600,
                      minWidth: "30px",
                      textAlign: "center",
                    }}
                  >
                    ${payload[0]?.value}
                  </div>
                ) : null
              }
            />
            <Bar dataKey="revenue" radius={[40, 40, 40, 40]} barSize={50}>
              {barData.map((entry) => (
                <Cell key={entry.courseName} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center mt-4 gap-x-4 gap-y-2 text-xs font-medium dark:text-white text-gray-700">
        {barData.map((entry) => (
          <div key={entry.courseName} className="flex items-center gap-2">
            <span className="w-2 h-2 " style={{ backgroundColor: entry.color }}></span>
            <span>{entry.courseName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};



export default function Home() {
  const socketRef = useRef<Socket | null>(null);
  let userId = "";
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [barData, setBarData] = useState<ChartDataItem[]>([]);
  const [data, setData] = useState<StudentInvoice[]>([]);
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [revenueDatas, setRevenueDatas] = useState<any[]>([]);
  const [selectedRevenueYear, setSelectedRevenueYear] = useState(new Date().getFullYear());
  const [selectedVisitorYear, setSelectedVisitorYear] = useState(new Date().getFullYear());
useEffect(()=>{
  const id =
        typeof window !== "undefined" ? localStorage.getItem("AcademicCoachAuthToken") : null;

      if (!id) {
        console.error("❌ AdminAuthToken not found");
        return;
      } else {
        userId = id;
      }
},[]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("https://api.blackstoneinfomaticstech.com", {
        transports: ["websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to Socket.IO:", socketRef.current?.id);
        socketRef.current?.emit("subscribe", userId);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from Socket.IO");
      });

      socketRef.current.on("connect_error", (err: any) => {
        console.error("Socket.IO connection error:", err);
      });
    }

    const handleRevenueUpdate = (updatedRevenue: any) => {
      console.log("💸 Live revenue update:", updatedRevenue);
      const totalAllCourses = updatedRevenue.find((item: any) => item.courseName === 'TotalAllCourses');
      if (totalAllCourses) {
        setTotalRevenue(totalAllCourses.revenue);
      }
    };
    

    socketRef.current.on("revenueUpdated", handleRevenueUpdate);

    return () => {
      socketRef.current?.off("revenueUpdate", handleRevenueUpdate);
    };
  }, [userId]);

  useEffect(() => {
    const fetchMeetings = async (token: string) => {
      try {
        const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ANALYTICS.AMOUNT_BY_COURSE}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const allCourses = response.data;
        const totalCourse = allCourses.find(
          (course: any) => course.courseName === "TotalAllCourses"
        );
        if (totalCourse) setTotalRevenue(totalCourse.revenue);

        const filteredCourses = allCourses.filter((course: any) =>
          ["Quran Studies", "Islamic Studies", "Arabic Studies"].includes(course.courseName)
        );

        const colorMap: Record<string, string> = {
          "Quran Studies": "#7f9cb6",
          "Islamic Studies": "#4a90e2",
          "Arabic Studies": "#001d3d",
        };

        const chartData: ChartDataItem[] = filteredCourses.map(
          (course: { courseName: string; revenue: any }) => ({
            courseName: course.courseName.replace(" Studies", ""),
            revenue: course.revenue,
            color: colorMap[course.courseName] || "#ccc",
          })
        );

        setBarData(chartData);
      } catch (error) {
        console.error("Error fetching course revenue data:", error);
      }
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('AdminAuthToken');
      if (token) {
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  useEffect(() => {
    const fetchInvoices = async (token: string) => {
      try {
        const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.STUDENT_INVOICE}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data: ApiResponse = await response.json();
        const filteredData = data.invoice
          .filter((invoice) => invoice.invoiceStatus === "Paid")
          .sort(
            (a, b) =>
              new Date(b.createdDate).getTime() -
              new Date(a.createdDate).getTime()
          )
          .slice(0, 3);

        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('AdminAuthToken');
      if (token) {
        fetchInvoices(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
    try {
      const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ANALYTICS.STUDENT_VISITOR}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setVisitorData(data);
    } catch (error) {
      console.error("Error fetching visitor data:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('AdminAuthToken');
      if (token) {
        fetchVisitorData(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchRevenueData = async (year: number, token: string) => {
    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ANALYTICS.STUDENT_REVENUE}?year=${year}`,
        {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const formatted = result.data.map((item: any, index: number) => ({
        ...item,
        label: monthNames[index % 12]
      }));

      setRevenueDatas(formatted);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('AdminAuthToken');
      if (token) {
        fetchRevenueData(selectedYear, token);
      }
    }
  }, [selectedYear]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('AdminAuthToken');
      if (token) {
        fetchRevenueData(selectedYear, token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Analytics" />
      <div className="flex-1  overflow-auto">
        <div className="py-1 px-3 w-full h-full space-y-2">
          {/* Revenue Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="relative bg-[#6172B0] rounded-2xl p-4 text-white overflow-hidden shadow-lg h-full w-full">
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-base font-medium opacity-90 mb-1">Total Income</h3>
                <div className="text-4xl font-bold mb-4">$8954.57</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 19V5" />
                      <path d="M5 12l7-7 7 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">15%</span>
                </div>
              </div>

              {/* Decorative Wave Background + Stroke */}
              <svg
                className="absolute bottom-0 left-0 w-full h-[300px] z-0"
                viewBox="0 0 320 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="waveGradient" >
                    <stop offset="0%" stopColor="#4E61A7" />
                    <stop offset="100%" stopColor="#9CB1FF" />
                  </linearGradient>
                </defs>

                {/* Gradient fill below wave */}
                <path
                  d="M0,96 C40,80 80,60 120,70 C160,80 200,90 240,75 C280,60 300,65 320,80 L320,100 L0,100 Z"
                  fill="url(#waveGradient)"
                  opacity="0.8"
                />

                {/* White stroke on top of wave */}
                <path
                  d="M0,96 C40,80 80,60 120,70 C160,80 200,90 240,75 C280,60 300,65 320,80"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              </svg>

            </div>



            {/* Revenue Chart */}
            <div className="col-span-3 bg-white dark:bg-[#343434] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-[#555555]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[15px] font-semibold dark:text-[#FFFFFF] text-slate-800">Total Invoice Revenue</h3>

                {/* Select + Arrow */}
                <div className="relative inline-block w-fit">
                  <select
                    value={selectedRevenueYear}
                    onChange={async (e) => {
                      const year = Number(e.target.value);
                      setSelectedRevenueYear(year);
                      const token = localStorage.getItem("AdminAuthToken");
                      if (token) {
                        await fetchRevenueData(year, token);
                      }
                    }}
                    className="appearance-none bg-[#EFEFEF] dark:bg-[#DEDEDE] dark:text-[#666666] border border-gray-300 dark:border-[#666666] rounded text-sm h-[26px] px-2 pr-6 text-gray-700 focus:outline-none"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year === new Date().getFullYear() ? "This Year" : "Last Year"}
                        </option>
                      );
                    })}
                  </select>

                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-[11px]">
                    ▼
                  </div>
                </div>
              </div>

              <div className="h-[220px]  pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueDatas}
                    margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={{
                        fill: "#0f172a",
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                      className="dark:[&_text]:fill-[#FFFFFF]  "
                    />
                    <YAxis hide />
                    <Bar
                      dataKey="revenue"
                      radius={[20, 20, 20, 20]}
                      barSize={50}
                      label={{
                        position: "top",
                        formatter: (value: number) => `$${value}`,
                        fill: "#0f172a",
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                      className="dark:[&_text]:fill-[#FFFFFF]"
                    >
                      {revenueDatas.map((entry) => (
                        <Cell key={`cell-${entry.label}`} fill="#8CB3F4" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>


          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
            {/* Visitor Insights */}
            <div className="lg:col-span-2 bg-white dark:bg-[#343434] rounded-xl shadow-sm p-4 border border-gray-200 dark:border-[#555555]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold dark:text-[#FFFFFF] text-gray-800">Visitor Insights</h3>
                <div className="relative inline-block w-fit">
                  <select
                    value={selectedVisitorYear}
                    onChange={async (e) => {
                      const year = Number(e.target.value);
                      setSelectedVisitorYear(year);
                      const token = localStorage.getItem("AdminAuthToken");
                      if (token) {
                        await fetchVisitorData(token); // reuse the function
                      }
                    }}
                    className="appearance-none bg-[#EFEFEF] dark:bg-[#DEDEDE] dark:text-[#666666] text-xs border border-gray-300 dark:border-[#666666] rounded px-2 py-1 pr-6 focus:outline-none"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      const label =
                        year === new Date().getFullYear()
                          ? "This Year"
                          : year === new Date().getFullYear() - 1
                            ? "Last Year"
                            : year;
                      return (
                        <option key={year} value={year}>
                          {label}
                        </option>
                      );
                    })}
                  </select>

                  {/* Custom arrow */}
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-[9px]">
                    ▼
                  </div>
                </div>

              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={visitorDataStatic}
                    margin={{ top: 30, right: 20, left: -20, bottom: 20 }}
                  >

                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      interval={0} // Shows all months
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                        fontWeight: 600,
                        dy: 6, // push ticks downward
                      }}
                      padding={{ left: 10, right: 10 }}
                      className="dark:[&_text]:fill-[#FFFFFF]"
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                      className="dark:[&_text]:fill-[#FFFFFF] "
                    />
                    <Tooltip content={<CustomTooltip />} />

                    <Line
                      type="monotone"
                      dataKey="Friend"
                      stroke="#99f6e4"
                      strokeWidth={4}
                      dot={<CustomDot />}
                    />
                    <Line
                      type="monotone"
                      dataKey="SocialMedia"
                      stroke="#bfdbfe"
                      strokeWidth={4}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Email"
                      stroke="#86efac"
                      strokeWidth={4}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Google"
                      stroke="#c4b5fd"
                      strokeWidth={4}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Other"
                      stroke="#93c5fd"
                      strokeWidth={4}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap justify-center mt-4 gap-x-8 gap-y-2 text-xs font-medium dark:text-[#FFFFFF] text-gray-700">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2  bg-[#99f6e4]"></span> Friends
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2  bg-[#bfdbfe]"></span> Social Media
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2  bg-[#86efac]"></span> E-Mail
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#c4b5fd]"></span> Google
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#93c5fd]"></span> Other
                </div>
              </div>
            </div>


            {/* Countries */}
            <div className="lg:col-span-1">
              <CountriesCard />
            </div>

            {/* Courses */}
            <div className="lg:col-span-1">
              <CoursesChart />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-[#343434] rounded-xl overflow-hidden border border-slate-200 dark:border-[#555555]">
            <div className="bg-white dark:bg-[#343434] dark:text-[#FFFFFF] text-[#0f172a] text-sm font-semibold px-4 py-3">
              Recent Transactions
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#4C6993] text-white h-[46px] text-left">
                  <th className="px-4 font-medium">Client</th>
                  <th className="px-4 font-medium">Service</th>
                  <th className="px-4 font-medium">Amount</th>
                  <th className="px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 dark:bg-[#343434]">
                {data.map((row, index) => (
                  <tr
                    key={row._id}
                    className={`h-[46px] ${index % 2 === 0 ? "bg-white dark:bg-[#444444]" : "bg-[#f8fafc] dark:bg-[#555555]"}`}
                  >
                    <td className="px-4 text-left dark:text-[#FFFFFF]">{row.student.studentName}</td>
                    <td className="px-4 text-left dark:text-[#FFFFFF]">{row.courseName}</td>
                    <td className="px-4 text-left dark:text-[#FFFFFF]">${row.amount}</td>
                    <td className="px-4 text-left">
                      <span className="bg-green-100 dark:bg-green-900 dark:text-green-200 text-green-700 text-[12px] px-2 py-1 font-medium">
                        {row.invoiceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseLayout4>
  );
}