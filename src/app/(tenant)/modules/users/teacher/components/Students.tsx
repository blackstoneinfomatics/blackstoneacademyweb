'use client';

import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';
import { AppFailureToastMessages } from '@/app/_components/contents/toast_message';
import { AppValidationMessages } from '@/app/_components/contents/validation_message';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export interface TeacherAnalytics {
  _id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  studentCount: number;
  maleCount: number;
  femaleCount: number;
}
export interface TeacherAnalyticsResponse {
  success: boolean;
  data: TeacherAnalytics[];
}
const StudentsCard: React.FC = () => {
  const [teacher, setTeacher] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('TeacherAuthToken');
      const teacherId = localStorage.getItem('TeacherPortalId');

            if (!teacherId) {
                      toast.error(
                        AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_TEACHER_ID
                      );
                      setLoading(false);
                      return;
                    }
            
             if (!token) {
                      toast.error(
                        AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_TOKEN
                      );
                      setLoading(false);
                      return;
                    }

      const response = await axios.get<TeacherAnalyticsResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_STUDENT_COUNT}?teacherId=${teacherId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data.length > 0) {
        setTeacher(response.data.data[0]);
      }
    } catch (error) {
  console.error(
    AppFailureToastMessages.TEACHER_ANALYTICS_FETCH,
    error
  );

  toast.error(
    AppFailureToastMessages.TEACHER_ANALYTICS_FETCH
  );
} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const getPercentage = (count: number, total: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  if (loading)
    return (
      <div className="bg-white dark:bg-[#343434] rounded-xl shadow-md w-full h-full p-4">
        Loading...
      </div>
    );

  if (!teacher)
    return (
      <div className="bg-white dark:bg-[#343434] rounded-xl shadow-md w-full h-full p-4">
        No teacher data found
      </div>
    );

  const malePercent = getPercentage(teacher.maleCount, teacher.studentCount);
  const femalePercent = 100 - malePercent;

  // Angles
  const femaleAngle = (femalePercent / 100) * 360;
  const maleAngle = (malePercent / 100) * 360;
  const center = 50;
  const outerRadius = 40; 
  const innerRadius = 35; 
  const labelRadius = (outerRadius + innerRadius) / 2; 
  const femaleMidAngle = femaleAngle / 2;
  const femaleX = center + labelRadius * Math.cos((femaleMidAngle * Math.PI) / 180);
  const femaleY = center - labelRadius * Math.sin((femaleMidAngle * Math.PI) / 180);
  const maleMidAngle = femaleAngle + maleAngle / 2;
  const maleX = center + labelRadius * Math.cos((maleMidAngle * Math.PI) / 180);
  const maleY = center - labelRadius * Math.sin((maleMidAngle * Math.PI) / 180);

  return (
    <div className="bg-white dark:bg-[#343434] rounded-xl shadow-md w-full p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-[#010E30] dark:text-white">Students</h2>
        <div className="flex gap-3 text-xs font-medium">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#F2A9F3]"></span>
            <span className="text-[#010E30] dark:text-white">Female</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#83DBFC]"></span>
            <span className="text-[#010E30] dark:text-white">Male</span>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="relative mx-auto w-40 h-40">
        {/* Donut Segment */}
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(#F2A9F3 0% ${femalePercent}%, #83DBFC ${femalePercent}% 100%)`,
          }}
        ></div>

        {/* Inner Circle */}
        <div className="absolute top-1/2 left-1/2 w-[50%] h-[50%] bg-white dark:bg-[#343434] rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <span className="text-lg font-bold text-[#010E30] dark:text-white">
            100%
          </span>
        </div>

        {/* Female % label */}
        {femalePercent > 0 && (
          <div
            className="absolute text-xs font-semibold text-[#010E30]"
            style={{
              top: `${femaleY}%`,
              left: `${femaleX}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {femalePercent}%
          </div>
        )}

        {/* Male % label */}
        {malePercent > 0 && (
          <div
            className="absolute text-xs font-semibold text-[#010E30]"
            style={{
              top: `${maleY}%`,
              left: `${maleX}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {malePercent}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsCard;
