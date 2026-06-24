"use client";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";


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



interface CourseBar {
  name: string;
  value: number;
  color: string;
}

interface TotalTrailclassData {
  name: string;
  value: number;
  color: string;
}


const STATUS_COLORS = [
  { name: "Completed", color: "#B6C6F5" },
  { name: "Scheduled", color: "#6CA8F7" },
  { name: "No Response", color: "#A7D3F5" },
  { name: "Cancelled", color: "#C6E2F9" },
];

const TotalScheduledChart = () => {
  const [totalTrailclass, setTotalTrailclass] = useState<TotalTrailclassData[]>(
    []
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchChartData(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchChartData = async (token: string) => {
    try {
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TOTAL_TRAIL_CLASS}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const apiData = await response.json();
      console.log('apida', apiData);
  
      // Defensive: Only proceed if apiData exists
      const evalData = apiData.evaluation;

      if (evalData) {
        const chartArray: TotalTrailclassData[] = [
          {
            name: "Completed",
            value: evalData.completedCount || 0,
            color: STATUS_COLORS[0].color,
          },
          {
            name: "Scheduled",
            value: evalData.pendingCount || 0,
            color: STATUS_COLORS[1].color,
          },
          {
            name: "No Response",
            value: evalData.studentNotJointCount || 0,
            color: STATUS_COLORS[2].color,
          },
          {
            name: "Cancelled",
            value: evalData.studentNotJointCount || 0,
            color: STATUS_COLORS[3].color,
          },
        ];
      
        setTotalTrailclass(chartArray);
      } else {
        setTotalTrailclass([]);      
        console.warn("No valid trial class data received.");
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };
  

  return (
    <div className="flex flex-col w-full h-full dark:bg-[#343434]">
      {/* Title */}
      <div className="text-[#010E30] text-[13px] font-semibold dark:text-white mb-6">
      Trial Class Status
      </div>
      <div className="flex flex-row items-center justify-between">
        {/* Legend */}
        <div className="flex flex-col gap-4">
          {totalTrailclass.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              ></span>
              <div className="flex flex-col">
                <span className="font-medium text-[11px] text-[#1A2341] dark:text-white">
                  {entry.name}
                </span>
                <span className="text-[10px] text-[#7A869A] dark:text-white">
                  {entry.value}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Donut Chart */}
        <div
          className="relative flex items-center justify-center"
          style={{ minWidth: 140, minHeight: 140 }}
        >
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={totalTrailclass}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={65}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                cornerRadius={8}
                isAnimationActive={false}
              >
                {totalTrailclass.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-[#1A2341] dark:text-[#fff]">
              {totalTrailclass.reduce((sum, entry) => sum + entry.value, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white text-gray-900 text-sm px-2 py-1 rounded shadow-md border">
        {payload[0]?.value}
      </div>
    );
  }
  return null;
};

const CoursesChart = () => {
  const [chartData, setChartData] = useState<CourseBar[]>([]);

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
    const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TOTAL_TRAIL_CLASS}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    const apiData = await response.json();
    console.log("joined,notjoined", apiData);
  
    const transformedData: CourseBar[] = [
      {
        name: "Joined",
        value: apiData.students || 0,
        color: "#9FD0FF",
      },
      {
        name: "Not Joined",
        value: apiData.evaluation?.studentNotJointCount || 0,
        color: "#AFC0FF",
      },
      {
        name: "No Response",
        value: apiData.evaluation?.studentNotJointCount || 0,
        color: "#78A1DB",
      },
    ];
  
    setChartData(transformedData);
  };
  

  return (
    <div>
      <h2 className="text-[13px] font-semibold text-[#010E30] dark:text-[#fff]">
        Student Status
      </h2>

      <ResponsiveContainer width="100%" height={198}>
        <BarChart data={chartData} barCategoryGap={30}>
          <Tooltip
            content={<CustomTooltip active={undefined} payload={undefined} />}
            wrapperStyle={{
              backgroundColor: "transparent",
              border: "none",
              boxShadow: "none",
              padding: 0,
            }}
            cursor={{ fill: "transparent" }}
          />
          <Bar dataKey="value" radius={[15, 15, 15, 15]} barSize={25}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-center mt-4 space-x-6">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center space-x-2">
            <div
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-[10px] text-[#010E30] dark:text-[#fff] font-medium">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

//Teacher Assigned - Not Assigned

const TEACHER_COLORS = ["#9FD0FF", "#AFC0FF", "#78A1DB"];

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

const PreferredTeachersCard = () => {
  const [teacherData, setTeacherData] = useState({
    total: 0,
    assignedTeacherCount: 0,
    notAssinedCount: 0,
    assignedTeacherPercentage: "0",
    notAssignedTeacherPercentage: "0",
  });

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
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.TEACHER_STATUS}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setTeacherData(data);
    } catch (err) {
      console.error("Error fetching teacher status:", err);
    }
  };

  // Direct counts from backend
  const assigned = teacherData.assignedTeacherCount;
  const notassigned = teacherData.notAssinedCount;
  const total = teacherData.total;

  // Percentages also come from backend
  const assignedPercent = Math.round(parseFloat(teacherData.assignedTeacherPercentage));
  const notAssignedPercent = Math.round(parseFloat(teacherData.notAssignedTeacherPercentage));

  // Pie angles
  const assignedAngles = {
    start: -90,
    end: -90 + (assigned / (total || 1)) * 360,
  };

  const notAssignedAngles = {
    start: assignedAngles.end,
    end: 270,
  };

  const assignedLabelPos = getPieLabelPosition(
    75, 75, 0, 55, assignedAngles.start, assignedAngles.end
  );

  const notAssignedLabelPos = getPieLabelPosition(
    75, 75, 0, 50, notAssignedAngles.start, notAssignedAngles.end
  );

  return (
    <div>
      <div>
        <h2 className="text-[13px] font-semibold text-[#010E30] dark:text-[#fff]">
          Teacher Assigned - Not Assigned
        </h2>

        <div className="relative flex items-center justify-center -ml-2 mt-2">
          <PieChart width={150} height={150}>

            {/* Assigned Segment */}
            <Pie
              data={[{ name: "Assigned", value: assigned }]}
              cx={75}
              cy={75}
              innerRadius={0}
              outerRadius={55}
              startAngle={assignedAngles.start}
              endAngle={assignedAngles.end}
              dataKey="value"
              strokeWidth={0}
              fill={TEACHER_COLORS[0]}
            />
            {assigned > 0 && (
              <text
                x={assignedLabelPos.x}
                y={assignedLabelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14px"
                fontWeight="bold"
                fill="#fff"
              >
                {assignedPercent}%
              </text>
            )}

            {/* Not Assigned Segment */}
            <Pie
              data={[{ name: "Not Assigned", value: notassigned }]}
              cx={75}
              cy={75}
              innerRadius={0}
              outerRadius={50}
              startAngle={notAssignedAngles.start}
              endAngle={notAssignedAngles.end}
              dataKey="value"
              strokeWidth={0}
              fill={TEACHER_COLORS[1]}
            />
            {notassigned > 0 && (
              <text
                x={notAssignedLabelPos.x}
                y={notAssignedLabelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13px"
                fontWeight="bold"
                fill="#fff"
              >
                {notAssignedPercent}%
              </text>
            )}

            {/* Outline */}
            <Pie
              data={[{ name: "Assigned", value: assigned }]}
              cx={75}
              cy={75}
              innerRadius={58}
              outerRadius={62}
              startAngle={assignedAngles.start}
              endAngle={assignedAngles.end}
              dataKey="value"
              strokeWidth={0}
              fill={TEACHER_COLORS[2]}
            />

          </PieChart>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-1 w-full mt-10">
          <div className="flex flex-col items-center text-start">
            <div className="flex items-center gap-[5px]">
              <div
                className="w-[12px] h-[12px] rounded-[2px]"
                style={{ backgroundColor: TEACHER_COLORS[0] }}
              ></div>
              <span className="text-[10px] font-medium text-[#010E30] dark:text-[#fff]">
                Assigned
              </span>
            </div>
            <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-[#fff]">
              {assigned}
            </div>
          </div>

          <div className="flex flex-col items-center text-start">
            <div className="flex items-center gap-[5px]">
              <div
                className="w-[12px] h-[12px] rounded-[2px]"
                style={{ backgroundColor: TEACHER_COLORS[1] }}
              ></div>
              <span className="text-[10px] font-medium text-[#010E30] dark:text-[#fff]">
                Not Assigned
              </span>
            </div>
            <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-[#fff]">
              {notassigned}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const TrialByTeachers = () => {
  const [teachers, setTeachers] = useState<
    { teacherName: string; trialClassCount: number; joinedStudentsCount: number; _id: string }[]
  >([]);

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

  const fetchData = (token: string) => {
    fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_STUDENT_COUNT}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTeachers(data.data);
        } else {
          console.error("Data fetch was unsuccessful:", data);
        }
      })
      .catch((err) => console.error("Failed to fetch teachers:", err));
  };

  return (
    <div className="py-2 p-1 w-full max-w-xs">
      <h2 className="text-[13px] font-semibold text-[#010E30] dark:text-[#fff]">
        Trial By Teachers
      </h2>
      <div className="overflow-x-auto max-h-[285px] overflow-y-auto custom-scrollbar scrollbar-none scrollbar-thumb-[#7689BD] scrollbar-track-[#E5E7EB]">
        <table className="min-w-full text-left mt-5">
          <thead>
            <tr className="text-[11px]">
              <th className="bg-[#4C6993] text-white px-2 py-2 rounded-l-md font-medium">
                Teacher Name
              </th>
              <th className="bg-[#4C6993] text-white px-2 py-2 font-medium">Trials</th>
              <th className="bg-[#4C6993] text-white px-2 py-2 rounded-r-md font-medium">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher, idx) => (
              <tr
                key={teacher._id}
                className="border-b dark:border-b-[#535252]"
              >
                <td className="px-4 py-2 text-[#010E30] dark:text-[#fff] text-[10px]">
                  {teacher.teacherName}
                </td>
                <td className="px-4 py-2 text-[#010E30] dark:text-[#fff] text-[10px]">
                  {teacher.trialClassCount ?? 0}
                </td>
                <td className="px-4 py-2 text-[#010E30] dark:text-[#fff] text-[10px]">
                  {teacher.joinedStudentsCount ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-full w-full px-2 py-4 md:mr-10 scrollbar-none">
      <div className="bg-white dark:bg-[#343434] p-4 rounded-2xl shadow-md h-full w-full">
        <TotalScheduledChart />
      </div>
      <div className="bg-white dark:bg-[#343434] p-4 rounded-2xl shadow-md h-full w-full">
        <CoursesChart />
      </div>
      <div className="bg-white dark:bg-[#343434] p-4 rounded-2xl shadow-md h-full w-full">
        <PreferredTeachersCard />
      </div>
      <div className="bg-white dark:bg-[#343434] p-2 rounded-2xl shadow-md h-full w-full">
        <TrialByTeachers />
      </div>
    </div>
  );
}
