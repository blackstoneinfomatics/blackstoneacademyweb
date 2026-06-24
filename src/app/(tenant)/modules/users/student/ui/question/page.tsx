"use client";

import React, { useEffect, useState } from "react";
import StudentHeader from "../../components/StudentHeader";
import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import {
  ImageQuestionCard,
  MatchWordCard,
  QuizAnswerCard,
  QuizTrueOrFalseAnswerCard,
  ReadingAnswerCard,
  WritingAnswerCard,
} from "../../components/viewAssignment";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

export interface Assignment {
  _id?: string;
  studentId: string;
  studentName: string;
  sessionClassType?: string;
  assignmentName: string;
  questionName: string;
  questionType: string;
  typeofQuestion: string;
  title: string;
  assignedTeacher?: string;
  assignedTeacherId?: string;
  assignmentId?: string;

  assignmentType: {
    type:
      | "quiz"
      | "writing"
      | "reading"
      | "image identification"
      | "word match";
    name?: string;
  };
  chooseType?: boolean;
  trueorfalseType?: boolean;
  question: string;
  hasOptions?: boolean;
  options?: {
    optionOne?: string;
    optionTwo?: string;
    optionThree?: string;
    optionFour?: string;
  };

  audioFile?: string;
  uploadFile?: string;
  status: string;

  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  level?: string;
  courses?: string;
  assignedDate: string;
  dueDate: string;
  answer?: string;
  answerValidation: string;
  assignmentStatus: string;
  commends?: string;
  score?: number;
  rating?: string;
}

export default function Page() {
  const [assignments, setAssignments] = useState<Assignment>();
  const search = useSearchParams();
  const assignmentId = search.get('assignmentId');

useEffect(() => {
  const fetchAssignment = async () => {
    const assignmentId = search.get('id'); 
    if (!assignmentId) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("StudentAuthToken") : null;

    if (!token) {
      toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      return;
    }

    try {
      const res = await axios.get<Assignment>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_LIST}/${assignmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          params: {
            assignmentId: assignmentId // optional: if your backend expects it here too
          }
        }
      );
      setAssignments(res.data);
    } catch (error) {
      toast.error(AppFailureToastMessages.ASSIGNMENT_FETCH);
    }
  };

  fetchAssignment();
}, []);


useEffect(() => {
  // assignment data updated
}, [assignments]);

  const optionArray = assignments?.options
    ? Object.values(assignments.options).filter(
        (val) => typeof val === "string" && val.trim() !== ""
      )
    : [];

  return (
    <div>
      <BaseLayout2>
        <StudentHeader currentSection="Assignments" showBackButton={true} showBackPath={`/modules/users/student/ui/assignmentlist?assignmentId=${assignmentId}`} />
        {assignments?.assignmentType?.type === "quiz" &&
          (assignments.trueorfalseType ? (
            <QuizTrueOrFalseAnswerCard
              question={assignments.question}
              correctAnswer={assignments.answerValidation ?? ""}
              studentAnswer={assignments.answer ?? ""}
              rating={assignments.rating}
              assignmentStatus={assignments.assignmentStatus}
            />
          ) : (
            <QuizAnswerCard
              question={assignments.question}
              options={optionArray}
              correctAnswer={assignments.answerValidation ?? ""}
              studentAnswer={assignments.answer ?? ""}
              rating={assignments.rating}
              assignmentStatus={assignments.assignmentStatus}
            />
          ))}
        {assignments?.assignmentType?.type === "reading" && (
          <ReadingAnswerCard
            questionText={assignments?.question ?? ""}
            correctAnswer={assignments?.answerValidation ?? ""}
            studentAnswer={assignments?.answer ?? ""}
            rating={assignments?.rating}
            assignmentStatus={assignments?.assignmentStatus}
            uploadFile={assignments?.uploadFile ?? ""} 


          />
        )}
        {assignments?.assignmentType?.type === "writing" && (
          <WritingAnswerCard
            question="Listen to the audio and write what you hear"
            audioFile={assignments?.audioFile ?? ""}
            studentAnswer={assignments?.answer ?? ""}
            correctAnswer={assignments?.answerValidation ?? ""}
            rating={assignments?.rating}
            assignmentStatus={assignments?.assignmentStatus}
          />
        )}
        {assignments?.assignmentType?.type === "image identification" && (
          <ImageQuestionCard
            question={assignments?.question ?? ""}
            imageUrl={assignments?.uploadFile ?? ""}
            options={optionArray}
            selectedAnswer={assignments?.answerValidation ?? ""}
            correctAnswer={assignments?.answer ?? ""}
            rating={assignments?.rating}
            assignmentStatus={assignments?.assignmentStatus}
          />
        )}
        {assignments?.assignmentType?.type === "word match" && (
          <MatchWordCard
            questionText={assignments?.question ?? ""}
            audioFile={assignments?.audioFile ?? ""}
            options={optionArray}
             selectedOption={assignments?.answer ?? ""}
            correctAnswer={assignments?.answerValidation ?? ""}
            rating={assignments?.rating}
            assignmentStatus={assignments?.assignmentStatus}
            uploadFile={assignments?.uploadFile ?? ""}
          />
        )}
      </BaseLayout2>
    </div>
  );
}
