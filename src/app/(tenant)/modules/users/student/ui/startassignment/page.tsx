"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useSearchParams, useRouter } from "next/navigation";
import { FaStar } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";
import StudentHeader from "../../components/StudentHeader";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type QuizData = {
  _id: string;
  question: string;
  options?: string[];
  answer?: string;
  placeholder?: string;
  passage?: string;
  imageUrl?: string;
  uploadFile?: string;
  audioUrl?: string;
  audioFile?: string;
  correctAnswer?: string;
  words?: string[];
  matches?: string[];
  type?: string;
  description?: string;
};

interface Assignment {
  _id: string;
  assignmentName: string;
  assignmentType: string;
  assignedTeacher: string;
  assignedDate: string; // ISO date string
  dueDate: string; // ISO date string
  createdBy: string;
  createdDate: string; // ISO date string
  updatedBy?: string;
  updatedDate?: string; // ISO date string
  studentId: string;
  status: string; // e.g., "Assigned"
  level: string;
  question: string;
  hasOptions: boolean;
  chooseType: boolean;
  trueorfalseType: boolean;
  options?: string[]; // Only if `hasOptions: true`
  correctAnswer?: string; // Only if `hasOptions: true`
  answer?: string;
  answerValidation?: string;
  audioFile?: string; // Base64 or URL
  uploadFile?: string; // Base64 or URL (for images)
  passage?: string;
  words?: string[];
  matches?: string[];
  courses?: string;
  type?: string;
}

// Add API response interfaces
interface AssignmentApiResponse {
  status: string;
  count: number;
  data: AssignmentApiItem[];
}

interface AssignmentApiItem {
  _id: string;
  studentId: string;
  studentName: string;
  sessionClassType: string;
  assignmentName: string;
  questionName: string;
  questionType: string;
  typeofQuestion: string;
  title: string;
  assignedTeacher: string;
  assignedTeacherId: string;
  assignmentId: string;
  assignmentType: {
    type: string;
    name: string;
  };
  chooseType: boolean;
  trueorfalseType: boolean;
  question: string;
  hasOptions: boolean;
  options: {
    optionOne: string;
    optionTwo: string;
    optionThree: string;
    optionFour: string;
  };
  audioFile?: string;
  uploadFile?: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  level: string;
  courses: string;
  assignedDate: string;
  dueDate: string;
  answer: string;
  answerValidation: string;
  assignmentStatus: string;
  score: number;
  rating: string;
  __v: number;
}

