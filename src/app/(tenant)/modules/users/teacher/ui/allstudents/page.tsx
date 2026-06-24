"use client";
import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import React, { useState, useEffect } from "react";
import GroupStudents from "./GroupStudents/page";
import RegularStudents from "./RegularStudents/page";
import TeacherHeader from "../../components/TeacherHeader";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// Import the interfaces
export interface AssignmentItem {
  assignmentId?: string;
  assignmentType: string;
  status: string;
  assignmentName: string;
  title: string;
}

export interface StudentCoreInfo {
  studentId: string;
  name: string;
}

export interface EvaluationStudentInfo {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentGender: string;
  studentPhone: number;
  studentCity: string;
  studentCountry: string;
  studentCountryCode: string;
  learningInterest: string;
  numberOfStudents: number;
  preferredTeacher: string;
  preferredFromTime: string;
  preferredToTime: string;
  timeZone: string;
  referralSource: string;
  preferredDate: string;
  evaluationStatus: string;
  status: string;
  createdDate: string;
  createdBy: string;
}

export interface EvaluationTeacherInfo {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

export interface EvaluationSubscriptionInfo {
  subscriptionName: string;
}

export interface StudentEvaluationDetails {
  sessionClassType: string;
  student: EvaluationStudentInfo;
  teacher: EvaluationTeacherInfo;
  subscription: EvaluationSubscriptionInfo;
  _id: string;
  academicCoachId: string;
  classType: string;
  classDay: string[];
  startTime: string[];
  endTime: string[];
  isLanguageLevel: boolean;
  languageLevel: string;
  isReadingLevel: boolean;
  readingLevel: string;
  isGrammarLevel: boolean;
  grammarLevel: string;
  hours: number;
  planTotalPrice: number;
  classStartDate: string;
  classEndDate: string;
  classStartTime: string;
  classEndTime: string;
  accomplishmentTime: string;
  studentRate: number;
  gardianName: string;
  gardianEmail: string;
  gardianPhone: string;
  gardianCity: string;
  gardianCountry: string;
  gardianTimeZone: string;
  gardianLanguage: string;
  assignedTeacher: string;
  studentStatus: string;
  classStatus: string;
  comments: string;
  trialClassStatus: string;
  invoiceStatus: string;
  paymentLink: string;
  paymentStatus: string;
  teacherStatus: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  expectedFinishingDate: number;
  assignedTeacherId: string;
  assignedTeacherEmail: string;
  __v: number;
}

export interface StudentWithAssignments extends StudentCoreInfo {
  studentDetails: StudentEvaluationDetails;
  classType: string;
  groupClassId: string;
  assignment: AssignmentItem[];
}

const Page = () => {
  const [activeTab, setActiveTab] = useState("regular");
  const [regularCount, setRegularCount] = useState<number>(0);
  const [groupCount, setGroupCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherId = localStorage.getItem("TeacherPortalId");
        const token = localStorage.getItem("TeacherAuthToken");

        if (!token || !teacherId) {
          console.warn("Missing teacherId or token");
          return;
        }

        console.log("Fetching data for teacherId:", teacherId);

        const res = await axios.get<StudentWithAssignments[]>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASS_LIST}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            params: { teacherId },
          }
        );

        const allAssignments = res.data;
        console.log("API Response:", allAssignments);

        const uniqueMap = new Map<string, StudentWithAssignments>();
        for (const assign of allAssignments) {
          if (!uniqueMap.has(assign.studentId)) {
            uniqueMap.set(assign.studentId, assign);
          } else {
            console.log("Duplicate student skipped:", assign.studentId);
          }
        }

        const uniqueList = Array.from(uniqueMap.values());

        const regular = uniqueList.filter(
          (student) =>
            student.studentDetails?.classType?.toUpperCase() === "REGULARCLASS"
        );

        const group = uniqueList.filter(
          (student) =>
            student.studentDetails?.classType?.toUpperCase() === "GROUPCLASS"
        );

        const uniqueGroupIds = new Set(group.map(student => student.groupClassId || 'no-group'));
        setGroupCount(uniqueGroupIds.size);

        setRegularCount(regular.length);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <BaseLayout>
      <div>
        <TeacherHeader currentSection="Assignments" />
        <div className="flex space-x-6 px-4 py-2 rounded-md relative">
          <button
            onClick={() => setActiveTab("regular")}
            className={`relative pb-2 ${
              activeTab === "regular" ? "text-[#576CBC] font-semibold" : "text-[#010E30] dark:text-[#ffffff]"
            }`}
          >
            Regular Class ({regularCount})
            {activeTab === "regular" && (
              <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-[80px] h-[2px] bg-[#576CBC] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("group")}
            className={`relative pb-2 ${
              activeTab === "group" ? "text-[#576CBC] font-semibold" : "text-[#010E30] dark:text-[#ffffff]"
            }`}
          >
            Group Class ({groupCount})
            {activeTab === "group" && (
              <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-[80px] h-[2px] bg-[#576CBC] rounded-full"></span>
            )}
          </button>
        </div>

        {/* Render full pages here based on tab */}
        <div className="mt-4">
          {activeTab === "regular" && <RegularStudents />}
          {activeTab === "group" && <GroupStudents />}
        </div>
      </div>
    </BaseLayout>
  );
};

export default Page;
