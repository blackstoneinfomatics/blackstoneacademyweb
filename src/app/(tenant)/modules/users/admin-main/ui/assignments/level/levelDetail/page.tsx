"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import axios, { AxiosError } from "axios";
import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import BaseLayout4 from "../../../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { appSuccessToastMessages } from "@/app/_components/contents/toast_message";

interface Assignment {
  assignmentName: string;
  courseId: string;
  createdBy: string;
  createdDate: string;
  questionCount: number;
  assignmentId: string;
}

export type QuestionType =
  | "quiz"
  | "writing"
  | "reading"
  | "image"
  | "wordmatch";
export type ContentType = "text" | "audio" | "image";
export type AnswerType = "choose" | "trueorfalse" | "nooption";

interface QuestionForm {
  assignmentType: QuestionType;
  assignmentName: string;
  questionName: string;
  questionText: string;
  contentType: ContentType;
  answerType: AnswerType;
  allowedAnswerTypes: AnswerType[];
  options: string[];
  correctAnswer: string | string[];
}
interface IAdminAssignmentCreate {
  levelId: string;
  levelName: string;
  courseId: string;
  courseName: string;
  assignmentName: string;
  questions: {
    assignmentType: QuestionType;
    questionName: string;
    question: {
      contentType: ContentType;
      question: string | string[] | Buffer;
      answerType: AnswerType;
      options?: string[];
      correctAnswer: string | string[];
    };
  }[];
}