// AudioWavePlayer component for waveform audio UI
const AudioWavePlayer = ({ audioUrl }: { audioUrl: string }) => {
  const waveformRef = React.useRef<HTMLDivElement | null>(null);
  const wavesurfer = React.useRef<any>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (waveformRef.current && audioUrl) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#818790",
        progressColor: "#223857",
        height: 48,
        barWidth: 3,
        cursorWidth: 0,
      });
      wavesurfer.current.load(audioUrl);

      wavesurfer.current.on("ready", () => {
        setDuration(wavesurfer.current.getDuration());
      });
      wavesurfer.current.on("audioprocess", () => {
        setCurrent(wavesurfer.current.getCurrentTime());
      });
      wavesurfer.current.on("finish", () => {
        setIsPlaying(false);
        setCurrent(0);
      });
    }
    return () => {
      if (
        wavesurfer.current &&
        typeof wavesurfer.current.destroy === "function"
      ) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(wavesurfer.current.isPlaying());
    }
  };

  // Format time as mm:ss
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="flex items-center bg-[#f7f8fa] dark:bg-[#242424] rounded-full px-4 py-2 w-full max-w-md mb-6">
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-[#223857] dark:bg-[#576cbc] flex items-center justify-center mr-3"
      >
        {isPlaying ? (
          <svg
            width="20"
            height="20"
            fill="currentColor"
            className="text-white dark:text-[#fff]"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="4" width="4" height="16" rx="2" />
            <rect x="14" y="4" width="4" height="16" rx="2" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            fill="currentColor"
            className="text-white"
            viewBox="0 0 24 24"
          >
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>
      <div ref={waveformRef} className="flex-1" />
      <span
        className="mx-2 text-[#818790] dark:text-[#b5b8c5] font-medium text-sm"
        style={{ minWidth: 40, textAlign: "right" }}
      >
        {formatTime(current)} / {formatTime(duration)}
      </span>
      <span className="ml-2">
        <svg
          width="22"
          height="22"
          fill="currentColor"
          className="text-[#818790] dark:text-[#b5b8c5]"
          viewBox="0 0 24 24"
        >
          <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02z" />
        </svg>
      </span>
    </div>
  );
};



const handleBackClick = (currentQuestionIndex: number, setCurrentQuestionIndex: (cb: (prev: number) => number) => void, setSelectedOption: (v: any) => void, setWrittenAnswer: (v: string) => void) => {
  if (currentQuestionIndex > 0) {
    setCurrentQuestionIndex((prev) => prev - 1);
    setSelectedOption(null);
    setWrittenAnswer("");
  }
};


const QuizPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams ? searchParams.get("type") : null;
  const assignmentId = searchParams ? searchParams.get("assignmentId") : null;
  // Mock assignment and quiz data for UI only
  const [quizData, setQuizData] = useState<QuizData[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const currentQuestion = quizData[currentQuestionIndex];
  // State for sentence builder question
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  // For check/feedback state
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  // Reset selectedWords and check state when question changes
  useEffect(() => {
    setSelectedWords([]);
    setIsChecked(false);
    setIsCorrect(null);
  }, [currentQuestionIndex]);

  // Add a ref for the sentence builder audio
  const sentenceBuilderAudioRef = useRef<HTMLAudioElement | null>(null);
  const handlePlaySentenceAudio = () => {
    if (sentenceBuilderAudioRef.current) {
      // Debug log for audio URL
      if (currentQuestion && currentQuestion.audioUrl) {
        // audio URL available
      }
      sentenceBuilderAudioRef.current.currentTime = 0;
      sentenceBuilderAudioRef.current.play();
    }
  };

  // Set quiz data from API on mount
  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoading(true);
      try {
       const token =
    typeof window !== "undefined" ? localStorage.getItem("StudentAuthToken") : null;
      if (!token) {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
        return;
      }
        const studentId = localStorage.getItem("StudentPortalId");

        if (!token || !studentId) {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
          return;
        }
       const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_LIST}?assignmentId=${assignmentId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        const data: AssignmentApiResponse = await res.json();

        // Transform API data to QuizData[]
        const quizItems: QuizData[] = data.data.map((item) => {
          // Normalize assignment type whether it's an object or a string
          const rawType =
            typeof item.assignmentType === "object" && item.assignmentType !== null
              ? (item.assignmentType as any).type
              : (item.assignmentType as any);
          let type = rawType ? String(rawType).toLowerCase() : "";
          let options: string[] | undefined = undefined;

          // Helper: normalize image URL (absolute, relative, raw base64, or MongoDB $binary)
          const normalizeImageUrl = (value?: any): string | undefined => {
            if (!value || value === "null") return undefined;
            // handle MongoDB binary object: { $binary: { base64: '...' } }
            if (typeof value === "object") {
              const bin = (value.$binary || value.binary) as any;
              if (bin && bin.base64) {
                const b64 = bin.base64 as string;
                const sig = b64.slice(0, 8);
                const mime = sig.startsWith("iVBOR")
                  ? "image/png"
                  : sig.startsWith("/9j/")
                  ? "image/jpeg"
                  : sig.startsWith("UklG")
                  ? "image/webp"
                  : sig.startsWith("R0lG")
                  ? "image/gif"
                  : "image/png";
                return `data:${mime};base64,${b64}`;
              }
              if (typeof value.url === "string") return normalizeImageUrl(value.url);
              return undefined;
            }
            if (typeof value !== "string") return undefined;
            if (value.startsWith("data:")) return value;
            if (value.startsWith("http://") || value.startsWith("https://")) return value;
            if (value.startsWith("/")) return `https://api.blackstoneinfomaticstech.com${value}`;
            const looksBase64Image = value.length > 100 && /^(iVBOR|\/9j\/|UklG|R0lG)/.test(value);
            if (looksBase64Image) {
              const mime = value.startsWith("UklG")
                ? "image/webp"
                : value.startsWith("iVBOR")
                ? "image/png"
                : value.startsWith("R0lG")
                ? "image/gif"
                : "image/jpeg";
              return `data:${mime};base64,${value}`;
            }
            return `https://api.blackstoneinfomaticstech.com/${value.replace(/^\/+/, "")}`;
          };

          // Helper: normalize audio (supports raw base64 strings or MongoDB $binary)
          const normalizeAudioUrl = (value?: any): string | undefined => {
            if (!value || value === "null") return undefined;
            if (typeof value === "object") {
              const bin = (value.$binary || value.binary) as any;
              if (bin && bin.base64) {
                const b64 = bin.base64 as string;
                const sig = b64.slice(0, 8);
                const mime = sig.startsWith("SUQz") || sig.startsWith("/+M") ? "audio/mpeg" : "audio/wav";
                return `data:${mime};base64,${b64}`;
              }
              if (typeof value.url === "string") return normalizeAudioUrl(value.url);
              return undefined;
            }
            if (typeof value !== "string") return undefined;
            if (value.startsWith("data:audio") || value.startsWith("http://") || value.startsWith("https://")) return value;
            // assume raw base64 audio
            if (value.length > 100 && !value.includes("/")) return `data:audio/wav;base64,${value}`;
            return value.startsWith("/") ? `https://api.blackstoneinfomaticstech.com${value}` : `https://api.blackstoneinfomaticstech.com/${value}`;
          };

          // Quiz type logic
          if (type === "quiz") {
            if (item.chooseType) {
              type = "quiz-choose";
              options = [
                item.options.optionOne,
                item.options.optionTwo,
                item.options.optionThree,
                item.options.optionFour,
              ].filter(Boolean);
            } else if (item.trueorfalseType) {
              type = "quiz-truefalse";
              options = ["True", "False"];
            }
          }

          // Writing
          if (type === "writing") {
            return {
              _id: item._id,
              question: item.question,
              audioUrl: normalizeAudioUrl(item.audioFile),
              uploadFile: normalizeImageUrl(item.uploadFile),
              correctAnswer: item.answerValidation !== "null" ? item.answerValidation : undefined,
              type: "writing",
            };
          }

          if (
            type &&
            (type.includes("reading comprehension") ||
              type.includes("reading-comprehension") ||
              type.replace(/[-_\s]/g, "").includes("readingcomprehension"))
          ) {
            options = item.chooseType || item.hasOptions
              ? [
                  item.options.optionOne,
                  item.options.optionTwo,
                  item.options.optionThree,
                  item.options.optionFour,
                ].filter(Boolean)
              : undefined;
            return {
              _id: item._id,
              question: item.question,
              options,
              audioUrl: normalizeAudioUrl(item.audioFile),
              uploadFile: normalizeImageUrl(item.uploadFile),
              correctAnswer: item.answerValidation !== "null" ? item.answerValidation : undefined,
              type: "reading-comprehension",
            };
          }

          // Reading (may include image or audio provided by backend)
          if (type === "reading") {
            return {
              _id: item._id,
              question: item.question,
              uploadFile: normalizeImageUrl(item.uploadFile),
              audioUrl: normalizeAudioUrl(item.audioFile),
              correctAnswer: item.answerValidation !== "null" ? item.answerValidation : undefined,
              type: "reading",
            };
          }

          // Quiz Choose/TrueFalse
          if (type === "quiz-choose" || type === "quiz-truefalse") {
            return {
              _id: item._id, // <-- this is critical!
              question: item.question,
              options,
              correctAnswer:
                item.answerValidation !== "null"
                  ? item.answerValidation
                  : undefined,
              type,
            };
          }

          // Word-match
          if (
            type &&
            (type.replace(/[-_]/g, "").includes("word match") ||
              type.replace(/[-_\s]/g, "").includes("wordmatch"))
          ) {
            type = "word-match";
            let words: string[] | undefined = undefined;
            if (
              item.options &&
              (item.options.optionOne ||
                item.options.optionTwo ||
                item.options.optionThree ||
                item.options.optionFour)
            ) {
              words = [
                item.options.optionOne,
                item.options.optionTwo,
                item.options.optionThree,
                item.options.optionFour,
              ].filter(Boolean);
            } else if (
              item.answerValidation &&
              item.answerValidation !== "null"
            ) {
              words = item.answerValidation.split(" ");
            } else if (item.question) {
              words = item.question.split(" ");
            }
            return {
              _id: item._id,
              question: item.question || "",
              words,
              correctAnswer: item.answerValidation !== "null" ? item.answerValidation : undefined,
              type: "word-match",
              uploadFile: normalizeImageUrl(item.uploadFile),
              audioFile: item.audioFile,
              audioUrl: normalizeAudioUrl(item.audioFile),
            };
          }

          // Image identification
          if (
            type === "image identification" ||
            type === "image-identification"
          ) {
            const uploadFile = normalizeImageUrl(item.uploadFile);
            options = [
              item.options.optionOne,
              item.options.optionTwo,
              item.options.optionThree,
              item.options.optionFour,
            ].filter(Boolean);
            return {
              _id: item._id, // <-- this is critical!
              question: item.question || "",
              options,
              uploadFile,
              correctAnswer:
                item.answerValidation !== "null"
                  ? item.answerValidation
                  : undefined,
              type: "image-identification",
            };
          }

          // fallback
          return { _id: item._id, question: item.question || "", type: type || "unknown" };
        });
        setQuizData(quizItems);
        if (data.data && data.data.length > 0) {
          // Map assignmentType to string for Assignment type
          const first = data.data[0];
          setAssignment({
            ...first,
            assignmentType: typeof first.assignmentType === 'object' && first.assignmentType !== null ? first.assignmentType.type : (first.assignmentType || ''),
            options: first.options
              ? [
                  first.options.optionOne,
                  first.options.optionTwo,
                  first.options.optionThree,
                  first.options.optionFour,
                ].filter(Boolean)
              : [],
          });
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error(AppFailureToastMessages.ASSIGNMENT_FETCH);
      }
    };

    if (assignmentId) {
      fetchAssignments();
    }
  }, [assignmentId]);
  // Add after useState for score
  const [userAnswers, setUserAnswers] = useState<{ [id: string]: string }>({});
  const [totalScore, setTotalScore] = useState<number>(0);
  const [backendScore, setBackendScore] = useState<number | null>(null);
  // For multiple choice, true/false, image identification, update userAnswers on option click
  const handleOptionClick = (option: string) => {
    let answerToStore = option;
    // For true/false, always capitalize first letter
    if (currentQuestion?.type === "quiz-truefalse") {
      answerToStore = option.charAt(0).toUpperCase() + option.slice(1).toLowerCase();
    }
    setSelectedOption(answerToStore);
    if (currentQuestion && currentQuestion._id) {
        setUserAnswers((prev) => {
        const updated = { ...prev, [currentQuestion._id]: answerToStore };
        return updated;
      });
    }
    // Local validation (optional)
    if (
      currentQuestion.correctAnswer &&
      answerToStore.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()
    ) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setIsChecked(true);
  };

 

  const handleWordClick = (word: string) => {
    if (!selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleRemoveWord = (index: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

 

  const handleCheck = () => {
    if (
      currentQuestion?.type === "word-match" &&
      currentQuestion?.correctAnswer &&
      currentQuestion._id
    ) {
      const correct = currentQuestion.correctAnswer.trim().toLowerCase();
      setUserAnswers((prev) => {
        const updated = { ...prev, [currentQuestion._id]: selectedWords.join(" ") };
        return updated;
      });
      setIsChecked(true);
      if (selectedWords.length === 1) {
        // Single word answer
        if (selectedWords[0].trim().toLowerCase() === correct) {
          setIsCorrect(true);
        } else {
          setIsCorrect(false);
        }
      } else {
        // Phrase answer
        const userSentence = selectedWords.join(" ").trim().toLowerCase();
        if (userSentence === correct) {
          setIsCorrect(true);
        } else {
          setIsCorrect(false);
        }
      }
    }
  };



  // Update handleNextClick to call updateAssignment
  const handleNextClick = async () => {
    // If current question is reading, store recordedText as answer
    if (currentQuestion?.type === "reading" && currentQuestion._id) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion._id]: recordedText.trim(),
      }));
    }
    // Move to the next question or submit the quiz
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizCompleted(true);
    }

    // Reset state after the user has selected an option
    setIsChecked(false);
    setIsCorrect(null);
  };

  // Add submitAnswers function to send all answers at once
  const submitAnswers = async () => {
    // submitting userAnswers
    const answersArray = quizData.map((q) => {
      let userAnswer = userAnswers[q._id] || "";
      let correctAnswer = q.correctAnswer || "";
      // For reading, use the recorded text as is (from userAnswers or recordedText)
      if (q.type === "reading") {
        userAnswer = userAnswers[q._id] || recordedText || "";
      }
      // Local validation for score (word-for-word, case-insensitive)
      const isCorrect = wordsMatchCaseInsensitive(userAnswer, correctAnswer);
      return {
        _id: q._id,
        answer: isCorrect ? correctAnswer : userAnswer, // send answerValidation if correct
        isCorrect,
        updatedBy: "Student",
        updatedDate: new Date().toISOString(),
      };
    });

    if (answersArray.length === 0) {
      toast.error(AppValidationMessages.ASSIGNMENT.ANSWER_REQUIRED);
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("StudentAuthToken") : null;
      if (!token) {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
        return;
      }
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_LIST}/bulk?assignmentId=${assignmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(answersArray),
        }
      );
      const data = await res.json();
      if (typeof data.totalScore === 'number') {
        setBackendScore(data.totalScore);
      }
      setIsQuizCompleted(true);
      setIsSubmitted(true);
    } catch (err) {
      toast.error(AppFailureToastMessages.ASSIGNMENT_SUBMISSION_FAILED);
    }
  };

  // Helper: word-for-word, case-insensitive match
  function wordsMatchCaseInsensitive(a: string, b: string) {
    const aWords = (a || '').trim().toLowerCase().split(/\s+/);
    const bWords = (b || '').trim().toLowerCase().split(/\s+/);
    if (aWords.length !== bWords.length) return false;
    return aWords.every((word, idx) => word === bWords[idx]);
  }


  // Star rating calculation (proportional)
  const calculateStarRating = (score: number, total: number) => {
    const starCount = 5;
    if (total > 0 && score === total) {
      // All correct, always 5 stars
      return Array.from({ length: starCount }, (_, i) =>
        <FaStar key={i} className='text-[#faab3c]' />
      );
    }
    const filledStars = Math.round((score / (total || 1)) * starCount);
    return Array.from({ length: starCount }, (_, i) =>
      <FaStar key={i} className={i < filledStars ? 'text-[#faab3c]' : 'text-gray-200'} />
    );
  };

  useEffect(() => {
    let correct = 0;
    quizData.forEach(q => {
      const userAnswer = (userAnswers[q._id] || '').trim().toLowerCase();
      const correctAnswer = (q.correctAnswer || '').trim().toLowerCase();
      if (wordsMatchCaseInsensitive(userAnswer, correctAnswer)) correct += 1;
    });
    setTotalScore(correct);
  }, [userAnswers, quizData]);


  const [recordedText, setRecordedText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechChecked, setIsSpeechChecked] = useState(false);
  const [isSpeechCorrect, setIsSpeechCorrect] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleStartSpeaking = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        setRecordedText(event.results[0][0].transcript);
      };
      recognition.onend = () => {
        setIsSpeaking(false);
      };
      recognitionRef.current = recognition;
      setRecordedText("");
      setIsSpeaking(true);
      recognition.start();
    } else {
      toast.error(AppFailureToastMessages.SPEECH_RECOGNITION_UNSUPPORTED);
    }
  };
  const handleStopSpeaking = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsSpeaking(false);
    }
  };
  const handleResetSpeaking = () => {
    setRecordedText("");
    setIsSpeechChecked(false);
    setIsSpeechCorrect(null);
  };
 

  const renderQuizContent = () => {
    const q = currentQuestion;
    console.log("quizData:", quizData);
    console.log("currentQuestionIndex:", currentQuestionIndex);
    console.log("currentQuestion:", q);

    // Sentence Builder (Reorder Words) - always prioritize word-match type
    if (q?.type === "word-match" && q.words && q.words.length > 0) {
      return (
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-full p-16 px-40 flex flex-col items-center mx-auto">
            <h2 className="text-2xl font-bold text-[#223857] mb-2 text-center dark:text-[#fff] dark:opacity-80">
              Question {currentQuestionIndex + 1} / {quizData.length}
            </h2>
            <div className="w-full max-w-full bg-[#f4f5fb] dark:bg-[#343434] rounded-xl p-4 flex flex-col items-center mx-auto min-h-[400px] justify-center">
              <h2 className="text-[16px] font-medium text-gray-800 mb-4 text-center dark:text-[#fff] dark:opacity-90">
                {q.question}
              </h2>

              {/* Cartoon character and speech bubble */}
              <div className="flex items-center justify-center mb-8 w-full">
                {/* Cartoon character (placeholder image) */}
                <div className="mr-4">
                  <img
                    src="/assets/images/q4.svg"
                    alt="Cartoon"
                    className="w-24 h-24"
                  />
                </div>
                {/* Speech bubble */}
                <div className="relative flex items-center">
                  <div className="bg-[#5c6bc0] text-white rounded-full px-8 py-6 flex items-center justify-center text-xl font-normal min-w-[180px] min-h-[70px] shadow-md relative">
                    <button
                      type="button"
                      onClick={handlePlaySentenceAudio}
                      className="focus:outline-none flex items-center justify-center mr-3"
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        margin: 0,
                        cursor: "pointer",
                      }}
                      aria-label="Play audio"
                    >
                      <svg
                        width="32"
                        height="32"
                        fill="white"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 9v6h4l5 5V5L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02z" />
                      </svg>
                    </button>
                    <span className="align-middle text-[12px]">
                      Tap & Listen
                    </span>
                    {/* Hidden audio element for playback */}
                    <audio
                      ref={sentenceBuilderAudioRef}
                      src={
                        q.audioUrl || (typeof q.uploadFile === 'string' && q.uploadFile.startsWith('data:audio') ? q.uploadFile : undefined)
                      }
                      preload="auto"
                      onError={() =>
                        toast.error(AppFailureToastMessages.AUDIO_PLAYBACK_FAILED)
                      }
                    />
                  </div>
                  {/* Bubble tail - left middle */}
                  <svg
                    width="40"
                    height="80"
                    viewBox="0 0 32 32"
                    className="absolute -left-6 top-3/4 -translate-y-1/2 rotate-180"
                    style={{ zIndex: 1 }}
                  >
                    <path d="M32 16 Q8 12 0 32 Q16 16 32 16" fill="#5c6bc0" />
                  </svg>
                </div>
              </div>
              {/* Display image if provided (word-match may include an image) */}
              {q.uploadFile && typeof q.uploadFile === "string" && (q.uploadFile.startsWith("data:image") || q.uploadFile.startsWith("http")) && (
                <div className="mb-6 flex justify-center">
                  <img src={q.uploadFile} alt="question" className="max-w-full max-h-48 rounded-md" />
                </div>
              )}

              {/* Word buttons */}
              <div className="flex flex-wrap gap-4 mb-6 justify-center">
                {q.words &&
                  q.words.map((word, idx) => {
                    // Determine button color after checking
                    let btnClass = "bg-white text-gray-800 hover:bg-gray-100";
                    if (isChecked && selectedWords.includes(word)) {
                      if (isCorrect) {
                        btnClass = "bg-green-600 text-white dark:bg-green-600";
                      } else {
                        btnClass = "bg-red-500 text-white dark:bg-red-500";
                      }
                    } else if (selectedWords.includes(word)) {
                      btnClass = "bg-gray-300 text-gray-400";
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleWordClick(word)}
                        disabled={selectedWords.includes(word) || isChecked}
                        className={`px-6 py-3 rounded-lg  border border-[#818790] bg-[#e6e9ed] dark:bg-[#818790] dark:text-[#fff] text-base font-medium transition-all shadow-sm ${btnClass}`}
                      >
                        {word}
                      </button>
                    );
                  })}
              </div>
              {/* Selected words preview */}
              <div className="flex flex-col justify-between">
                <div className="flex flex-wrap gap-2 mb-6 min-h-[48px] justify-center">
                  {selectedWords.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-6 py-3 rounded-lg bg-blue-200 text-blue-900 dark:bg-[#818790] font-semibold cursor-pointer"
                      onClick={() => !isChecked && handleRemoveWord(idx)}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                {/* Skip and Check buttons below options */}
                <div className="flex flex-row w-full mb-4">
                  <button
                    onClick={handleCheck}
                    className={`px-6 py-2 rounded-md font-semibold ${
                      isChecked
                        ? isCorrect
                          ? "bg-[#377e36] text-white"
                          : "bg-red-500 text-white"
                        : "bg-[#377e36] text-white hover:bg-green-700"
                    } shadow-sm`}
                    disabled={selectedWords.length === 0 || isChecked}
                  >
                    Check
                  </button>
                </div>
              </div>

              {/* Feedback box */}
              {isChecked && (
                <div
                  className={`flex items-center gap-2 mb-6 px-6 py-4 rounded-md w-full max-w-md mx-auto font-semibold text-lg ${
                    isCorrect
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                  style={{
                    border: isCorrect
                      ? "1.5px solid #22c55e"
                      : "1.5px solid #ef4444",
                  }}
                >
                  {isCorrect ? (
                    <span className="mr-2">
                      <svg
                        width="28"
                        height="28"
                        fill="#22c55e"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="#22c55e"
                          opacity="0.15"
                        />
                        <path
                          d="M9.5 13.5l2 2 4-4"
                          stroke="#22c55e"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="mr-2">
                      <svg
                        width="28"
                        height="28"
                        fill="#ef4444"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="#ef4444"
                          opacity="0.15"
                        />
                        <path
                          d="M15 9l-6 6M9 9l6 6"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </span>
                  )}
                  {isCorrect ? "Correct Answer" : "Wrong Answer"}
                </div>
              )}
            </div>
            {/* Navigation */}
            <div className="flex w-full justify-between mt-4">
              <button
                onClick={() => handleBackClick(currentQuestionIndex, setCurrentQuestionIndex, setSelectedOption, setWrittenAnswer)}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-md font-semibold ${
                  currentQuestionIndex === 0
                    ? "bg-[#e1e4f3] dark:bg-[#252628] border border-[#c2cae7] dark:border-[#303538] dark:text-[#303538] text-[#c2cae7] cursor-not-allowed"
                    : "bg-gray-200 dark:bg-[#252628] text-gray-700 dark:text-[#818790] hover:bg-gray-300 dark:hover:bg-[#303538]"
                }`}
              >
                Previous
              </button>
              {currentQuestionIndex < quizData.length - 1 ? (
                <button
                  onClick={handleNextClick}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitAnswers}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Listen & Write (only if not writing)
    if (q?.audioUrl && q?.type !== "writing") {
      return (
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-full p-16 px-40 flex flex-col items-center mx-auto">
            {/* Question Number */}
            <h2 className="text-2xl font-bold text-[#223857] mb-4 text-center dark:text-[#fff] dark:opacity-80">
              Question {currentQuestionIndex + 1} / {quizData.length}
            </h2>
            <div className="w-full max-w-full bg-[#f4f5fb] dark:bg-[#343434] rounded-xl p-4 flex flex-col items-center mx-auto min-h-[400px] justify-center">
              {/* Question Text */}
              <h2 className="text-[14px] font-medium text-gray-800 mb-14 text-center dark:text-[#fff] dark:opacity-90">
                {q.question}
              </h2>
              {q.audioUrl && (
                <div className="mb-6">
                  <AudioWavePlayer audioUrl={q.audioUrl} />
                </div>
              )}

              <input
                type="text"
                className="text-[8px] border border-[#babecc] rounded-xl px-4 py-3 w-[600px] h-[150px] mx-auto mb-6 bg-[#f4f5fb] dark:bg-[#343434] dark:border-[#fff] dark:border-opacity-40 dark:text-white dark:placeholder-gray-400"
                placeholder={q.placeholder || "Type what you hear..."}
                value={writtenAnswer}
                onChange={(e) => {
                  setWrittenAnswer(e.target.value);
                  if (currentQuestion && currentQuestion._id) {
                    setUserAnswers((prev) => {
                      const updated = { ...prev, [currentQuestion._id]: e.target.value };
                      console.log('Updated userAnswers (written):', updated);
                      return updated;
                    });
                  }
                }}
              />
            </div>
            <div className="flex w-full justify-between mt-4">
              <button
                onClick={() => handleBackClick(currentQuestionIndex, setCurrentQuestionIndex, setSelectedOption, setWrittenAnswer)}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-md font-semibold ${
                  currentQuestionIndex === 0
                    ? "bg-[#e1e4f3] dark:bg-[#252628] border border-[#c2cae7] dark:border-[#303538] dark:text-[#303538] text-[#c2cae7]"
                    : "bg-gray-200 dark:bg-[#252628] text-gray-700 dark:text-[#818790] hover:bg-gray-300 dark:hover:bg-[#303538]"
                }`}
              >
                Previous
              </button>
              {currentQuestionIndex < quizData.length - 1 ? (
                <button
                  onClick={handleNextClick}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitAnswers}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Reading
    if (q?.type === "reading") {
      return (
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-full p-16 px-40 flex flex-col items-center mx-auto">
            <h2 className="text-2xl font-bold text-[#223857] mb-2 text-center dark:text-[#fff] dark:opacity-80">
              Question {currentQuestionIndex + 1} / {quizData.length}
            </h2>
            <div className="w-full flex flex-col max-w-full bg-[#f4f5fb] dark:bg-[#343434] rounded-xl p-4 items-center mx-auto min-h-[400px] justify-center">
              <div className="flex flex-row">
                <div className="flex flex-col items-center justify-center mr-20 p-0">
                 
                </div>
                {/* Right: Question and controls */}
                <div className="flex flex-col  justify-start flex-1 min-w-[320px] max-w-[500px] -ml-48">
                  <h2 className="text-[18px] font-semibold text-[#223857] mb-2 text-left w-full dark:text-[#fff] dark:opacity-90">
                    Tap the icon and read the following
                  </h2>
                  <p className="text-[13px] text-gray-700 mb-4 text-left w-full dark:text-[#fff] dark:opacity-80">
                    {q.question}
                  </p>
                  {/* Render provided audio (teacher) and image if present */}
                  {q.audioUrl && (
                    <div className="mb-4 w-full flex justify-center">
                      <AudioWavePlayer audioUrl={q.audioUrl} />
                    </div>
                  )}
                  {q.uploadFile && typeof q.uploadFile === "string" && (q.uploadFile.startsWith("data:image") || q.uploadFile.startsWith("http")) && (
                    <div className="mb-6 flex justify-center w-full">
                      <img src={q.uploadFile} alt="question" className="max-w-full max-h-48 rounded-md" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center mb-2">
                {/* Record controls row */}
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={handleResetSpeaking}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-all"
                    title="Reset"
                    type="button"
                  >
                    <svg
                      width="22"
                      height="22"
                      fill="none"
                      stroke="#223857"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2 12A10 10 0 1 0 12 2v4" />
                    </svg>
                  </button>
                  <button
                    onClick={isSpeaking ? handleStopSpeaking : handleStartSpeaking}
                    aria-label={isSpeaking ? "Stop Recording" : "Start Recording"}
                    style={{ position: "relative", width: 120, height: 120, background: "none", border: "none", padding: 0, margin: 0 }}
                    className="flex items-center justify-center focus:outline-none"
                    type="button"
                  >
                    {/* Outer circles */}
                    <span
                      style={{
                        position: "absolute",
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: "#576cbc",
                        opacity: 0.07,
                        left: 0,
                        top: 0,
                        zIndex: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        background: "#576cbc",
                        opacity: 0.13,
                        left: 15,
                        top: 15,
                        zIndex: 1,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        width: 65,
                        height: 65,
                        borderRadius: "50%",
                        background: "#576cbc",
                        opacity: 0.18,
                        left: 27.5,
                        top: 27.5,
                        zIndex: 2,
                      }}
                    />
                    {/* Main blue button */}
                    <span
                      style={{
                        position: "absolute",
                        width: 55,
                        height: 55,
                        borderRadius: "50%",
                        background: "#576cbc",
                        boxShadow: "0 2px 8px 0 #576cbc33",
                        left: 32.5,
                        top: 32.5,
                        zIndex: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Mic icon */}
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                        <rect width="24" height="24" fill="none" />
                        <path
                          d="M12 16a4 4 0 0 0 4-4V9a4 4 0 0 0-8 0v3a4 4 0 0 0 4 4zm6-4a6 6 0 0 1-12 0"
                          stroke="#fff"
                          strokeWidth="2"
                          fill="none"
                        />
                        <rect x="11" y="17" width="2" height="3" rx="1" fill="#fff" />
                      </svg>
                    </span>
                  </button>
                  <button
                    onClick={handleResetSpeaking}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-all"
                    title="Cancel"
                    type="button"
                  >
                    <svg
                      width="22"
                      height="22"
                      fill="none"
                      stroke="#223857"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="6" y1="18" x2="18" y2="6" />
                    </svg>
                  </button>
                </div>
                <div className="text-center text-gray-600 dark:text-gray-300 min-h-[30px]">
                  {recordedText}
                </div>
                {isSpeechChecked && (
                  <div
                    className={`flex items-center gap-2 mt-2 px-6 py-4 rounded-md w-full max-w-md mx-auto font-semibold text-lg ${
                      isSpeechCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                    style={{
                      border: isSpeechCorrect
                        ? "1.5px solid #22c55e"
                        : "1.5px solid #ef4444",
                    }}
                  >
                    {isSpeechCorrect ? "Correct!" : "Try again!"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full justify-between mt-4">
              <button
                onClick={() => handleBackClick(currentQuestionIndex, setCurrentQuestionIndex, setSelectedOption, setWrittenAnswer)}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-md font-semibold ${
                  currentQuestionIndex === 0
                    ? "bg-[#e1e4f3] border border-[#c2cae7] text-[#c2cae7] cursor-not-allowed"
                    : " hover:bg-gray-300 bg-[#e1e4f3] dark:bg-[#252628] border border-[#c2cae7] dark:border-[#303538] dark:text-[#303538] text-[#c2cae7]"
                }`}
              >
                Previous
              </button>
              {currentQuestionIndex < quizData.length - 1 ? (
                <button
                  onClick={handleNextClick}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitAnswers}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

if (q?.type === "reading-comprehension" || q?.type === "reading comprehension") {
      return (
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-full p-16 px-40 flex flex-col items-center mx-auto">
            <h2 className="text-2xl font-bold text-[#223857] mb-2 text-center dark:text-[#fff] dark:opacity-80">
              Question {currentQuestionIndex + 1} / {quizData.length}
            </h2>
            <div className="w-full flex flex-col max-w-full bg-[#f4f5fb] dark:bg-[#343434] rounded-xl p-4 items-center mx-auto min-h-[400px] justify-center">
              <div className="flex flex-row">
                <div className="flex flex-col items-center justify-center mr-20 p-0">
                 
                </div>
                {/* Right: Question and controls */}
                <div className="flex flex-col  justify-start flex-1 min-w-[320px] max-w-[500px] -ml-48">
                  <h2 className="text-[18px] font-semibold text-[#223857] mb-2 text-left w-full dark:text-[#fff] dark:opacity-90">
                    Instructions
                  </h2>
                  <p className="text-[13px] text-gray-700 mb-4 text-left w-full dark:text-[#fff] dark:opacity-80">
                    {q.question}
                  </p>
                  {/* Render provided audio (teacher) and image if present */}
                  {q.audioUrl && (
                    <div className="mb-4 w-full flex justify-center">
                      <AudioWavePlayer audioUrl={q.audioUrl} />
                    </div>
                  )}
                  {q.uploadFile && typeof q.uploadFile === "string" && (q.uploadFile.startsWith("data:image") || q.uploadFile.startsWith("http")) && (
                    <div className="mb-6 flex justify-center w-full">
                      <img src={q.uploadFile} alt="question" className="max-w-full max-h-48 rounded-md" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex w-full justify-between mt-4">
              <button
                onClick={() => handleBackClick(currentQuestionIndex, setCurrentQuestionIndex, setSelectedOption, setWrittenAnswer)}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-md font-semibold ${
                  currentQuestionIndex === 0
                    ? "bg-[#e1e4f3] border border-[#c2cae7] text-[#c2cae7] cursor-not-allowed"
                    : " hover:bg-gray-300 bg-[#e1e4f3] dark:bg-[#252628] border border-[#c2cae7] dark:border-[#303538] dark:text-[#303538] text-[#c2cae7]"
                }`}
              >
                Previous
              </button>
              {currentQuestionIndex < quizData.length - 1 ? (
                <button
                  onClick={handleNextClick}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitAnswers}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Writing Question
    if (q?.type === "writing") {
      return (
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-full p-16 px-40 flex flex-col items-center mx-auto">
            <h2 className="text-2xl font-bold text-[#223857] mb-2 text-center dark:text-[#fff] dark:opacity-80">
              Question {currentQuestionIndex + 1} / {quizData.length}
            </h2>
            <div className="w-full max-w-full bg-[#f4f5fb] dark:bg-[#343434] rounded-xl p-4 flex flex-col items-center mx-auto min-h-[400px] justify-center">
              <h2 className="text-[16px] font-medium text-gray-800 mb-4 text-center dark:text-[#fff] dark:opacity-90">
                {q.question}
              </h2>
              {q.audioUrl && <AudioWavePlayer audioUrl={q.audioUrl} />}
              <textarea
                className="border border-[#babecc] rounded-xl px-4 py-3 w-[600px] h-[150px] mx-auto mb-6 bg-[#f4f5fb] dark:bg-[#343434] dark:border-[#fff] dark:border-opacity-40 dark:text-white dark:placeholder-gray-400"
                placeholder={q.placeholder || "Type what you hear..."}
                value={writtenAnswer}
                onChange={(e) => {
                  setWrittenAnswer(e.target.value);
                  if (currentQuestion && currentQuestion._id) {
                    setUserAnswers((prev) => {
                      const updated = { ...prev, [currentQuestion._id]: e.target.value };
                      console.log('Updated userAnswers (written):', updated);
                      return updated;
                    });
                  }
                }}
                disabled={isChecked}
              />
            </div>
            {/* Navigation */}
            <div className="flex w-full justify-between mt-4">
              <button
                onClick={() => handleBackClick(currentQuestionIndex, setCurrentQuestionIndex, setSelectedOption, setWrittenAnswer)}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-md font-semibold ${
                  currentQuestionIndex === 0
                    ? "bg-[#e1e4f3] border border-[#c2cae7] text-[#c2cae7] cursor-not-allowed"
                    : " hover:bg-gray-300 bg-[#e1e4f3] dark:bg-[#252628] border border-[#c2cae7] dark:border-[#303538] dark:text-[#303538] text-[#c2cae7]"
                }`}
              >
                Previous
              </button>
              {currentQuestionIndex < quizData.length - 1 ? (
                <button
                  onClick={handleNextClick}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitAnswers}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Identify the animal question
    if (q?.type === "image-identification") {
      console.log("Image Identification Image src:", q.uploadFile);
      return (
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-full p-16 px-40 flex flex-col items-center mx-auto">
            <h2 className="text-2xl font-bold text-[#223857] mb-2 text-center dark:text-[#fff] dark:opacity-80">
              Question {currentQuestionIndex + 1} / {quizData.length}
            </h2>
            <div className="w-full max-w-full bg-[#f4f5fb] dark:bg-[#343434] rounded-xl p-4 sm:p-4 flex flex-col md:flex-row items-center mx-auto min-h-[300px] md:min-h-[400px] justify-center gap-6 md:gap-8">
              {/* Left: Question and image */}
              <div className="flex flex-col items-center flex-1 px-2 sm:px-6 md:px-1 lg:px-1 ml-10">
                <h3 className="text-[20px] md:text-[20px] font-semibold text-[#223857] dark:text-[#fff] dark:opacity-70 mb-4 text-center">
                  {q.question}
                </h3>
                <div className="flex-shrink-0 w-full flex justify-center">
                  <img
                    src={q.uploadFile}
                    alt="Character"
                    style={{
                      objectFit: "cover",
                      background: "#fff",
                      borderRadius: "8px",
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/600x250?text=No+Image";
                    }}
                    className="w-full max-w-[500px] h-auto ml-0 md:ml-1 pl-10"
                  />
                </div>
              </div>
              {/* Right: Options */}
              <div className="flex flex-col gap-4 md:gap-6 flex-1 min-w-[220px] sm:min-w-[260px] md:min-w-[320px] px-2 sm:px-6 md:px-10 lg:px-14 ">
                {q.options &&
                  q.options.map((option, idx) => (
                    <button
                      key={option}
                      onClick={() => handleOptionClick(option)}
                      className={`w-full px-4 py-3 md:px-6 md:py-4 rounded-lg text-base md:text-lg font-medium text-center transition-all
                        ${
                          selectedOption === option
                            ? "bg-[#377e36] text-[#fff] font-bold"
                            : "bg-[#f4f5fb] text-[#223857] border-2 border-[#c5c7d0] dark:border-2 dark:border-[#5c5e63] dark:bg-[#303030] dark:text-[#818790]"
                        }
                      `}  
                    >
                      <span
                        className={`font-semibold mr-3 ${
                          selectedOption === option
                            ? "text-white"
                            : "text-[#818790]"
                        }`}
                      >
                        {String.fromCharCode(97 + idx)})
                      </span>
                      {option}
                    </button>
                  ))}
              </div>
            </div>
            {/* Navigation */}
            <div className="flex w-full justify-between mt-4">
              <button
                onClick={() => handleBackClick(currentQuestionIndex, setCurrentQuestionIndex, setSelectedOption, setWrittenAnswer)}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-md font-semibold ${
                  currentQuestionIndex === 0
                    ? "bg-[#e1e4f3] border border-[#c2cae7] text-[#c2cae7] cursor-not-allowed"
                    : " hover:bg-gray-300 bg-[#e1e4f3] dark:bg-[#252628] border border-[#c2cae7] dark:border-[#303538] dark:text-[#303538] text-[#c2cae7]"
                }`}
              >
                Previous
              </button>
              {currentQuestionIndex < quizData.length - 1 ? (
                <button
                  onClick={handleNextClick}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitAnswers}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Quiz True/False
    if (q?.type === "quiz-truefalse") {
      return (
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-full p-16 px-40 flex flex-col items-center mx-auto">
            <h2 className="text-2xl font-bold text-[#223857] dark:text-[#fff] dark:opacity-80 mb-4 text-center">
              Question {currentQuestionIndex + 1} / {quizData.length}
            </h2>
            <div className="w-full max-w-full bg-[#f4f5fb] dark:bg-[#343434] rounded-xl p-6 flex flex-col items-center mx-auto min-h-[400px] justify-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-[#fff] dark:opacity-90 mb-8 text-center">
                {q.question}
              </p>
              <div className="w-full flex flex-col gap-4 mb-8 items-center justify-center flex-1">
                {["True", "False"].map((option, index) => (
                  <button
                    key={option}
                    onClick={() => handleOptionClick(option)}
                    className={`w-[300px] px-6 py-3 rounded-lg border border-[#babecc] text-lg font-medium flex items-center justify-center transition-all
                    ${
                      selectedOption === option
                        ? isChecked
                          ? isCorrect && option.toLowerCase() === (q.correctAnswer || "").trim().toLowerCase()
                            ? "bg-[#377e36] text-white border-none"
                            : !isCorrect && option === selectedOption
                            ? "bg-red-500 text-white border-none"
                            : "bg-[#377e36] text-white border-none"
                          : "bg-[#377e36] text-white border-none"
                        : "bg-[#f3f4fb] dark:bg-[#343434] text-gray-800 dark:text-[#818790] hover:bg-gray-100"
                    }`}
                    disabled={isChecked}
                  >
                    <span className="font-bold mr-3">
                      {String.fromCharCode(97 + index) + ")"}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
              {/* Feedback box */}
              {isChecked && (
                <div
                  className={`flex items-center gap-2 mb-6 px-6 py-4 rounded-md w-full max-w-md mx-auto font-semibold text-lg ${
                    isCorrect
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                  style={{
                    border: isCorrect
                      ? "1.5px solid #22c55e"
                      : "1.5px solid #ef4444",
                  }}
                >
                  {isCorrect ? "Correct Answer" : "Wrong Answer"}
                </div>
              )}
            </div>
            <div className="flex w-full justify-between mt-4">
              <button
                onClick={() => handleBackClick(currentQuestionIndex, setCurrentQuestionIndex, setSelectedOption, setWrittenAnswer)}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-md font-semibold ${
                  currentQuestionIndex === 0
                    ? "bg-[#e1e4f3] border border-[#c2cae7] text-[#c2cae7] cursor-not-allowed"
                    : " hover:bg-gray-300 bg-[#e1e4f3] dark:bg-[#252628] border border-[#c2cae7] dark:border-[#303538] dark:text-[#303538] text-[#c2cae7]"
                }`}
              >
                Previous
              </button>
              {currentQuestionIndex < quizData.length - 1 ? (
                <button
                  onClick={handleNextClick}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitAnswers}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Quiz Choose
    if (q?.type === "quiz-choose" && q.options) {
      return (
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-full p-16 px-40 flex flex-col items-center mx-auto">
            <h2 className="text-2xl font-bold text-[#223857] dark:text-[#fff] dark:opacity-80 mb-4 text-center">
              Question {currentQuestionIndex + 1} / {quizData.length}
            </h2>
            <div className="w-full max-w-full bg-[#f4f5fb] dark:bg-[#343434] rounded-xl p-6 flex flex-col items-center mx-auto min-h-[400px] justify-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-[#fff] dark:opacity-90 mb-8 text-center">
                {q.question}
              </p>
              <div className="w-full flex flex-col gap-4 mb-8 items-center justify-center flex-1">
                {q.options.map((option, index) => (
                  <button
                    key={option}
                    onClick={() => handleOptionClick(option)}
                    className={`w-[300px] px-6 py-3 rounded-lg border border-[#babecc] text-lg font-medium flex items-center justify-center transition-all
                    ${
                      selectedOption === option
                        ? isChecked
                          ? isCorrect && option.trim().toLowerCase() === (q.correctAnswer || "").trim().toLowerCase()
                            ? "bg-[#377e36] text-white border-none"
                            : !isCorrect && option === selectedOption
                            ? "bg-red-500 text-white border-none"
                            : "bg-[#377e36] text-white border-none"
                          : "bg-[#377e36] text-white border-none"
                        : "bg-[#f3f4fb] dark:bg-[#343434] text-gray-800 dark:text-[#818790] hover:bg-gray-100"
                    }`}
                    disabled={isChecked}
                  >
                    <span
                      className={`font-bold mr-3 ${
                        selectedOption === option
                          ? "text-white"
                          : "text-[#818790]"
                      }`}
                    >
                      {String.fromCharCode(97 + index) + ")"}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
              {/* Feedback box */}
              {isChecked && (
                <div
                  className={`flex items-center gap-2 mb-6 px-6 py-4 rounded-md w-full max-w-md mx-auto font-semibold text-lg ${
                    isCorrect
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                  style={{
                    border: isCorrect
                      ? "1.5px solid #22c55e"
                      : "1.5px solid #ef4444",
                  }}
                >
                  {isCorrect ? "Correct Answer" : "Wrong Answer"}
                </div>
              )}
            </div>
            <div className="flex w-full justify-between mt-4">
              <button
                onClick={() => handleBackClick(currentQuestionIndex, setCurrentQuestionIndex, setSelectedOption, setWrittenAnswer)}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-md font-semibold ${
                  currentQuestionIndex === 0
                    ? "bg-[#e1e4f3] border border-[#c2cae7] text-[#c2cae7] cursor-not-allowed"
                    : " hover:bg-gray-300 bg-[#e1e4f3] dark:bg-[#252628] border border-[#c2cae7] dark:border-[#303538] dark:text-[#303538] text-[#c2cae7]"
                }`}
              >
                Previous
              </button>
              {currentQuestionIndex < quizData.length - 1 ? (
                <button
                  onClick={handleNextClick}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitAnswers}
                  className="px-10 py-2 rounded-md font-semibold bg-[#576cbc] text-white hover:bg-[#223857] transition-all"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Fallback for unknown or unsupported types
    return <div className="text-center">Question type not supported yet</div>;
  };


  return (
    <BaseLayout2>
      <StudentHeader currentSection="Assignments" />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col">
            {isQuizCompleted ? (
              <div className="flex items-center justify-center align-middle min-h-[400px] mt-16">
                <div className="bg-white rounded-2xl shadow-lg px-8 py-8 w-full max-w-md flex flex-col items-center">
                  {/* Green check circle */}
                  <div className="flex items-center justify-center mb-6">
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#dceeeb]">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="#00aa58" />
                        <path d="M8 12.5l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                  {/* Heading */}
                  <h2 className="text-2xl font-bold text-[#223857] mb-2 text-center">Nice Work</h2>
                  {/* Level */}
                  <div className="text-lg font-semibold text-[#223857] mb-2">
                    Level: {assignment?.level}
                  </div>
                  {/* Stars */}
                  <div className="flex gap-1 mb-2 justify-center">
                    {(() => {
                      const score = backendScore ?? totalScore;
                      const maxScore = quizData.length;
                      console.log("[Star Rating] Calculating stars:", {
                        backendScore,
                        totalScore,
                        usedScore: score,
                        maxScore,
                        quizDataLength: quizData.length,
                      });
                      return calculateStarRating(score, maxScore);
                    })()}
                  </div>
                  {/* No raw score shown */}
                  {/* Submit/Close button logic remains unchanged */}
                  {!isSubmitted ? (
                    <button
                      className="w-full py-3 rounded-xl bg-[#576cbc] text-white font-semibold text-lg shadow-md hover:bg-[#4059ad] transition"
                      onClick={submitAnswers}
                    >
                      Submit
                    </button>
                  ) : (
                    <button
                      className="w-full py-3 rounded-xl bg-[#576cbc] text-white font-semibold text-lg shadow-md hover:bg-[#4059ad] transition"
                      onClick={() => router.push('/modules/users/student/ui/assignment')}
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="items-center justify-center align-middle">
                {isLoading ? (
                  <p>Loading quiz data...</p>
                ) : (
                  <>

                    <div className="items-center justify-between align-middle">
                      {renderQuizContent()}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout2>
  );
};

export default QuizPage;
