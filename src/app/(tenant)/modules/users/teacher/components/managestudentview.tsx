'use client';

import { useRouter } from 'next/navigation';
import BaseLayout from '@/app/(tenant)/modules/users/teacher/components/BaseLayout';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';
import { AppValidationMessages } from '@/app/_components/contents/validation_message';
import { toast } from 'react-toastify';
import { AppFailureToastMessages } from '@/app/_components/contents/toast_message';

const ManageStudentView = () => {
  const router = useRouter();
 const [studentData, setStudentData] = useState<StudentData>();
  
 interface StudentData {
  studentDetails: {
    _id: string;
    student: {
      studentId: string;
      studentEmail: string;
      studentPhone: number;
    };
    username: string;
    password: string;
    role: string;
    status: string;
    createdDate: string;
    createdBy: string;
    updatedDate: string;
    __v: number;
  };
  studentEvaluationDetails: {
    student: {
      studentId: string;
      studentFirstName: string;
      studentLastName: string;
      studentEmail: string;
      studentPhone: number;
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
    };
    subscription: {
      subscriptionName: string;
    };
    _id: string;
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
    status: string;
    createdDate: string;
    createdBy: string;
    updatedDate: string;
    updatedBy: string;
    expectedFinishingDate: number;
    assignedTeacherId: string;
    assignedTeacherEmail: string;
    __v: number;
  };
}
  useEffect(()=>{
    const studentId=localStorage.getItem('studentviewcontrol');
    console.log(">>>>>",studentId);
    
    if (studentId) {
      const fetchData = async () => {
        try {
          const token =
    typeof window !== "undefined" ? localStorage.getItem("TeacherAuthToken") : null;

if (!token) {
  toast.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  return;
}
          const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}/${studentId}`,
            {
                headers:{
                 'Content-Type': 'application/json',
        "Authorization":`Bearer ${token}`,
          }
            }
          );
          const data = await response.json();
          setStudentData(data);
          console.log(data);

          if (!data) {
  toast.error(
    AppValidationMessages.STUDENT
      .STUDENT_DATA_NOT_FOUND
  );
  return;
}

        } catch (error) {
  console.error(error);

  toast.error(
    AppFailureToastMessages.STUDENT_FETCH
  );
}
      };
      fetchData();
    }
  },[]);
        
  return (
    <BaseLayout>
      <div className="flex flex-col md:flex-row pt-14 mt-8">
        <div className="p-2">
          <IoArrowBackCircleSharp 
            className="text-[25px] bg-[#fff] rounded-full text-[#012a4a] cursor-pointer" 
            onClick={() => router.push('allstudents')}
          />
        </div>
        <div className="flex flex-col items-center bg-[#fff] shadow-lg rounded-2xl md:w-[300px] h-[600px]">
          <div className="bg-[#012a4a] align-middle p-6 w-full h-1/4 rounded-t-2xl">
            
            <div className="justify-center">
              <Image
                src="/assets/images/student-profile.png"
                alt="Profile"
                className="rounded-full justify-center align-middle text-center ml-20 w-24 h-24 mb-4 mt-[73px]"
                width={150}
                height={150}
              />
            </div>
            <div className="justify-center text-center border-b-2 border-b-black">
              <h2 className="text-2xl font-semibold mb-2"> </h2>
              <p className="text-[#012A4A] mb-4">Student</p>
            </div>

            <div className="text-left w-full p-2 pt-6">
              <h3 className="font-semibold mb-2">Personal Info</h3>
              <p className="text-gray-800 text-[14px] mt-4">
                <span className="font-semibold text-[14px]">Full Name: </span>{studentData?.studentDetails.username}
              </p>
              <p className="text-gray-800 text-[14px] mt-3">
                <span className="font-semibold text-[14px]">Email: </span>{studentData?.studentEvaluationDetails?.student?.studentEmail}
              </p>
              <p className="text-gray-800 text-[13px] mt-3">
                <span className="font-semibold text-[14px]">Phone Number: </span>{studentData?.studentEvaluationDetails?.student?.studentPhone}
              </p>
              <p className="text-gray-800 text-[14px] mt-3">
                <span className="font-semibold text-[14px]">Level: </span>
              </p>
              <p className="text-gray-800 text-[14px] mt-3">
                <span className="font-semibold text-[14px]">Package: </span>{studentData?.studentEvaluationDetails?.subscription?.subscriptionName}
              </p>
              
            </div>
          </div>
        </div>
     
      </div>

     
    </BaseLayout>
  );
};

export default ManageStudentView;