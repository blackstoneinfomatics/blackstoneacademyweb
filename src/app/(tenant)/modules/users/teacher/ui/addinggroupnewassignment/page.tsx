"use client";
import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import React, { useEffect, useRef, useState } from "react";
import TeacherHeader from "../../components/TeacherHeader";
import { FaMicrophone, FaTrash, FaUpload } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Assignment {
  name: string;
  type: string;
  question: string;
  questionType: "choose" | "truefalse";
  options?: {
    optionOne: string;
    optionTwo: string;
    optionThree: string;
    optionFour: string;
  };
  questionName?: string;
  correctAnswer: string;
  answerValidation: string;
  answerText?: string; // For reading/writing
  // Audio fields
  audioURL?: string; // For preview URL
  audioName?: string; // Original filename

  // Image fields
  imageURL?: string; // For preview URL
  imageName?: string; // Original filename
  imageFile?: File; // Actual File object
  uploadFile?: ArrayBuffer; // For binary data
  uploadFileBase64?: string; // Alternative for Base64
  audioFile?: ArrayBuffer;
  audioFileBase64?: string;
  assignmentStatus?: string;
  status?: string;
  createdDate?: string;
  dueDate?: string;
  studentId?: string;
  studentName?: string;
  sessionClassType?: string;
  assignedTeacher?: string;
  assignedTeacherId?: string;
  title?: string;
  level?: string;
  courses?: string;
  studentIds?: string[]; // For group assignments
  groupAssignment?: boolean;
}

