'use client';

import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import { getSocket } from "@/app/utils/socket";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface TeacherData {
  _id: string | null;
  teacherName: string;
  teacherEmail: string;
  studentCount: number;
  joinedStudentsCount: number;
  maleCount:string;
  femaleCount:string;
}

interface ApiResponse {
  data: TeacherData[];
}

export default function Academic() {
  const [teachersData, setTeachersData] = useState<TeacherData[]>([]);
    useEffect(()=>{
     const academicId = typeof window !== "undefined"
            ? localStorage.getItem("AcademicCoachPortalId")
            : null;
            if(!academicId) return;
        const socket = getSocket(academicId);
        const handlecount =(data : TeacherData)=>{
            console.log("📩 Received WebSocket Data:", data);
            setTeachersData((pre)=>
              pre.map((app)=>
                app._id?.toString() === data._id?.toString() ? {...app , studentCount : data.studentCount} : app
              )
          )    
        };
        socket.on("academicDashboardTeachersStudentCount",handlecount);
        return()=>{
        socket.off("academicDashboardTeachersStudentCount",handlecount);
        }
    },[]);
  useEffect(() => {
    const fetchTeachersData = async () => {
      try {
          const token =
    typeof window !== "undefined" ? localStorage.getItem("AcademicCoachAuthToken") : null;

  if (!token) {
    console.error("❌ AdminAuthToken not found");
    return;
  }
        const teacherId = "some_teacher_id";
        const response = await axios.get<ApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_STUDENT_COUNT}?teacherId=${teacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              },
          }
        );
        setTeachersData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchTeachersData();
  }, []);

  return (
    <Link
      href="/modules/users/Academic-coach/ui/manageteacher"
    >
      <div className="col-span-12 p-2 text-[#000] dark:text-[#fff]">
        <h3 className="text-[16px] font-semibold text-[#000] dark:text-[#fff] mb-1 px-3 py-2 justify-between flex items-center">
         <div>Teachers</div>
         <div>Students</div>
        </h3>
        <div className="overflow-y-scroll h-[275px] scrollbar-none px-2">
          <table className="min-w-full">
            <tbody className="mb-1">
              {teachersData.map((teacher) => (
                <tr key={teacher._id ?? teacher.teacherEmail}>
                  <div className="justify-between items-center flex border-b-[1px]  dark:border-[#585858] px-2 py-1">
                  <td className=" py-1 text-center text-[12px] font-normal flex text-[#010e30] opacity-90 dark:text-[#fff]">
                    {(() => {
                      const val = teacher.teacherName ?? "";
                      return val
                        ? `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()}`
                        : "";
                    })()}
                  </td>
                  <td className=" py-1 text-[13px] whitespace-nowrap text-center text-[#010e30] dark:text-[#fff] font-medium">
                    {teacher.joinedStudentsCount}
                  </td>
                  </div>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Link>
  );
}
