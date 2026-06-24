"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Label,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import BaseLayout3 from "../../components/BaseLayout3";
import ApplicationChart from "../../components/applicantsbar";
import moment from "moment";
import axios from "axios";
import Calendar from "../../components/Calender";
import SupervisorHeader from "../../components/supervisorHeader";

import { getSocket } from "@/app/utils/socket";
import { ImAttachment } from "react-icons/im";
import Subject from "../../components/Subject";
import { useTheme } from "@/context/ThemeContext";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Applicant {
  _id: string;
  candidateFirstName: string;
  candidateLastName: string;
  applicationDate: string;
  candidateEmail: string;
  candidatePhoneNumber: number;
  candidateCountry: string;
  candidateCity: string;
  positionApplied: string;
  currency: string;
  expectedSalary: number;
  preferedWorkingHours: string;
  uploadResume: string;
  comments: string;
  applicationStatus: string;
  status: string;
  createdDate: string;
  createdBy: string;
  gender: string;
}

interface DashboardCounts {
  totalApplication: number;
  shortlisted: number;
  rejected: number;
  waiting: number;
  shortlistedPercentage: number;
  rejectedPercentage: number;
  waitingPercentage: number;
}
interface Meeting {
  _id: string;
  meetingId: string;
  meetingName: string;
  meetingStatus: "Scheduled" | "Reschedule" | "Completed";
  selectedDate: string;
  startTime: string;
  endTime: string;
  description: string;
  createdDate: string;
  createdBy: string;
  supervisor: {
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
    supervisorRole: string;
  };
  teacher: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  }[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export default function Dashboard() {
  const { darkMode } = useTheme();
  const [pieData, setPieData] = useState<
    {
      name: string;
      value: number;
      female: number;
      male: number;
      color: string;
    }[]
  >([]);
  const colorMap = [
    {
      dot: "#3778AD",
      bg: "#F3FAFF",
      text: "#3778AD",
      icon: "/assets/images/S1.png",
    },
    {
      dot: "#7772D7",
      bg: "#F3F6FF",
      text: "#7772D7",
      icon: "/assets/images/S2.png",
    },
    {
      dot: "#DE7283",
      bg: "#FFF5F3",
      text: "#DE7283",
      icon: "/assets/images/S4.png",
    },
    {
      dot: "#BF8C63",
      bg: "#FFF9F3",
      text: "#BF8C63",
      icon: "/assets/images/S3.png",
    },
  ];

  const ringThickness = 6; // thickness of each ring
  const ringGap = 4; // gap between rings
  const [applicantsWithUrls, setApplicantsWithUrls] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>(""); // Store the selected week label
  const [weekRange, setWeekRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: moment().startOf("week").toDate(), // Start of the current week (Sunday)
    endDate: moment().endOf("week").toDate(), // End of the current week (Saturday)
  });
  const [dashboardCounts, setDashboardCounts] = useState<DashboardCounts>({
    totalApplication: 2,
    shortlisted: 0,
    rejected: 0,
    waiting: 1,
    shortlistedPercentage: 0,
    rejectedPercentage: 0,
    waitingPercentage: 50,
  });
  const [filteredPositions, setFilteredPositions] = useState<
    { name: string; color: string; count: number }[]
  >([]);
  useEffect(() => {
    const Id =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorPortalId")
        : null;
    console.log("dashobarcgc id", Id);
    if (!Id) return;
    const socket = getSocket(Id);
    const handleCount = (data: DashboardCounts) => {
      setDashboardCounts(data);
      console.log(data);
    };
    const handleList = (data: { event: string; data: Applicant }) => {
      console.log("📩 Received WebSocket Data:", data);

      if (data.event === "create") {
        console.log("➡️ Action: create", data.data._id);
        setApplicants((prev) => [data.data, ...prev]);
      } else if (data.event === "update") {
        console.log("➡️ Action: update", data.data._id);
        setApplicants((prev) =>
          prev.map((app) =>
            app._id.toString() === data.data._id.toString()
              ? { ...data.data, __updatedAt: Date.now() }
              : app
          )
        );
      } else {
        console.warn("⚠️ Unknown event type:", data.event);
      }
    };

    socket.on("supervisordashboardcount", handleCount);
    socket.on("recruitmentlist", handleList);
    return () => {
      socket.off("supervisordashboardcount", handleCount);
      socket.off("recruitmentlist", handleList);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorAuthToken")
        : null;

    const id =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorPortalId")
        : null;

    if (!token || !id) {
      console.error("❌ SupervisorAuthToken or SupervisorPortalId not found");
      return;
    }
    const fetchData = async () => {
      const applicants = await fetchApplicantsData(token ?? " ");
      // console.log("Fetched Applicants:", applicants);
      const filteredData = processApplicants(applicants);
      // console.log("Filtered Pie Data:", filteredData);
      setPieData(filteredData);
    };

    const fetchApplicants = axios.get(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const fetchDashboardCounts = axios.get(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_SUPERVISOR_COUNTS}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          supervisor: id,
        },
      }
    );

    Promise.all([fetchApplicants, fetchDashboardCounts])
      .then(([applicantsResponse, dashboardResponse]) => {
        const applicants = applicantsResponse.data.applicants;
        // console.log("📦 Applicants from API:", applicants);
        applicants.forEach((app: { uploadResume: any }, idx: any) =>
          // console.log(`🔍 Applicant[${idx}] Resume:`, app.uploadResume)
          console.log(`🔍 Applicant[${idx}] Resume:`)
        );

        // ✅ Filter and count applicants by position
        const positionCounts = applicants.reduce(
          (
            acc: Record<string, number>,
            applicant: { positionApplied: string }
          ) => {
            const position = applicant.positionApplied;
            acc[position] = (acc[position] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        // ✅ Convert to array format (for UI rendering)
        const filteredData = Object.entries(positionCounts).map(
          ([name, count], index) => ({
            name,
            count: count as number, // ✅ Explicitly cast count to number
            color: ["#F4AAFF", "#FFC4A1", "#A6A9FF"][index % 5],
          })
        );
        fetchData();
        setApplicants(applicants);
        setFilteredPositions(filteredData); // ✅ Store filtered positions
        setDashboardCounts(dashboardResponse.data);
      })
      .catch((error) => {
        console.error("🚨 Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    // Update the week range label (e.g., "08-14 Nov") dynamically
    const start = moment(weekRange.startDate);
    const end = moment(weekRange.endDate);
    const weekLabel = `${start.format("DD MMM")} - ${end.format("DD MMM")}`;
    setSelectedWeek(weekLabel);

    // Process applicants data based on the selected week range
    const processedData: any = [];
    const { startDate, endDate } = weekRange;

    applicants.forEach((applicant) => {
      const applicationDate = new Date(applicant.applicationDate);

      // Convert startDate and endDate to JavaScript Date objects for comparison
      const startDateObject = moment(startDate).toDate();
      const endDateObject = moment(endDate).toDate();

      // Filter applicants based on the selected week
      if (
        applicationDate >= startDateObject &&
        applicationDate <= endDateObject
      ) {
        const formattedDate = `${applicationDate.getDate()} ${applicationDate.toLocaleString(
          "default",
          {
            month: "short",
          }
        )}`;

        // Find if the date already exists in the processedData
        let existingData = processedData.find(
          (data: any) => data.name === formattedDate
        );

        if (!existingData) {
          // If not, add a new entry for the date
          existingData = { name: formattedDate, Applied: 0, Shortlisted: 0 };
          processedData.push(existingData);
        }

        // Increment Applied count for each applicant
        existingData.Applied += 1;

        // Increment Shortlisted count if the applicant is shortlisted
        if (applicant.applicationStatus === "SHORTLISTED") {
          existingData.Shortlisted += 1;
        }
      }
    });

    setBarData(processedData);
  }, [applicants, weekRange]);
  const [meetingDays, setMeetingDays] = useState<number[]>([]);
  const [todayMeetings, setTodayMeetings] = useState<
    { time: string; title: string; meetingId: string; color: string }[]
  >([]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("SupervisorAuthToken")
            : null;

        if (!token) {
          console.error("❌ SupervisorAuthToken not found");
          return;
        }
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING.GET_SUPERVISOR_MEETING}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const allMeetings: Meeting[] = response.data.meetings;

        // console.log("✅ Full Meetings Data:", allMeetings);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ✅ Extract all meeting dates
        const allMeetingDays = allMeetings.map((meeting) =>
          new Date(meeting.selectedDate).getDate()
        );

        setMeetingDays(allMeetingDays);

        const now = new Date();

// Step 1: Date + Time format
const formattedMeetings = allMeetings.map((meeting) => {
  const datePart = meeting.selectedDate.split("T")[0];

  const meetingDateTime = new Date(
    `${datePart}T${meeting.startTime}:00`
  );

  return {
    ...meeting,
    meetingDateTime,
  };
});

// Step 2: Unique by meetingId only
const uniqueMap = new Map();

formattedMeetings.forEach((meeting) => {
  if (!uniqueMap.has(meeting.meetingId)) {
    uniqueMap.set(meeting.meetingId, meeting);
  }
});

const uniqueMeetings = Array.from(uniqueMap.values());

// Step 3: Upcoming + sort + limit
const upcomingMeetings = uniqueMeetings
  .filter((m) => m.meetingDateTime >= now)

  .sort((a, b) => a.meetingDateTime - b.meetingDateTime)

  .slice(0, 5)

  .map((m) => {
    let color = "bg-blue-100 text-blue-800";

    if (m.meetingStatus === "Scheduled") {
      color = "bg-amber-100 text-amber-800";
    }

    return {
      time: m.startTime,
      title: m.meetingName,
      meetingId: m.meetingId,
      color,
    };
  });

setTodayMeetings(upcomingMeetings);

        
        
      } catch (error) {
        console.error("🚨 Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);


  const fetchApplicantsData = async (auth: string) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("SupervisorAuthToken")
          : null;

      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return;
      }
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("API Response:", response.data);

      // Check if response.data has an 'applicants' property that is an array
      if (response.data && Array.isArray(response.data.applicants)) {
        return response.data.applicants;
      } else {
        // console.error("Unexpected API response format:", response.data);
        return []; // Return an empty array to prevent errors
      }
    } catch (error) {
      // console.error("Error fetching applicants:", error);
      return []; // Return empty array on error
    }
  };

  const processApplicants = (applicants: any[]) => {
    if (!Array.isArray(applicants)) {
      // console.error("Unexpected data format:", applicants);
      return []; // Prevent crash
    }

    // ✅ Filter only approved applications
    const approvedApplicants = applicants.filter(
      (app) => app.applicationStatus === "APPROVED"
    );

    const groupedData: {
      [key: string]: { value: number; female: number; male: number };
    } = {};

    approvedApplicants.forEach((app) => {
      const key = app.positionApplied;
      if (!groupedData[key]) {
        groupedData[key] = { value: 0, female: 0, male: 0 };
      }
      groupedData[key].value += 1;
      if (app.gender?.toLowerCase() === "female") {
        groupedData[key].female += 1;
      } else {
        groupedData[key].male += 1;
      }
    });

    return Object.entries(groupedData).map(([name, data], index) => ({
      name,
      value: data.value,
      female: data.female,
      male: data.male,
      color: ["#AFC0FF", "#9FD0FF", "#B9DDFF"][index % 4], // Assign different colors
    }));
  };

  const handleWeekChange = (startDate: Date, endDate: Date) => {
    setWeekRange({ startDate, endDate });
  };

  if (!mounted) return null;

  const totals = filteredPositions.reduce((sum, item) => sum + item.count, 0);

  const totalApplications = dashboardCounts.totalApplication || 0;
  const totalShortlisted = dashboardCounts.shortlisted || 0;
  const totalRejected = dashboardCounts.rejected || 0;
  const totalWaiting = dashboardCounts.waiting || 0;
  const total = totalApplications + totalShortlisted + totalRejected + totalWaiting;
  const percentageApplications = (totalApplications / total) * 100;
  const remainingApplications = 100 - percentageApplications;
  console.log(remainingApplications);

  function base64ToBlob(base64: string, contentType = "application/pdf"): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
  
  function getResumeBlobUrl(uploadResume: string): string | undefined {
    if (!uploadResume) return undefined;
  
    try {
      const blob = base64ToBlob(uploadResume);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error creating resume blob URL:", error);
      return undefined;
    }
  }

  return (
    <BaseLayout3>
      <SupervisorHeader currentSection="Dashboard" />
      <div className="flex flex-row gap-4 p-0 min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Total Applications",
                value: dashboardCounts.totalApplication,
                ringColor: "#7DB5CB",
                bgColor: "#CDD5E2",
                percentage: 100,
                pieData: [{ value: 100 }],
              },
              {
                title: "Shortlisted Candidates",
                value: dashboardCounts.shortlisted,
                ringColor: "#9AD7D6",
                bgColor: "#CDD5E2",
                percentage: (dashboardCounts.shortlistedPercentage??0).toFixed(0),
                pieData: [
                  { value: dashboardCounts.shortlistedPercentage },
                  { value: 100 - dashboardCounts.shortlistedPercentage },
                ],
              },
              {
                title: "Rejected Candidates",
                value: dashboardCounts.rejected,
                ringColor: "#8B93D2",
                bgColor: "#CDD5E2",
                percentage: (dashboardCounts.rejectedPercentage?? 0).toFixed(0),
                pieData: [
                  { value: dashboardCounts.rejectedPercentage },
                  { value: 100 - dashboardCounts.rejectedPercentage },
                ],
              },
            ].map((item, idx) => {
              const bgClass =
                idx === 0
                  ? "bg-gradient-to-b from-white to-[#F6FCFF] dark:from-[#343434] dark:to-[#2A2A2A]"
                  : idx === 1
                  ? "bg-gradient-to-b from-white to-[#F6FFFF] dark:from-[#343434] dark:to-[#2A2A2A]"
                  : "bg-gradient-to-b from-white to-[#F8F6FF] dark:from-[#343434] dark:to-[#2A2A2A]";

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl shadow-lg w-full ${bgClass}`}
                >
                  <h3 className="text-[#010E30] dark:text-white text-[14px] font-medium mb-2">
                    {item.title.split(" ")[0]} <br /> {item.title.split(" ")[1]}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[28px] text-[#010E30] font-semibold dark:text-white">
                      {item.value}
                    </span>
                    <div className="relative w-[90px] h-[70px]">
                      <PieChart
                        width={90}
                        height={90}
                        style={{ marginTop: "-20px" }}
                      >
                        <Pie
                          data={[{ value: 100 }]}
                          dataKey="value"
                          innerRadius={30}
                          outerRadius={38}
                          startAngle={90}
                          endAngle={-270}
                          isAnimationActive={false}
                          stroke="none"
                        >
                          <Cell fill={item.bgColor} />
                        </Pie>
                        <Pie
                          data={item.pieData}
                          dataKey="value"
                          innerRadius={28}
                          outerRadius={42}
                          startAngle={90}
                          endAngle={-270}
                          cornerRadius={2}
                          isAnimationActive={false}
                          stroke="none"
                        >
                          <Cell fill={item.ringColor} />
                          <Cell fill="transparent" />
                        </Pie>
                      </PieChart>
                      <div className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-[#333] dark:text-white mb-4">
                        {item.percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="flex gap-4">
            <div className="w-[67%] rounded-xl h-[270px] flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <ApplicationChart />
              </div>
            </div>
            <div className="w-[33%] bg-white rounded-xl dark:bg-[#343434] h-[270px] flex flex-col">
              <Subject />
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434]">
            {/* Table wrapper: horizontal scroll */}
            <div className="overflow-x-auto scrollbar-none h-full">
              {/* Vertical scroll with fixed height */}
              <div className="overflow-y-auto h-[440px] rounded-xl scrollbar-none">
                <table className="min-w-full text-xs border-collapse table-fixed px-4">
                  {/* Table Head sticky */}
                  <thead className=" text-[12px] bg-[#4C6993] text-white dark:bg-[#44699d]">
                    <tr>
                      {[
                        "Name",
                        "Contact",
                        "Country",
                        "Course",
                        "Gender",
                        "Date",
                        "Time",
                        "Resume",
                        "Status",
                      ].map((col) => (
                        <th
                          key={col}
                          className="py-4 px-2 font-semibold text-left border border-[#466993] dark:border-[#466993]"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
  {applicants.map((applicant, index) => {
    let resumeUrl;
    let resumeError = false;
    
    // Safe resume URL generation with error handling
    try {
      resumeUrl = getResumeBlobUrl(applicant.uploadResume);
    } catch (error) {
      console.warn('Invalid resume data for applicant:', applicant._id, error);
      resumeError = true;
      resumeUrl = undefined;
    }

    return (
      <tr
        key={applicant._id}
        className={`text-[10px] px-2 py-4 border-none outline-none ${
          index % 2 === 0
            ? "bg-[#fff] dark:bg-[#2c2c2c]"
            : "bg-[#F8F8F8] dark:bg-[#303030]"
        }`}
      >
        <td className="py-4 px-2 text-left">
          {applicant.candidateFirstName}
        </td>
        <td className="py-2 px-2 text-left">
          {applicant.candidatePhoneNumber}
        </td>
        <td className="py-2 px-2 text-left">
          {applicant.candidateCountry}
        </td>
        <td className="py-2 px-2 text-left">
          {applicant.positionApplied}
        </td>
        <td className="py-2 px-2 text-left">
          {applicant.gender}
        </td>
        <td className="py-2 px-2 text-left">
          {formatDate(applicant.applicationDate)}
        </td>
        <td className="py-2 px-2 text-left">
          {applicant.preferedWorkingHours}
        </td>
        <td className="py-2 px-2 text-left">
          {resumeUrl && !resumeError ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38619A] hover:underline flex items-center gap-1"
            >
              <ImAttachment className="w-3 h-3" />
              Resume
            </a>
          ) : (
            <span className="text-gray-400 italic">
              {resumeError ? "Invalid Resume" : "No Resume"}
            </span>
          )}
        </td>
        <td className="py-2 px-2 text-left">
          <span className="text-gray-800 rounded-full dark:text-[#fff]">
            {applicant.applicationStatus}
          </span>
        </td>
      </tr>
    );
  })}
</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[310px] flex flex-col gap-4">
          {/* Calendar */}
          <div className="rounded-xl shadow-lg">
            <div className="h-[342px] bg-white rounded-xl flex items-center justify-center text-gray-400 dark:bg-[#343434]">
              <Calendar />
            </div>
          </div>
          {/* Teachers */}
          <div className="bg-white rounded-xl shadow-lg p-4 dark:bg-[#343434] h-[200px]">
            <h3 className="text-[16px] font-semibold text-gray-800 mb-1 dark:text-[#fff]">
              Teachers
            </h3>

            <div className="flex items-center justify-between mt-3">
              {/* Circular Chart */}
              <div className="relative w-[120px] h-[120px] flex items-center justify-center mb-5 -ml-0">
                <PieChart width={120} height={120}>
                  <Pie
                    data={[{ value: 100 }]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={38}
                    startAngle={90}
                    endAngle={-270}
                    fill="#f0f0f0"
                  />
                  {filteredPositions.map((item, index) => (
                    <Pie
                      key={index}
                      data={[
                        { value: item.count },
                        { value: total - item.count },
                      ]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={30 + index * (ringThickness + ringGap)}
                      outerRadius={
                        30 + index * (ringThickness + ringGap) + ringThickness
                      }
                      startAngle={90}
                      endAngle={-270}
                      cornerRadius={5}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      <Cell fill={item.color} stroke="none" />
                      <Cell fill="transparent" stroke="none" />
                    </Pie>
                  ))}
                </PieChart>

                {/* Center Total Teachers Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="text-[16px] font-bold text-[#010E30] dark:text-[#fff]">
                    {totals}
                  </span>
                  <p className="text-[8px] text-[#010E30] dark:text-[#fff] text-center">
                    Number of Teachers
                  </p>
                </div>
              </div>

              {/* Teacher Stats */}
              <div className="space-y-3 mr-1">
                {filteredPositions.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between w-32 dark:text-[#fff]"
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-[11px] text-[#010E30CC] font-semibold dark:text-[#fff]">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[#010E30CC] text-[10px] font-medium dark:text-[#fff]">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-lg p-4 dark:bg-[#343434] h-[320px]">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[16px] font-semibold text-gray-700 dark:text-[#ffff]">
                Schedule
              </h3>
              <button className="px-2 py-1 bg-[#efefef] rounded flex items-center gap-1 text-[10px] dark:bg-[#747474]">
                Today <span className="text-[#747474]">▼</span>
              </button>
            </div>

            {/* Timeline */}
            <div className="relative pl-4 space-y-4 h-[260px] overflow-y-auto scrollbar-none">
              {/* Vertical dotted line */}

              {todayMeetings.map((item, index) => {
                const colors = colorMap[index % colorMap.length];

                return (
                  <div
                    key={item.title + index}
                    className="flex items-start gap-3 relative"
                  >
                    {/* Time */}
                    <span className="text-[10px] text-gray-500 w-[50px] mt-[22px] dark:text-[#ffff]">
                      {item.time}
                    </span>

                    {/* Dot */}
                    <div className="absolute left-[65px] top-0 bottom-0 border-l-2 border-dotted border-gray-300 z-0"></div>

                    <div
                      className="w-[8px] h-[8px] rounded-full mt-[25px] z-10"
                      style={{ backgroundColor: colors.dot }}
                    ></div>

                    {/* Meeting Box */}
                    <div
                      className="flex items-center px-3 py-2 rounded-lg flex-1 text-[10px] font-medium gap-2 "
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                      }}
                    >
                      <img
                        src={colors.icon}
                        alt="icon"
                        className="w-4 h-4 object-contain"
                      />
                      {item.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout3>
  );
}