const NewAssignment = () => {
  // ✅ Meta states
  const [title, setMetaTitle] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");
  const [sessionClassType, setSessionClassType] = useState("");
  const [assignedTeacher, setAssignedTeacher] = useState("");
  const [assignedTeacherId, setAssignedTeacherId] = useState("");
  const [course, setCourse] = useState("");
  const [level, setLevel] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const searchParams = useSearchParams();
  // Replace single student states with arrays
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [studentNames, setStudentNames] = useState<string[]>([]);
  useEffect(() => {
    const title = searchParams?.get("title") || "";
    const assignedDate = searchParams?.get("assignedDate") || "";
    const dueDate = searchParams?.get("dueDate") || "";
    const comment = searchParams?.get("comment") || "";
    const sessionClassType = searchParams?.get("sessionClassType") || "";
    const assignedTeacher = searchParams?.get("assignedTeacher") || "";
    const assignedTeacherId = searchParams?.get("assignedTeacherId") || "";
    const course = searchParams?.get("course") || "";
    const level = searchParams?.get("level") || "";
    const studentIdParam = searchParams?.get("studentId");
    const studentNameParam = searchParams?.get("studentName");
    const studentsParam = searchParams?.get("students");

    let parsedStudentIds: string[] = [];
    let parsedStudentNames: string[] = [];

    if (studentsParam) {
      try {
        const studentsData = JSON.parse(studentsParam);
        if (Array.isArray(studentsData)) {
          parsedStudentIds = studentsData.map((s: any) => s.studentId).filter(Boolean);
          parsedStudentNames = studentsData.map((s: any) => s.studentName).filter(Boolean);
        }
      } catch (error) {
        console.error("Error parsing students data:", error);
      }
    } else if (studentIdParam || studentNameParam) {
      if (studentIdParam) parsedStudentIds = [studentIdParam];
      if (studentNameParam) parsedStudentNames = [studentNameParam];
    }

    setMetaTitle(title);
    setAssignedDate(assignedDate);
    setDueDate(dueDate);
    setComment(comment);
    setStudentIds(parsedStudentIds);
    setStudentNames(parsedStudentNames);
    setSessionClassType(sessionClassType);
    setAssignedTeacher(assignedTeacher);
    setAssignedTeacherId(assignedTeacherId);
    setCourse(course);
    setLevel(level);
  }, [searchParams]);
  const [hasOptions, setHasOptions] = useState<boolean>(true); // default true
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [chooseType, setChooseType] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileURL, setUploadedFileURL] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null);
  type OptionKey = "a" | "b" | "c" | "d";
  interface Option {
    text: string;
    isCorrect: boolean;
  }
  const [options, setOptions] = useState<Record<OptionKey, Option>>({
    a: { text: "", isCorrect: false },
    b: { text: "", isCorrect: false },
    c: { text: "", isCorrect: false },
    d: { text: "", isCorrect: false },
  });

  // For true/false type
  const [questionName, setQuestionName] = useState("");
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [typedQuestion, setTypedQuestion] = useState("");
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentType, setAssignmentType] = useState("quiz");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [questionType, setQuestionType] = useState<"choose" | "truefalse">(
    "choose"
  ); // or "truefalse"
  const [noOptions, setNoOptions] = useState(false);
  const [answerText, setAnswerText] = useState("");

  // Add delete handler for group page
  const handleDeleteQuestion = (indexToDelete: number) => {
    setAssignments((prevAssignments) =>
      prevAssignments.filter((_, index) => index !== indexToDelete)
    );
  };

  // Update the handleAddAssignment function
  const handleAddAssignment = () => {
    if (!assignmentName.trim() || !typedQuestion.trim()) {
      alert("⚠️ Please fill in both Assignment Name and " + 
            (assignmentType === "reading comprehension" ? "Instructions" : "Question"));
      return;
    }

    // For reading comprehension, skip other validations
    if (assignmentType === "reading comprehension") {
      const newAssignment: Assignment = {
        questionName: questionName.trim(),
        name: assignmentName.trim(),
        type: assignmentType,
        question: typedQuestion.trim(), // This will contain instructions
        questionType: "choose", // Default value, not used for reading comprehension
        correctAnswer: "",
        answerValidation: "",
        level: level,
        courses: course,
      };

      setAssignments((prev) => [...prev, newAssignment]);
      alert("✅ Reading comprehension assignment added successfully!");
      
      // Reset only question-related fields
      setTypedQuestion("");
      setQuestionName("");
      return;
    }

    // Special validation for reading/writing
    if (
      (assignmentType === "reading" || assignmentType === "writing") &&
      !answerText.trim()
    ) {
      alert(`⚠️ Please provide the answer/content.`);
      return;
    }
    // Special validation for image identification
    if (
      assignmentType === "image identification" ||
      assignmentType === "word match"
    ) {
      if (
        assignmentType === "image identification" &&
        (!uploadedFileURL || !uploadedFileType?.startsWith("image/"))
      ) {
        alert("⚠️ Please upload an image for image identification.");
        return;
      }
      const hasOptionsFilled = Object.values(options).some(
        (opt) => opt.text.trim() !== ""
      );
      if (!hasOptionsFilled) {
        alert("Please provide at least one option for the image");
        return;
      }
      if (!selectedAnswer) {
        alert("⚠️ Please select the correct answer for this image.");
        return;
      }
    }
    // Skip true/false validation for non-quiz types
    if (
      !["reading", "writing", "image identification", "word match"].includes(
        assignmentType
      )
    ) {
      if (questionType === "truefalse" && trueFalseAnswer === null) {
        alert("⚠️ Please select True or False for this question.");
        return;
      }
    }
    // Skip options validation for reading/writing/image identification/word match types
    if (
      !["reading", "writing", "image identification", "word match"].includes(
        assignmentType
      )
    ) {
      // For choose type with options
      if (questionType === "choose" && hasOptions && !noOptions) {
        const missingOptions = Object.entries(options)
          .filter(([_, val]) => val.text.trim() === "")
          .map(([key]) => key.toUpperCase());

        if (missingOptions.length > 0) {
          alert(
            `⚠️ Please fill all options. Missing: ${missingOptions.join(", ")}`
          );
          return;
        }

        if (!selectedAnswer) {
          alert(
            "⚠️ Please select the correct answer for this 'choose' question."
          );
          return;
        }
      }
      // Validate true/false answer is selected
      if (questionType === "truefalse" && trueFalseAnswer === null) {
        alert("⚠️ Please select True or False for this question.");
        return;
      }
    }
    // For types without options (reading, writing)
    if (["reading", "writing"].includes(assignmentType)) {
      if (!typedQuestion.trim()) {
        alert("⚠️ Please provide the question text.");
        return;
      }
      // No options validation needed for these types
    }

    const newAssignment: Assignment = {
      questionName: questionName.trim(),
      name: assignmentName.trim(),
      type: assignmentType,
      question: typedQuestion.trim(),
      questionType: questionType,
      // Include options for image identification or choose type
      options:
        assignmentType === "image identification" ||
        assignmentType === "word match" ||
        (questionType === "choose" && hasOptions && !noOptions)
          ? {
              optionOne: options.a.text,
              optionTwo: options.b.text,
              optionThree: options.c.text,
              optionFour: options.d.text,
            }
          : undefined,
      correctAnswer: "",
      // Fix: Use answerText for reading/writing, selectedAnswer for others
      answerValidation: ["reading", "writing"].includes(assignmentType)
        ? answerText // Use the textarea content for reading/writing
        : questionType === "truefalse"
        ? String(trueFalseAnswer) // For true/false questions
        : selectedAnswer, // For all other types (choose, image identification)
      answerText: ["reading", "writing"].includes(assignmentType)
        ? answerText // Explicitly store answerText for these types
        : undefined,
      level: level,
      courses: course,
      audioFile: audioFileBuffer || undefined,
      uploadFile: uploadedFileBuffer || undefined,
    };
    console.log(" New assignment created with:", {
      hasUploadFile: !!uploadedFileBuffer,
      hasAudioFile: !!audioFileBuffer,
    });
    setAssignments((prev) => [...prev, newAssignment]);
    alert("✅ Assignment added successfully!");

    // Reset form fields except assignmentName (persist across multiple adds)
    setTypedQuestion("");
    setQuestionName("");
    setOptions({
      a: { text: "", isCorrect: false },
      b: { text: "", isCorrect: false },
      c: { text: "", isCorrect: false },
      d: { text: "", isCorrect: false },
    });
    setSelectedAnswer("");
    setTrueFalseAnswer(null);
    setUploadedFileURL(null);
    setUploadedFileName(null);
    setUploadedFileType(null);
    setAnswerText("");
    setAudioURL(null);
    setAudioFileBuffer(null);
    setUploadedFileBuffer(null);
  };
  useEffect(() => {
    // Reset answer text when assignment type changes
    setAnswerText("");
    setSelectedAnswer("");
    // If switching to reading/writing, ensure question type is 'choose'
    if (assignmentType === "writing" || assignmentType === "reading") {
      setQuestionType("choose");
    }
  }, [assignmentType]);

  // In the component, update the handleFileUpload to handle images separately:
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Clean up previous URLs

      // Create preview URL
      const url = URL.createObjectURL(file);

      // Convert file to buffer
      const buffer = await file.arrayBuffer();

      // Update state
      setUploadedFileName(file.name);
      setUploadedFileType(file.type);
      setUploadedFileURL(url);
      setUploadedFileBuffer(buffer); // Store the ArrayBuffer

      // Handle audio files separately
      if (file.type.startsWith("audio/")) {
        setAudioURL(url);
        setAudioFileBuffer(buffer);
      } else {
        setAudioURL(null);
        setAudioFileBuffer(null);
      }

      console.log("📁 File processed:", {
        name: file.name,
        type: file.type,
        size: file.size,
        bufferLength: buffer.byteLength,
      });

      e.target.value = "";
    } catch (error) {
      console.error("File upload error:", error);
      alert("Error processing file upload");
    } finally {
      setIsUploading(false);
    }
  };

  // Add these state variables
  const [uploadedFileBuffer, setUploadedFileBuffer] =
    useState<ArrayBuffer | null>(null);
  const [audioFileBuffer, setAudioFileBuffer] = useState<ArrayBuffer | null>(
    null
  );

  const handleDeleteFile = () => {
    setAudioURL(null);
    setUploadedFileName(null);
    setUploadedFileURL(null);
    setUploadedFileType(null);
  };

  // Update the submitAssignment function
  const submitAssignment = async () => {
    const formData = new FormData();
    console.log("📤 Starting assignment submission...");

    console.log("📝 Assignment count:", assignments.length);
    const studentsParam = searchParams?.get("students");

    if (studentsParam) {
      try {
        const studentsData = JSON.parse(studentsParam);

        console.log("Parsed students data:", studentsData);

        // ✅ Just use studentsData directly — don’t rely on setState
        const formattedStudents = studentsData.map((s: any) => ({
          studentId: s.studentId,
          studentName: s.studentName,
        }));

        formData.append("students", JSON.stringify(formattedStudents));
      } catch (error) {
        console.error("❌ Failed to parse students param:", error);
      }
    }

    formData.append("sessionClassType", sessionClassType);
    formData.append("assignedTeacher", assignedTeacher);
    formData.append("assignedTeacherId", assignedTeacherId);
    formData.append("level", level);
    formData.append("course", course);
    for (let index = 0; index < assignments.length; index++) {
      const item = assignments[index];

      console.log(`\n📄 Processing assignment ${index + 1}: ${item.name}`);
      console.log("🖼️ Assignment type:", item.type);
      formData.append(`assignments[${index}][assignmentName]`, item.name);
      formData.append(
        `assignments[${index}][assignmentType]`,
        JSON.stringify({ type: item.type })
      );
      formData.append(
        `assignments[${index}][questionName]`,
        item.questionName || `Q-${index + 1}`
      );
      formData.append(`assignments[${index}][questionType]`, item.questionType);
      formData.append(
        `assignments[${index}][typeofQuestion]`,
        item.questionType
      );
      formData.append(`assignments[${index}][title]`, title);
      formData.append(`assignments[${index}][question]`, item.question);
      formData.append(
        `assignments[${index}][hasOptions]`,
        hasOptions.toString()
      );

      if (
        (item.type === "image identification" || item.type === "word match") &&
        item.options
      ) {
        formData.append(
          `assignments[${index}][options]`,
          JSON.stringify(item.options)
        );
      }
      // Set chooseType and trueorfalseType based on questionType
      formData.append(
        `assignments[${index}][chooseType]`,
        (item.questionType === "choose").toString()
      );
      formData.append(
        `assignments[${index}][trueorfalseType]`,
        (item.questionType === "truefalse").toString()
      );

      // Handle options
      if (
        item.type === "quiz" &&
        item.questionType === "choose" &&
        hasOptions &&
        !noOptions
      ) {
        const optionsPayload = item.options || {
          optionOne: "",
          optionTwo: "",
          optionThree: "",
          optionFour: "",
        };
        formData.append(
          `assignments[${index}][options]`,
          JSON.stringify(optionsPayload)
        );
      }

      // ✅ Proper answerValidation handling
      let answerValidationValue = "";

      if (item.type === "reading" || item.type === "writing") {
        answerValidationValue = item.answerText || ""; // Use answerText for reading/writing
      } else if (
        item.type === "image identification" ||
        item.type === "word match"
      ) {
        // For image/word match, use the selected answer (value from radio button)
        answerValidationValue = item.answerValidation || selectedAnswer;
      } else if (item.questionType === "truefalse") {
        answerValidationValue = String(item.answerValidation);
      } else if (Array.isArray(item.answerValidation)) {
        answerValidationValue = item.answerValidation.join(","); // or JSON.stringify(...) if your backend expects array
      } else {
        answerValidationValue = item.answerValidation || "";
      }

      formData.append(
        `assignments[${index}][answerValidation]`,
        answerValidationValue
      );

      formData.append(`assignments[${index}][answer]`, "");
      formData.append(`assignments[${index}][createdDate]`, assignedDate);
      formData.append(`assignments[${index}][dueDate]`, dueDate);
      formData.append(`assignments[${index}][createdBy]`, assignedTeacher);
      formData.append(`assignments[${index}][updatedBy]`, assignedTeacher);
      formData.append(`assignments[${index}][level]`, level);
      formData.append(`assignments[${index}][courses]`, course);
      formData.append(`assignments[${index}][status]`, "Active");
      formData.append(`assignments[${index}][assignmentStatus]`, "Assigned");

      if (item.uploadFile) {
        const blob = new Blob([item.uploadFile]);

        formData.append(
          `assignments[${index}][uploadFile]`,
          blob,
          item.imageName
        );

        console.log(
          "📤 Added upload file buffer:",
          item.uploadFile.byteLength,
          "bytes"
        );
      }

      if (item.audioFile) {
        const blob = new Blob([item.audioFile], { type: "audio/mpeg" });
        formData.append(
          `assignments[${index}][audioFile]`,
          blob,
          item.audioName || "audio_file.mp3"
        );
        console.log(
          "🎵 Added audio file buffer:",
          item.audioFile.byteLength,
          "bytes"
        );
      }
    }

    // Debug: Log formData contents
    console.log("📦 FormData contents:");
    for (const [key, value] of Array.from(formData.entries())) {
      console.log(
        key,
        value instanceof Blob
          ? `Blob (${value.size} bytes, ${value.type})`
          : value
      );
    }
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("TeacherAuthToken")
        : null;

    if (!token) {
      console.error("❌ TeacherAuthToken not found");
      return;
    }
    try {
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GROUP_ASSIGNMENTS}`, {
        method: "POST",
        body: formData, // ✅ Use FormData directly

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setSuccessMessage("Assignment submitted successfully!");
        // Clear assignment name and assignments list on successful submit
        setAssignmentName("");
        setAssignments([]);
        setTimeout(() => {window.location.href="/modules/users/teacher/ui/assignment"}, 3000);
      } else {
        const errorData = await response.json(); // Try to get error message from response
        setFailed(true);
        setFailedMessage(
          errorData.message || "Failed to submit assignment. Please try again."
        );
        setTimeout(() => setFailed(false), 3000);
      }
    } catch (error) {
      console.error("Error submitting Assignment:", error);
      console.log("Error submitting Assignment. Please try again.");
      setFailed(true);
      setFailedMessage(
        "Network error. Please check your connection and try again."
      );
      setTimeout(() => setFailed(false), 3000);
    }
  };

  useEffect(() => {
    const chooseTypeRaw = localStorage.getItem("chooseType");
    setChooseType(chooseTypeRaw === "true");
  }, []);

  // When assignmentType changes, reset chooseType if not quiz
  useEffect(() => {
    if (assignmentType !== "quiz") {
      setChooseType(false);
    } else {
      // Keep chooseType in sync with questionType
      setChooseType(questionType === "choose");
    }
  }, [assignmentType, questionType]);

  const handleOptionChange = (optionId: OptionKey, newText: string) => {
    setOptions((prev) => {
      const updated = {
        ...prev,
        [optionId]: {
          ...prev[optionId],
          text: newText,
        },
      };

      // alert(`📝 Option ${optionId.toUpperCase()} updated to: ${newText}`);
      console.log("📦 Updated options object:", updated); // log to console
      return updated;
    });
  };

  const handleAnswerChange = (selectedId: OptionKey) => {
    setOptions((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as OptionKey[]).forEach((key) => {
        updated[key].isCorrect = key === selectedId;
      });
      const selectedText = updated[selectedId]?.text || "";
      setSelectedAnswer(selectedText);
      return updated;
    });
  };

  return (
    <BaseLayout>
      <TeacherHeader currentSection="New Assignment" />
      <div className="flex flex-col md:flex-row gap-6 p-6 min-h-screen">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 shadow-md flex flex-col gap-5 dark:bg-[#3B3B3B] dark:border dark:border-[#484f5b]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-[#010E30] dark:text-[#fff]">
              Add Assignments
            </h2>
            <button
              className="bg-[#C9D5F3] text-[#546297] px-[15px] py-1 font-semibold rounded-md hover:bg-[#c9D5F3] text-[13px]"
              onClick={handleAddAssignment}
            >
              Add
            </button>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label className="block text-[13px] font-light text-[#010E30] mb-2 dark:text-[#fff] ">
                Assignment Name
              </label>
              <input
                type="text"
                placeholder="Name of assignment"
                className="w-full p-3 px-5 text-[11px] border border-gray-300 rounded-xl dark:bg-[#343434] dark:border-[#343434] dark:text-[#fff]"
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
              />
            </div>

            <div className="w-1/2">
              <label className="block text-[13px] font-light text-[#010E30] mb-2 dark:text-[#fff] ">
                Assignment Type
              </label>
              <select
                className="w-full p-3 px-5 text-[11px] border border-gray-300 rounded-xl dark:bg-[#343434] dark:border-[#343434] dark:text-[#fff]"
                onChange={(e) => setAssignmentType(e.target.value)}
                value={assignmentType}
              >
                <option value="quiz">quiz</option>
                <option value="reading">reading</option>
                <option value="writing">writing</option>
                <option value="reading comprehension">reading comprehension</option>
                <option value="image identification">image identification</option>
                <option value="word match">word match</option>{" "}
                {/* Add this line */}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#010E30] mb-2 dark:text-[#fff]">
            </label>
            {/* Hide answer-type controls for image identification, word match, reading and writing */}
            {!["writing", "reading", "image identification", "word match", "reading comprehension"].includes(
              assignmentType
            ) && (
              <div className="flex items-center gap-6 text-sm text-[#010E30]">
                {/* Always show Choose option */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={questionType === "choose"}
                    disabled={
                      assignmentType === "word match" ||
                      assignmentType === "image identification"
                    }
                    onChange={() => {
                      setQuestionType("choose");
                      if (assignmentType === "quiz") setChooseType(true);
                    }}
                    className="appearance-none w-4 h-4 rounded-sm border-2 dark:border-white border-[#343434] checked:bg-[#576CBC] checked:border-[#576CBC] focus:outline-none transition-all duration-150"
                  />
                  <span className="block text-[13px] font-light text-[#010E30] dark:text-[#fff]">
                    Choose
                  </span>
                </label>

                {/* Only show True/False for quiz */}
                {assignmentType === "quiz" && (
                  <label className="flex items-center gap-2 dark:text-[#fff]">
                    <input
                      className="appearance-none w-4 h-4 rounded-sm border-2 dark:border-white border-[#343434] checked:bg-[#576CBC] checked:border-[#576CBC] focus:outline-none transition-all duration-150"
                      type="checkbox"
                      checked={questionType === "truefalse"}
                      onChange={() => {
                        setQuestionType("truefalse");
                        if (assignmentType === "quiz") setChooseType(false);
                      }}
                    />
                    <span className="block text-[13px] font-light text-[#010E30] dark:text-[#fff]">
                      True or False
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-[13px] font-light text-[#010E30] mb-2 dark:text-[#fff] ">
              Question Name
            </label>
            <input
              type="text"
              placeholder="Enter question name"
              value={questionName}
              onChange={(e) => setQuestionName(e.target.value)}
              className="w-full p-3 px-5 text-[11px] border border-gray-300 rounded-xl dark:bg-[#343434] dark:border-[#343434] dark:text-[#fff]"
            />
          </div>

          <div className="relative mb-4">
            <label className="block text-[13px] font-light text-[#010E30] mb-2 dark:text-[#fff] ">
              Type the Question
            </label>
            <textarea
              placeholder="Type the question"
              rows={3}
              value={typedQuestion}
              onChange={(e) => setTypedQuestion(e.target.value)}
              className="w-full p-3 px-5 text-[11px] border border-gray-300 rounded-md pr-20 dark:bg-[#343434] dark:border-[#343434] dark:text-[#fff] "
              defaultValue="Which of the following letters is considered a Qalqalah letter?"
            />
            {!audioURL && !uploadedFileURL && (
              <div className="absolute bottom-2 right-2 flex gap-2 dark:text-[#fff]">
                {/* File upload button - shown when no file is uploaded */}
                {!uploadedFileURL && (
                  <label className="p-2 bg-gray-200 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt" // Common file types
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <FaUpload className="text-xl text-gray-700" />
                  </label>
                )}
              </div>
            )}

            {isRecording && (
              <span className="text-sm text-red-600 absolute bottom-2 left-2 animate-pulse">
                ● Recording...
              </span>
            )}

            {isUploading && uploadedFileName && (
              <div className="text-sm text-blue-600 mb-1 flex items-center gap-2 dark:text-[#fff]">
                <span className="font-medium dark:text-[#fff]">Uploading:</span>
                {uploadedFileName}
                <span className="animate-spin dark:text-[#fff] ">⏳</span>
              </div>
            )}

            {audioURL &&
              uploadedFileType?.startsWith("audio/") &&
              !isUploading && (
                <div className="flex items-center gap-3 mt-1 bg-gray-100 dark:bg-[#343434] rounded-lg px-4 py-2 shadow dark:text-[#fff]">
                  <audio
                    controls
                    src={audioURL}
                    className="flex-1 min-w-0 dark:text-[#fff]"
                  />
                  <span className="text-sm text-gray-600 dark:text-[#fff]">
                    {uploadedFileName}
                  </span>
                  <button
                    type="button"
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-full border border-gray-300 dark:border-[#343434] dark:text-[#fff] dark:bg-[#343434]"
                    title="Delete File"
                    onClick={handleDeleteFile}
                  >
                    <FaTrash className="text-lg text-red-600 dark:text-[#fff]" />
                  </button>
                </div>
              )}

            {uploadedFileURL && uploadedFileType?.startsWith("image/") && (
              <div className="mt-4 flex items-center gap-3 bg-gray-100 rounded-lg p-3">
                <img
                  src={uploadedFileURL}
                  alt="Uploaded preview"
                  className="max-h-40 max-w-full object-contain"
                />
                <div>
                  <span className="text-sm break-all">{uploadedFileName}</span>
                  <button
                    type="button"
                    className="mt-2 p-1 bg-red-100 hover:bg-red-200 rounded-full"
                    onClick={handleDeleteFile}
                  >
                    <FaTrash className="text-red-600" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* For reading/writing show a single 'Type the Answer' field (remove specific prompts) */}
         {(assignmentType === "writing" || assignmentType === "reading") && (
            <div className="mb-4">
              <label className="block text-[13px] font-light text-[#010E30] mb-2 dark:text-[#fff]">
                Type the Answer
              </label>
              <textarea
                placeholder="Type the answer"
                rows={3}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="w-full p-3 px-5 text-[11px] border border-gray-300 rounded-md dark:bg-[#343434] dark:border-[#343434] dark:text-[#fff]"
              />
            </div>
          )}

          {(assignmentType === "image identification" ||
            assignmentType === "word match" ||
            (questionType === "choose" && assignmentType === "quiz")) && (
            <div className="mb-4">
              <label className="block text-[13px] font-light text-[#010E30] mb-2 dark:text-[#fff]">
                Options (Select the correct answer)
              </label>
              <div className="space-y-2">
                {Object.entries(options).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={value.isCorrect}
                      onChange={() => {
                        handleAnswerChange(key as OptionKey);
                        setSelectedAnswer(value.text);
                      }}
                      className="w-4 h-4 text-[#576CBC] focus:ring-[#576CBC]"
                    />
                    <input
                      type="text"
                      value={value.text}
                      placeholder={`Option ${key.toUpperCase()}`}
                      onChange={(e) => {
                        handleOptionChange(key as OptionKey, e.target.value);
                        if (options[key as OptionKey].isCorrect) {
                          setSelectedAnswer(e.target.value);
                        }
                      }}
                      className="flex-1 p-2 text-sm border border-gray-300 rounded-md dark:bg-[#343434] dark:border-[#343434] dark:text-[#fff]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {questionType === "truefalse" &&
            !(
              assignmentType === "writing" ||
              assignmentType === "reading" ||
              assignmentType === "image identification" ||
              assignmentType === "word match"
            ) && (
              <div className="mb-4">
                <p className="text-sm font-medium text-[#010E30] mb-2 dark:text-[#fff]">
                  Select the correct answer
                </p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm dark:text-[#fff] cursor-pointer">
                    <input
                      type="radio"
                      name="truefalse"
                      checked={trueFalseAnswer === true}
                      onChange={() => {
                        setTrueFalseAnswer(true);
                        setSelectedAnswer("true"); // Set answer validation
                      }}
                      className="w-4 h-4 text-[#576CBC] focus:ring-[#576CBC]"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm dark:text-[#fff] cursor-pointer">
                    <input
                      type="radio"
                      name="truefalse"
                      checked={trueFalseAnswer === false}
                      onChange={() => {
                        setTrueFalseAnswer(false);
                        setSelectedAnswer("false"); // Set answer validation
                      }}
                      className="w-4 h-4 text-[#576CBC] focus:ring-[#576CBC]"
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            )}

          {/* Answer Validation Section */}
          {(assignmentType === "reading" || assignmentType === "writing") && (
            <div className="mb-4">
              <label className="block text-[13px] font-light text-[#010E30] mb-2 dark:text-[#fff]">
                {assignmentType === "reading"
                  ? "Reading Content"
                  : "Writing Prompt"}
              </label>
              <textarea
                placeholder={
                  assignmentType === "reading"
                    ? "Enter the reading passage"
                    : "Enter the writing prompt"
                }
                rows={4}
                value={answerText}
                onChange={(e) => {
                  setAnswerText(e.target.value);
                  setSelectedAnswer(e.target.value); // This will be used as answerValidation
                }}
                className="w-full p-3 px-5 text-[11px] border border-gray-300 rounded-md dark:bg-[#343434] dark:border-[#343434] dark:text-[#fff]"
              />
            </div>
          )}

          {/* Show only basic fields for reading comprehension */}
          {assignmentType === "reading comprehension" ? (
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-[13px] font-light text-[#010E30] mb-2 dark:text-[#fff]">
                  Instructions
                </label>
                <textarea
                  placeholder="Type the instructions for students"
                  rows={4}
                  value={typedQuestion}
                  onChange={(e) => setTypedQuestion(e.target.value)}
                  className="w-full p-3 px-5 text-[11px] border border-gray-300 rounded-md dark:bg-[#343434] dark:border-[#343434] dark:text-[#fff]"
                />
              </div>
            </div>
          ) : null}
        </div>
        {/* Right Panel */}
        <div className="flex flex-col justify-between w-full md:w-1/2 bg-white rounded-2xl p-6 shadow-md dark:bg-[#2f2f2f] dark:border dark:border-[#3f3f46]">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#071135] dark:text-[#fff]">
                List of Assignments
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-300">
                {assignments.length} item{assignments.length !== 1 ? "s" : ""}
              </span>
            </div>

            {assignments.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                No assignments added yet. Use the left panel to add questions.
              </div>
            )}

            <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-2">
              {assignments.map((item, idx) => (
                <div
                  key={idx}
                  className="relative bg-gradient-to-b from-white to-gray-50 dark:from-[#1f1f1f] dark:to-[#1a1a1a] border border-gray-100 dark:border-[#2e2e2e] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-150"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#eef3ff] text-[#2851a3] font-medium text-sm dark:bg-[#2b3350] dark:text-[#bcd1ff]">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-[#0b1730] dark:text-[#fff] truncate">
                              {item.questionName || `Question ${idx + 1}`}
                            </h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-[#2b2b2b] dark:text-gray-300">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[13px] text-gray-700 dark:text-gray-200 mb-2">
                        <strong className="mr-1">Q:</strong>
                        <div className="mt-1 bg-white dark:bg-[#101010] border border-gray-100 dark:border-[#252525] rounded-md p-3 text-sm text-gray-800 dark:text-gray-100 leading-relaxed break-words">
                          {item.question || "-"}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {/* Options for choose / image / word match */}
                        {item.options &&
                          (() => {
                            const opts = {
                              a: item.options.optionOne,
                              b: item.options.optionTwo,
                              c: item.options.optionThree,
                              d: item.options.optionFour,
                            };
                            return Object.entries(opts).map(([key, val]) =>
                              val ? (
                                <span
                                  key={key}
                                  className={`text-sm px-3 py-1 rounded-full border ${item.answerValidation === val ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-100 text-gray-800"} dark:bg-[#151515] dark:border-[#2a2a2a]`}
                                >
                                  <strong className="mr-2">{key.toUpperCase()}.</strong>
                                  <span className="max-w-[18rem] inline-block align-middle truncate">{val}</span>
                                </span>
                              ) : null
                            );
                          })()}

                        {/* True/False display */}
                        {item.questionType === "truefalse" && (
                          <div>
                            <div className="text-[13px] text-gray-700 dark:text-gray-200 mb-2">
                              Correct Answer
                            </div>
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-[#141414] border border-gray-100 dark:border-[#2b2b2b] rounded-md px-3 py-2">
                              <div className="text-sm text-gray-800 dark:text-gray-100">
                                {item.answerValidation === "true" ? "True" : "False"}
                              </div>
                              <span className="text-green-600 text-sm font-medium">
                                ✓ Correct
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Reading/Writing / Type-the-answer */}
                        {(item.type === "reading" || item.type === "writing") && (
                          <div>
                            <div className="text-[13px] text-gray-700 dark:text-gray-200 mb-2">
                              Answer
                            </div>
                            <div className="bg-gray-50 dark:bg-[#141414] border border-gray-100 dark:border-[#2b2b2b] rounded-md p-3">
                              <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                                {item.answerValidation || item.answerText || "-"}
                              </div>
                              {item.answerValidation && (
                                <div className="mt-2 text-right">
                                  <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                                    ✓ Answer Provided
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Image preview */}
                        {item.imageURL && (
                          <div>
                            <div className="text-[13px] text-gray-700 dark:text-gray-200 mb-2">
                              Uploaded Image
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#141414] rounded-md p-3 border border-gray-100 dark:border-[#2b2b2b]">
                              <img
                                src={item.imageURL}
                                alt={item.imageName || "uploaded image"}
                                className="max-h-28 object-contain rounded-md"
                              />
                              <div className="text-xs text-gray-600 dark:text-gray-300 break-all">
                                {item.imageName}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Audio preview */}
                        {item.audioURL && (
                          <div>
                            <div className="text-[13px] text-gray-700 dark:text-gray-200 mb-2">
                              Audio Content
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#141414] rounded-md p-3 border border-gray-100 dark:border-[#2b2b2b]">
                              <audio controls src={item.audioURL} className="flex-1" />
                              <div className="text-xs text-gray-600 dark:text-gray-300 break-all">
                                {item.audioName}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* delete button (top-right) */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        aria-label={`Delete question ${idx + 1}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-600 shadow-sm"
                        title="Delete question"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              className="border border-gray-300 text-[12px] px-4 py-[6px] rounded-xl text-gray-700 hover:bg-gray-100 dark:border-[#343434] dark:text-[#fff] dark:bg-[#343434]"
              onClick={() => setAssignments([])}
            >
              Cancel
            </button>
            <button
              className="bg-[#576CBC] text-white text-[12px] px-4 py-[6px] rounded-xl hover:bg-[#43599e]"
              onClick={submitAssignment}
            >
              Assign
            </button>
          </div>
        </div>
        {success && (
          <SuccessPopup
            onClose={() => setSuccess(false)}
            title={successMessage}
          />
        )}
        {failed && (
          <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
        )}
      </div>
    </BaseLayout>
  );
};

export default NewAssignment;
