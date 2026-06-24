'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';
import { AppValidationMessages } from '@/app/_components/contents/validation_message';
import { toast } from 'react-toastify';
import { AppFailureToastMessages } from '@/app/_components/contents/toast_message';

const TeachingActivity: React.FC = () => {
  const [monthlyHours, setMonthlyHours] = useState<number[]>(Array(12).fill(0));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('TeacherAuthToken') : null;
        const teacherId = localStorage.getItem('TeacherPortalId');

        if (!teacherId) {
  toast.error(
    AppValidationMessages.AUTH.TEACHER_REQUIRED
  );
  return;
}

if (!token) {
  toast.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  return;
}

        const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const filteredData = response.data.students.filter(
          (item: any) => item.teacher.teacherId === teacherId
        );

        const monthlyData = Array(12).fill(0);

        filteredData.forEach((schedule: any) => {
          if (!schedule.startDate || !schedule.startTime || !schedule.endTime) return;

          const startDate = new Date(schedule.startDate);
          const monthIndex = startDate.getMonth();

          schedule.classDay.forEach((_: any, index: number) => {
            if (!schedule.startTime[index] || !schedule.endTime[index]) return;

            const startHour = parseInt(schedule.startTime[index].split(':')[0], 10);
            const endHour = parseInt(schedule.endTime[index].split(':')[0], 10);

            if (isNaN(startHour) || isNaN(endHour)) return;

            monthlyData[monthIndex] += Math.max(0, endHour - startHour);
          });
        });

        setMonthlyHours(monthlyData);
      }catch (error) {
  toast.error(
    AppFailureToastMessages.TEACHING_ACTIVITY_FETCH
  );

  console.error("Error fetching teaching activity:", error);
}
    };

    fetchData();
  }, []);

  const width = 1000;
  const height = 160;
  const padding = 20;
  const max = Math.max(...monthlyHours, 1);

  const points = monthlyHours.map((val, i) => {
    const x = (i / 11) * width;
    const y = height - (val / max) * (height - padding);
    return { x, y };
  });

  const getSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';

    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = (pts[i - 1].x + pts[i].x) / 2;
      const cp1y = pts[i - 1].y;
      const cp2x = (pts[i - 1].x + pts[i].x) / 2;
      const cp2y = pts[i].y;
      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${pts[i].x},${pts[i].y}`;
    }

    return d;
  };

  const curvePath = getSmoothPath(points);
  const areaPath = `${curvePath} L${width},${height} L0,${height} Z`;

  return (
    <div className="bg-white h-full dark:bg-[#343434] rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[16px] dark:text-white font-semibold text-[#0f172a]">
          Teaching Activity
        </h2>
        <select className="bg-[#EFEFEF] dark:bg-[#565656] text-[#3E5E8A] dark:text-white py-[2px] px-2 rounded-md text-[11px] font-medium">
          <option>Monthly</option>
          <option>Weekly</option>
        </select>
      </div>

      {/* Graph */}
      <div className="flex">
        {/* Y-Axis */}
        <div className="flex flex-col justify-between text-xs text-slate-400 dark:text-gray-400 mr-3 h-[160px] pt-2 pb-4">
          {['50', '40', '30', '20', '10', '0'].map((label, i) => (
            <div key={i} className="h-[26px] flex items-center justify-end pr-1">
              <span className="block leading-none">L{label}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="relative flex-1 h-[160px]">
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area under the line */}
            <path d={areaPath} fill="url(#greenGradient)" stroke="none" />
            {/* Curved Line */}
            <path d={curvePath} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4" />
            {/* Dots */}
            {points.map((point, idx) => (
              <circle
                key={idx}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#22c55e"
                stroke="#fff"
                strokeWidth="1.5"
              />
            ))}
            {/* Grid lines */}
            {[32, 64, 96, 128].map((y) => (
              <line key={y} x1="0" y1={y} x2={width} y2={y} stroke="#e2e8f0" strokeWidth="0.6" />
            ))}
          </svg>
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-300 mt-2 px-4">
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
          (month) => (
            <span key={month} className="w-[8%] text-center">
              {month}
            </span>
          )
        )}
      </div>
    </div>
  );
};

export default TeachingActivity;