const Page = () => {
  const [courses, setCourses] = useState<Assignment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const searchParams = useSearchParams();
  const levelId = searchParams.get("levelId") || "";
  const courseId = searchParams.get("courseId") || "";
  const levelName = searchParams.get("level") || "";
  const courseName = searchParams.get("course") || "";
  const [currentPage, setCurrentPage] = useState(1);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [dashboardRead, setdashboardRead] = useState(false);

  const [form, setForm] = useState<QuestionForm>({
    assignmentName: "",
    questionName: "",
    assignmentType: "quiz",
    questionText: "",
    contentType: "text",
    answerType: "choose",
    allowedAnswerTypes: ["choose", "trueorfalse", "nooption"],
    options: [],
    correctAnswer: "",
  });

  const [assignmentType, setAssignmentType] = useState<QuestionType>("quiz");
  const [questions, setQuestions] = useState<
    IAdminAssignmentCreate["questions"]
  >([]);
  const [uploadedFileName, setUploadedFileName] = useState("");

  useEffect(() => {
    let defaultAnswerType: AnswerType = "choose";
    let allowedAnswerTypes: AnswerType[] = [
      "choose",
      "trueorfalse",
      "nooption",
    ];
    let defaultContentType: ContentType = "text";

    switch (assignmentType) {
      case "quiz":
        defaultContentType = "text";
        allowedAnswerTypes = ["choose", "trueorfalse", "nooption"];
        break;
      case "writing":
        defaultContentType = "audio";
        allowedAnswerTypes = ["nooption"];
        defaultAnswerType = "nooption";
        break;
      case "reading":
        defaultContentType = "text";
        allowedAnswerTypes = ["nooption"];
        defaultAnswerType = "nooption";
        break;
      case "image":
        defaultContentType = "image";
        allowedAnswerTypes = ["choose", "trueorfalse"];
        break;
      case "wordmatch":
        defaultContentType = "audio";
        allowedAnswerTypes = ["choose"];
        break;
    }

    setForm((prev) => ({
      ...prev,
      contentType: defaultContentType,
      answerType: allowedAnswerTypes.includes(prev.answerType)
        ? prev.answerType
        : defaultAnswerType,
      allowedAnswerTypes,
    }));
  }, [assignmentType]);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    const levelId = searchParams.get("levelId") || "";
    const courseId = searchParams.get("courseId") || "";
    if (token) {
      fetchAssignments(courseId, levelId, token);
    } else {
      toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
    }
    if (typeof window !== "undefined") {
      const roleAccessRaw = localStorage.getItem("AdminRolePermission");

      if (roleAccessRaw) {
        try {
          const roleAccess = JSON.parse(roleAccessRaw);
          const hasRead = roleAccess?.courses?.write ?? false;
          console.log(hasRead);
          setdashboardRead(hasRead);
        } catch (error) {
          console.error("Invalid JSON in AdminRolePermission:", error);
        }
      }
    }
  }, []);
  const fetchAssignments = async (
    courseId: string,
    levelId: string,
    token: string
  ) => {
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_ADMIN_ASSIGNMENT}`,
        {
          params: { courseId, levelId },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const assignments: Assignment[] = response.data.data.assignments.map(
        (item: any) => ({
          assignmentName: item.assignmentName,
          courseId: item.courseId,
          courseName: item.courseName,
          levelId: item.levelId,
          levelName: item.levelName,
          createdBy: item.createdBy,
          createdDate: item.createdDate,
          questionCount: item.questionCount,
          assignmentId: item.assignmentId,
        })
      );

      console.log("Assignments:", assignments);
      setCourses(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setForm((prev) => ({
        ...prev,
        questionText: base64String,
      }));
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAddQuestion = async () => {
    const errors: string[] = [];
    if (!form.assignmentType) errors.push("Assignment type is required.");
    if (!form.questionName?.trim()) errors.push("Question name is required.");

    if (!form.questionText?.trim()) {
      errors.push(
        form.contentType === "text"
          ? "Question text is required."
          : `Please upload a ${form.contentType} file.`
      );
    }

    if (form.answerType === "choose") {
      if (form.options.length < 2)
        errors.push("At least 2 options are required.");
      if (
        !Array.isArray(form.correctAnswer) ||
        (Array.isArray(form.correctAnswer) && form.correctAnswer.length === 0)
      ) {
        errors.push("At least one correct answer is required.");
      }
    }

    if (form.answerType === "trueorfalse") {
      if (form.correctAnswer !== "True" && form.correctAnswer !== "False") {
        errors.push(AppValidationMessages.ASSIGNMENT.TRUE_FALSE_REQUIRED);
      }
    }

    if (
      form.answerType === "nooption" &&
      typeof form.correctAnswer === "string" &&
      !form.correctAnswer.trim() &&
      assignmentType !== "reading"
    ) {
      errors.push("Correct answer is required.");
    }

    if (errors.length > 0) {
      toast.error(
        <div>
          <p className="font-semibold text-red-500">Failed to Add Question</p>
          <ul className="list-disc ml-5 mt-1 text-sm text-gray-700 dark:text-gray-300">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>,
        { autoClose: 5000, icon: <AlertTriangle className="text-red-500" /> }
      );
      return;
    }

    let correctAnswer = form.correctAnswer;
    if (assignmentType === "reading") {
      correctAnswer = form.questionText;
    }
    const newQuestion: IAdminAssignmentCreate["questions"][0] = {
      assignmentType: assignmentType,
      questionName: form.questionName,
      question: {
        contentType: form.contentType,
        question: form.questionText,
        answerType: form.answerType,
        options: form.answerType === "nooption" ? [] : form.options,
        correctAnswer,
      },
    };

    setQuestions((prev) => [...prev, newQuestion]);
    toast.success(appSuccessToastMessages.QUESTION_ADDED, { autoClose: 2000 });
    setUploadedFileName("");
    setForm((prev) => ({
      ...prev,
      assignmentType: "quiz",
      questionName: "",
      questionText: "",
      correctAnswer: "",
      options: [],
    }));
  };
  const handleClose = () => {
    setQuestions([]);
    setForm({
      assignmentName: "",
      questionName: "",
      questionText: "",
      assignmentType: "quiz",
      contentType: "text",
      answerType: "choose",
      allowedAnswerTypes: ["choose", "trueorfalse", "nooption"],
      options: [],
      correctAnswer: "",
    });
    setAssignmentType("quiz");
    setShowForm(false);
  }
  const handleSaveAssignment = async () => {
    const payload: IAdminAssignmentCreate = {
      levelId,
      levelName,
      courseId,
      courseName,
      assignmentName: form.assignmentName,
      questions,
    };

    // send to API
    console.log("Payload:", payload);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.CREATE_ADMIN_ASSIGNMENT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if ([200, 201].includes(res.status)) {
        setSuccess(true);
        setQuestions([]);
        setForm({
          assignmentName: "",
          questionName: "",
          questionText: "",
          assignmentType: "quiz",
          contentType: "text",
          answerType: "choose",
          allowedAnswerTypes: ["choose", "trueorfalse", "nooption"],
          options: [],
          correctAnswer: "",
        });
        setAssignmentType("quiz");
        setShowForm(false);
        fetchAssignments(courseId, levelId, token);
      }
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      setShowForm(false);
      if (Number(status === 400)) {
        const message =
          (error.response?.data as any)?.message ??
          "Please check the form inputs.";
        setFailedMessage(message);
        setFailed(true);
      } else if (status === 401) {
        setFailedMessage("Please login again.");
        setFailed(true);
      } else if (status === 403) {
        setFailedMessage("You don't have permission to perform this action.");
        setFailed(true);
      } else if (status === 500) {
        setFailedMessage("Server error");
        setFailed(true);
      } else {
        setFailed(true);
        console.error(`Unexpected error: ${status}`);
      }
    }
  };

  const itemsPerPage = 4;

  const offset = currentPage === 1 ? 0 : 3 + (currentPage - 2) * itemsPerPage;
  const limit = currentPage === 1 ? 3 : offset + itemsPerPage;

  const paginatedCourses = courses.slice(offset, limit);

  const totalItems = courses.length;
  const totalPages = Math.ceil(Math.max(0, totalItems - 3) / itemsPerPage + 1);

  return (
    <BaseLayout4>
      <AdminHeader
        currentSection={`Level ${levelName || ""}`}
        showBackButton={true}
        showBackPath={`/modules/users/admin-main/ui/assignments/level?title=${courseName}&courseId=${courseId}`}
      />
      <div className=" sm:px-1 lg:px-2 bg-[#f5f5f5] dark:bg-[#3B3B3B] py-2 rounded-xl">
        {/* Grid of Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center p-4 bg-gray-100 dark:bg-[#3B3B3B]">
          {/* Add Button Only on First Page */}
          {currentPage === 1 && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full h-full bg-white dark:bg-[#343434] border border-gray-300 dark:border-[#444]  hover:border-[#576CBC] hover:border-[2px] rounded-xl shadow hover:shadow-md transition flex flex-col items-center justify-center p-4 aspect-[4.8/5]"
            >
              <div className="w-14 h-14 bg-[#576CBC] dark:bg-[#C4C4C4] rounded-full flex items-center justify-center">
                <Plus color="white" size={28} />
              </div>
            </button>
          )}

          {paginatedCourses.map((course, index) => (
            <div
              key={course.assignmentId || `level-${index}`}
              className="w-full max-w-xs"
            >
              <CourseCard {...course} />
            </div>
          ))}
        </div>
      </div>
      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-3 px-4">
        {/* Showing entries info */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing{" "}
          {currentPage === 1 ? 1 : 3 + (currentPage - 2) * itemsPerPage + 1} to{" "}
          {currentPage === 1
            ? Math.min(3, totalItems)
            : Math.min(
              3 + (currentPage - 2) * itemsPerPage + itemsPerPage,
              totalItems
            )}{" "}
          of {totalItems} entries
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
          {/* Prev Button */}
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-md border flex items-center justify-center bg-[#F5F5F2] text-sm disabled:opacity-50 hover:bg-gray-300 dark:bg-[#565656] dark:hover:bg-[#939393]"
          >
            &lt;
          </button>

          {/* Page Numbers with Ellipsis */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
            )
            .map((page, idx, arr) => {
              const prevPage = arr[idx - 1];
              return (
                <>
                  {Boolean(prevPage && page - prevPage > 1) && (
                    <span className="px-2 text-sm text-gray-500 dark:text-gray-400">
                      …
                    </span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-md border flex items-center justify-center text-sm transition ${page === currentPage
                        ? "bg-[#FAFAFB] text-[#203F78] border-[#203F78] dark:bg-[#939393]"
                        : "bg-white dark:bg-[#565656] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#939393]"
                      }`}
                  >
                    {page}
                  </button>
                </>
              );
            })}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-md border flex items-center justify-center text-sm bg-[#F5F5F2]  disabled:opacity-50 hover:bg-gray-300 dark:bg-[#565656] dark:hover:bg-[#939393]"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-60 flex justify-center items-center z-50">
          <div className="animate-fadeInScale bg-white dark:bg-[#1e1e1e] text-black dark:text-white rounded-xl p-6 w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-none transition-all duration-300 ease-in-out">
            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              {/* Left Panel */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Add Assignment</h3>
                  <button
                    onClick={handleAddQuestion}
                    className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-[#4459A9] transition"
                  >
                    Add
                  </button>
                </div>

                {/* Assignment Name & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="assignment-name" className="font-medium">
                      Assignment Name
                    </label>
                    <input
                      id="assignment-name"
                      type="text"
                      placeholder="Name of assignment"
                      value={form.assignmentName}
                      onChange={(e) =>
                        setForm({ ...form, assignmentName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="assignment-type" className="font-medium">
                      Assignment Type
                    </label>
                    <select
                      id="assignment-type"
                      value={assignmentType}
                      onChange={(e) =>
                        setAssignmentType(e.target.value as QuestionType)
                      }
                      className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="quiz">Quiz</option>
                      <option value="reading">Reading</option>
                      <option value="writing">Writing</option>
                      <option value="image">Image Identification</option>
                      <option value="wordmatch">Word Match</option>
                    </select>
                  </div>
                </div>

                {/* Answer Type */}
                <div className="space-y-1">
                  <label htmlFor="answer-type" className="font-medium">
                    Answer Type
                  </label>

                  <div className="flex gap-3 flex-wrap">
                    {form.allowedAnswerTypes.includes("choose") && (
                      <label
                        htmlFor="choose"
                        className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-md 
                   hover:border-blue-400 transition-all"
                      >
                        <input
                          id="choose"
                          type="radio"
                          name="answerType"
                          checked={form.answerType === "choose"}
                          onChange={() =>
                            setForm({ ...form, answerType: "choose" })
                          }
                          className="hidden peer"
                        />
                        <div
                          className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${form.answerType === "choose"
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-gray-400 text-transparent"
                            }`}
                        >
                          ✓
                        </div>
                        <span>Choose</span>
                      </label>
                    )}

                    {form.allowedAnswerTypes.includes("trueorfalse") && (
                      <label
                        htmlFor="trueorfalse"
                        className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-md 
                   hover:border-blue-400 transition-all"
                      >
                        <input
                          id="trueorfalse"
                          type="radio"
                          name="answerType"
                          checked={form.answerType === "trueorfalse"}
                          onChange={() =>
                            setForm({ ...form, answerType: "trueorfalse" })
                          }
                          className="hidden peer"
                        />
                        <div
                          className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${form.answerType === "trueorfalse"
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-gray-400 text-transparent"
                            }`}
                        >
                          ✓
                        </div>
                        <span>True or False</span>
                      </label>
                    )}

                    {form.allowedAnswerTypes.includes("nooption") && (
                      <label
                        htmlFor="nooption"
                        className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-md 
                   hover:border-blue-400 transition-all"
                      >
                        <input
                          id="nooption"
                          type="radio"
                          name="answerType"
                          checked={form.answerType === "nooption"}
                          onChange={() =>
                            setForm({ ...form, answerType: "nooption" })
                          }
                          className="hidden peer"
                        />
                        <div
                          className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${form.answerType === "nooption"
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-gray-400 text-transparent"
                            }`}
                        >
                          ✓
                        </div>
                        <span>No Option</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Question Name */}
                <div className="space-y-1">
                  <label htmlFor="question-name" className="font-medium">
                    Question Name
                  </label>
                  <input
                    id="question-name"
                    type="text"
                    placeholder="Name of Question"
                    value={form.questionName}
                    onChange={(e) =>
                      setForm({ ...form, questionName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Question Text or File Upload */}
                <div className="space-y-1">
                  <label htmlFor="question-text" className="font-medium">
                    Question
                  </label>

                  {form.contentType === "text" ? (
                    <textarea
                      value={form.questionText}
                      onChange={(e) =>
                        setForm({ ...form, questionText: e.target.value })
                      }
                      placeholder="Type your question"
                      className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 min-h-[100px] resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label
                        htmlFor="question-file"
                        className="flex items-center justify-between gap-4 cursor-pointer w-full px-4 py-3 bg-gray-100 dark:bg-[#2a2a2a] border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg hover:border-blue-500 transition"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {uploadedFileName ? (
                            <span className="font-medium text-blue-600">
                              {uploadedFileName}
                            </span>
                          ) : (
                            <>
                              Click to upload{" "}
                              <span className="underline">
                                {form.contentType}
                              </span>{" "}
                              file
                            </>
                          )}
                        </span>
                        <svg
                          className="w-5 h-5 text-gray-500 dark:text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                          />
                        </svg>
                      </label>

                      <input
                        id="question-file"
                        type="file"
                        accept={
                          form.contentType === "audio" ? "audio/*" : "image/*"
                        }
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {/* Preview if file uploaded */}
                      {form.contentType === "image" && form.questionText && (
                        <img
                          src={form.questionText}
                          alt="Preview"
                          className="w-32 h-auto rounded-md border"
                        />
                      )}

                      {form.contentType === "audio" && form.questionText && (
                        <audio controls className="w-full">
                          <source src={form.questionText} />
                          <track kind="captions" label="Audio captions" />
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                  )}
                </div>
                {form.answerType === "nooption" &&
                  assignmentType !== "reading" && (
                    <div className="space-y-1">
                      <label htmlFor="correct-answer" className="font-medium">
                        Answer
                      </label>
                      <textarea
                        id="correct-answer"
                        value={form.correctAnswer}
                        onChange={(e) =>
                          setForm({ ...form, correctAnswer: e.target.value })
                        }
                        placeholder="Type your answer"
                        className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600 min-h-[100px] resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}

                {/* ✅ Choose (multiple) options */}
                {form.answerType === "choose" && (
                  <div className="space-y-3">
                    <label htmlFor="options" className="font-medium">Options</label>

                    {form.options.map((opt, index) => {
                      const isSelected =
                        Array.isArray(form.correctAnswer) &&
                        form.correctAnswer.includes(opt);

                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-2 rounded-md ${isSelected ? 'bg-[#377E36] dark:bg-[#377E36]' : ''
                            }`}
                        >
                          <input
                            type="checkbox"
                            name="correctOption"
                            checked={isSelected}
                            onChange={(e) => {
                              let updatedAnswers = Array.isArray(form.correctAnswer)
                                ? [...form.correctAnswer]
                                : [];

                              if (e.target.checked) {
                                updatedAnswers.push(opt);
                              } else {
                                updatedAnswers = updatedAnswers.filter((ans) => ans !== opt);
                              }

                              setForm({ ...form, correctAnswer: updatedAnswers });
                            }}
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...form.options];
                              newOptions[index] = e.target.value;

                              // Sync with correctAnswer if label was selected
                              let updatedCorrect = form.correctAnswer;
                              if (Array.isArray(form.correctAnswer)) {
                                if (form.correctAnswer.includes(opt)) {
                                  updatedCorrect = form.correctAnswer.map((ans) =>
                                    ans === opt ? e.target.value : ans
                                  );
                                }
                              }

                              setForm({
                                ...form,
                                options: newOptions,
                                correctAnswer: updatedCorrect,
                              });
                            }}
                            className="flex-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300"
                          />
                        </div>
                      );
                    })}

                    {form.options.length < 4 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, options: [...form.options, ""] })
                        }
                        className="text-blue-600 text-sm"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                )}


                {/* ✅ True or False (single answer) */}
                {form.answerType === "trueorfalse" && (
                  <div className="space-y-3">
                    <label htmlFor="ugu" className="font-medium">
                      Select Correct Answer
                    </label>
                    <div className="flex gap-4">
                      {["True", "False"].map((opt) => {
                        const isSelected = form.correctAnswer === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setForm({ ...form, correctAnswer: opt })}
                            className={`px-6 py-2 rounded-md border text-sm font-medium transition-all ${isSelected
                                ? "bg-green-100 text-green-800 border-green-400 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white border-gray-300"
                              }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Panel - Question List */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold">
                  List of Assignment Questions
                </h3>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{index + 1}.</span>
                        <span className="text-blue-600">
                          {question.questionName}
                        </span>
                        <span className="ml-auto text-blue-600">
                          {question.assignmentType}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
                        <div>Answer Type: {question.question.answerType}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex justify-end mt-8 gap-3 border-t pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1 border border-[#576CBC] text-[#576CBC] hover:border-[#4459A9] rounded hover:bg-[#E6E9F5] dark:hover:bg-[#333] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-[#4459A9] transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        closeButton={false}
        theme="colored"
        toastClassName={() =>
          "rounded-xl shadow-md px-5 py-4 font-medium text-sm bg-white dark:bg-[#1f1f1f] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
        }
        className="text-sm leading-snug"
      />

      {success && (
        <SuccessPopup onClose={() => setSuccess(false)} title="Course Added" />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
    </BaseLayout4>
  );
};

const CourseCard = ({
  courseId,
  assignmentId,
  assignmentName,
  questionCount,
  createdDate,
  createdBy,
}: Assignment) => {
  return (
    <div className="w-full bg-white dark:bg-[#343434] rounded-xl hover:border-[#576CBC] hover:border-[2px] border border-gray-300 dark:border-[#444] shadow hover:shadow-md transition flex flex-col justify-between p-4 aspect-[4.8/5]">
      {/* Title */}
      <h2 className="text-sm sm:text-base font-bold text-[#0b2447] dark:text-white mb-2 text-center">
        {assignmentName}
      </h2>

      {/* Image + Description */}
      <div className="flex flex-col items-center gap-2 flex-grow mb-2 ">
        <div className="w-20 h-20 bg-gray-200 dark:bg-[#C4C4C4] rounded-md" />
      </div>

      {/* Info */}
      <div className="text-[11px] sm:text-xs  font-normal space-y-1 ">
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Course ID
          </span>
          <span className="text-right text-[#322121cc] dark:text-[#DADADACC]">
            {courseId}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Assignment ID
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {assignmentId}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Question Count
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {questionCount}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Date
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {new Date(createdDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Created By
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {createdBy}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Page;
