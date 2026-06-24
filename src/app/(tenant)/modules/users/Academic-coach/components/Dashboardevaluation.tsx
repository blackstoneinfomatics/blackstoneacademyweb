'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type StudentData = {
  id: number;
  name: string;
  mobile: string;
  country: string;
  preferredTeacher: string;
  date: string;
  time: string;
};

const StudentEvaluation = () => {
  const [evaluationList, setEvaluationList] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const academicId = localStorage.getItem("AcademicCoachPortalId");
    console.log("academicId>>", academicId);
     const token =
    typeof window !== "undefined" ? localStorage.getItem("AcademicCoachAuthToken") : null;

  if (!token) {
    console.error("❌ AdminAuthToken not found");
    return;
  }
    axios
      .get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.GET_LIST}`, {
        params: { academicCoachId: academicId },
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          },
      })
      .then((response) => {
        if (!response.data) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.data;
      })
      .then((data) => {
        const formattedData: StudentData[] = data.evaluation.map(
          (
            item: {
              student: {
                studentFirstName: string;
                studentLastName: string;
                studentPhone: string;
                studentCountry: string;
                preferredTeacher: string;
                preferredDate: string;
                preferredFromTime: string;
                preferredToTime: string;
              };
            },
            index: number
          ) => ({
            id: index + 1,
            name: `${item.student.studentFirstName} ${item.student.studentLastName}`,
            mobile: item.student.studentPhone,
            country: item.student.studentCountry,
            preferredTeacher: item.student.preferredTeacher,
            date: new Date(item.student.preferredDate).toLocaleDateString(),
            time: `${item.student.preferredFromTime} - ${item.student.preferredToTime}`,
          })
        );
        setEvaluationList(formattedData.slice(-5)); // Keep only the latest 5 records
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="col-span-12 bg-[#CED4DC] p-0 rounded-[20px] shadow mb-2">
      <h3 className="text-[13px] font-semibold ml-4 mt-2 text-[#000] mb-2">
        Student Evaluation
      </h3>
      <table className="w-full">
        <thead>
          <tr className="text-center border-b text-[11px] font-semibold">
            <th className="p-1">Trial</th>
            <th className="p-1">Name</th>
            <th className="p-1">Mobile</th>
            <th className="p-1">Country</th>
            <th className="p-1">Preferred Teacher</th>
            <th className="p-1">Date</th>
            <th className="p-1">Time</th>
          </tr>
        </thead>
        <tbody>
          {evaluationList.map((item) => (
            <tr key={item.id} className="border-b text-[9px] text-center">
              <td className="p-1">{item.id}</td>
              <td className="p-1">{item.name}</td>
              <td className="p-1">{item.mobile}</td>
              <td className="p-1">{item.country}</td>
              <td className="p-1">{item.preferredTeacher}</td>
              <td className="p-1">{item.date}</td>
              <td className="p-1">{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentEvaluation;
