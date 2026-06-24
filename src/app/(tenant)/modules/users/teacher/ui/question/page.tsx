"use client";

import React, { useEffect, useState } from "react";
import TeacherHeader from "../../components/TeacherHeader";
import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
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
  const studentId =search.get('studentId');
  const assignmentId = search.get('assignmentId');
  useEffect(() => {
     const token =
        typeof window !== "undefined"
          ? localStorage.getItem("TeacherAuthToken")
          : null;

      if (!token) {
        console.error("❌ TeacherAuthToken not found");
        return;
      }
    const fetchAssignment = async () => {
const assigmnetId = search.get('id');
      const token = localStorage.getItem("TeacherAuthToken");

        if (!token) {
          console.warn("Missing teacherId or token");
          return;
        }
      if(!assigmnetId) return;
      try {
        const res = await axios.get<Assignment>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_LIST}/${assigmnetId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAssignments(res.data);
      } catch (error) {
        console.log("Failed to fetch assignment", error);
      }
    };

    fetchAssignment();
  }, []);
  const optionArray = assignments?.options
    ? Object.values(assignments.options).filter(
        (val) => typeof val === "string" && val.trim() !== ""
      )
    : [];

  return (
    <div>
      <BaseLayout>
        <TeacherHeader currentSection="Assignments" showBackButton={true} showBackPath={`/modules/users/teacher/ui/managestudentview?studentId=${studentId}&assignmentId=${assignmentId}`} />
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
            uploadFile={assignments?.uploadFile}

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
      </BaseLayout>
    </div>
  );
}
