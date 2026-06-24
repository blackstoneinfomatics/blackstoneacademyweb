import React, { useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface Props {
  question: string;
  options: string[];
  correctAnswer: string;
  studentAnswer: string;
  rating?: string;
  assignmentStatus?: string;
}
interface TrueFalseProps {
  question: string;
  correctAnswer: string;
  studentAnswer: string;
  rating?: string;
  assignmentStatus?: string;
}
interface ReadingAnswerCardProps {
  questionText: string;
  correctAnswer: string;
  studentAnswer: string;
  rating?: string;
  assignmentStatus?: string;
  uploadFile?: string;
}
interface WritingAnswerCardProps {
  question: string;
  audioFile?: string;
  studentAnswer: string;
  correctAnswer: string;
  rating?: string;
  assignmentStatus?: string;
}
interface ImageQuestionCardProps {
  question: string;
  imageUrl: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  rating?: string;
  assignmentStatus?: string;
}
interface MatchWordCardProps {
  questionText: string;
  audioFile: string;
  options: string[];
  selectedOption: string;
  correctAnswer: string;
  rating?: string;
  assignmentStatus?: string;
  uploadFile: string;
}
const AssignmentFooter = ({
  rating,
  assignmentStatus,
}: {
  rating?: string;
  assignmentStatus?: string;
}) => {
  if (!rating && !assignmentStatus) return null;

  return (
    <div className="mt-6 border-t pt-4 flex flex-col sm:flex-row justify-between items-center text-sm sm:text-base text-gray-700 dark:text-gray-300 gap-3">
      {rating && (
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#223857] dark:text-white">
            Rating:
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm font-semibold">
            {rating}
          </span>
        </div>
      )}
      {assignmentStatus && (
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#223857] dark:text-white">
            Status:
          </span>
          <span
            className={`px-2 py-1 rounded-md text-sm font-semibold ${
              assignmentStatus.toLowerCase() === "completed"
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {assignmentStatus}
          </span>
        </div>
      )}
    </div>
  );
};

export function QuizAnswerCard({
  question,
  options,
  correctAnswer,
  studentAnswer,
  rating,
  assignmentStatus,
}: Readonly<Props>) {
  return (
    <div className=" w-full max-w-2xl mx-auto bg-white mt-20 dark:bg-[#1D1D1D] p-6 md:p-8 rounded-xl shadow-md mb-6">
      {/* Question */}
      <h2 className="text-lg md:text-xl font-semibold text-center text-[#223857] dark:text-white mb-6">
        {question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-4">
        {options.map((option, index) => {
          const isSelected =
            option.trim().toLowerCase() === studentAnswer.trim().toLowerCase();
          const isCorrect =
            option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
          const isCorrectSelected = isSelected && isCorrect;

          const baseClass =
            "w-full text-left px-5 py-3 rounded-xl border font-medium text-sm sm:text-base transition-all";

          let btnClass = `${baseClass} ${
            isCorrectSelected
              ? "bg-[#377e36] text-white border-[#377e36]"
              : "bg-[#f6f7fb] text-[#223857] border-[#d1d5db] dark:bg-[#2a2a2a] dark:text-[#ccc] dark:border-[#444]"
          }`;

          return (
            <button key={index} disabled className={btnClass}>
              <span className="font-semibold mr-2">
                {String.fromCharCode(97 + index) + ")"}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <AssignmentFooter rating={rating} assignmentStatus={assignmentStatus} />
    </div>
  );
}

export function QuizTrueOrFalseAnswerCard({
  question,
  correctAnswer,
  studentAnswer,
  rating,
  assignmentStatus,
}: Readonly<TrueFalseProps>) {
  const options = ["True", "False"];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white mt-20 dark:bg-[#1D1D1D] p-6 md:p-8 rounded-xl shadow-md mb-6">
      {/* Question */}
      <h2 className="text-lg md:text-xl font-semibold text-center text-[#223857] dark:text-white mb-6">
        {question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-4">
        {options.map((option, index) => {
          const isSelected =
            option.trim().toLowerCase() === studentAnswer.trim().toLowerCase();
          const isCorrect =
            option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
          const isCorrectSelected = isSelected && isCorrect;

          const baseClass =
            "w-full text-left px-5 py-3 rounded-xl border font-medium text-sm sm:text-base transition-all";

          const btnClass = `${baseClass} ${
            isCorrectSelected
              ? "bg-[#377e36] text-white border-[#377e36]"
              : "bg-[#f6f7fb] text-[#223857] border-[#d1d5db] dark:bg-[#2a2a2a] dark:text-[#ccc] dark:border-[#444]"
          }`;

          return (
            <button key={index} disabled className={btnClass}>
              <span className="font-semibold mr-2">
                {String.fromCharCode(97 + index) + ")"}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <AssignmentFooter rating={rating} assignmentStatus={assignmentStatus} />
    </div>
  );
}

export function ReadingAnswerCard({
  questionText,
  correctAnswer,
  studentAnswer,
  rating,
  uploadFile,
  assignmentStatus,
}: Readonly<ReadingAnswerCardProps>) {
  const isCorrect =
    correctAnswer?.trim().toLowerCase() === studentAnswer.trim().toLowerCase();

  const getAnswerStyle = (isCorrect: boolean) => {
    return isCorrect
      ? "bg-green-100 text-green-700 border-green-300"
      : "bg-red-100 text-red-700 border-red-300";
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#1D1D1D] p-6 md:p-8 rounded-xl shadow-md mt-20 mb-6">
      {/* Image & Question */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
             <div className="w-full md:w-1/3 flex flex-col items-center gap-3">

  {/* Default UI Image */}
  <img
    src="/assets/images/e29f5a242d90e893b072f94ab653fc21c7800912.png"
    alt="Reading girl"
    className="max-h-40 w-auto border border-white dark:border-[#1D1D1D]"
  />

  {/* Uploaded Image */}
  {uploadFile && (
    <img
      src={
        uploadFile.startsWith("data:image")
          ? uploadFile
          : uploadFile.startsWith("http")
          ? uploadFile
          : `data:image/jpeg;base64,${uploadFile}`
      }
      alt="Uploaded"
      className="max-h-40 w-auto rounded-md shadow border items-center border-white dark:border-[#1D1D1D]"
    />
  )}

</div>
        <div className="w-full md:w-2/3">
          <h2 className="text-lg md:text-xl font-semibold text-[#223857] dark:text-white mb-2">
            Question
          </h2>
          <p className="text-sm md:text-base text-gray-700 dark:text-gray-200">
            {questionText}
          </p>
        </div>
      </div>

      {/* Student Answer */}
      <div className="flex flex-col gap-4">
        <button
          disabled
          className={`w-full text-left px-5 py-3 rounded-xl border font-medium text-sm sm:text-base ${getAnswerStyle(
            isCorrect
          )} dark:border-[#444]`}
        >
          <span className="font-semibold mr-2">Student Answer:</span>
          {studentAnswer}
        </button>

        {/* Correct Answer (Always Show) */}
        {correctAnswer && (
          <button
            disabled
            className="w-full text-left px-5 py-3 rounded-xl border font-medium text-sm sm:text-base bg-[#f0f0f0] text-[#223857] border-[#d1d5db] dark:bg-[#2a2a2a] dark:text-[#ccc] dark:border-[#444]"
          >
            <span className="font-semibold mr-2">Correct Answer:</span>
            {correctAnswer}
          </button>
        )}
      </div>

      <AssignmentFooter rating={rating} assignmentStatus={assignmentStatus} />
    </div>
  );
}
export const WritingAnswerCard = ({
  question,
  audioFile,
  studentAnswer,
  correctAnswer,
  rating,
  assignmentStatus,
}: WritingAnswerCardProps) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");

  useEffect(() => {
    if (!audioFile || !waveformRef.current) return;

    const audioUrl = `data:audio/mp3;base64,${audioFile}`;

    // Destroy existing instance if any
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.unAll?.();
        wavesurferRef.current.destroy?.();
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.warn("WaveSurfer cleanup failed:", err);
        }
      }
      wavesurferRef.current = null;
    }

     const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ccc",
      progressColor: "#3B82F6",
      height: 60,
      barWidth: 2,
      cursorWidth: 0,
      responsive: true,
    } as any);

    wavesurferRef.current = ws;
    ws.load(audioUrl);

    ws.on("ready", () => {
      const dur = ws.getDuration();
      if (dur) {
        const min = Math.floor(dur / 60);
        const sec = Math.floor(dur % 60)
          .toString()
          .padStart(2, "0");
        setDuration(`${min}:${sec}`);
      }
    });

    ws.on("finish", () => setIsPlaying(false));

    return () => {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => {
          try {
            ws.unAll?.();
            ws.destroy?.();
          } catch {}
        });
      } else {
        setTimeout(() => {
          try {
            ws.unAll?.();
            ws.destroy?.();
          } catch {}
        }, 50);
      }

      wavesurferRef.current = null;
    };
  }, [audioFile]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
    setIsPlaying((prev) => !prev);
  };

  const isCorrect =
    studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#1D1D1D] p-6 md:p-8 rounded-xl shadow-md mt-20 mb-6">
      {/* Question */}
      <h2 className="text-lg md:text-xl font-semibold text-center text-[#223857] dark:text-white mb-4">
        {question}
      </h2>

      {/* Audio Player */}
      {audioFile && (
        <div className="flex items-center gap-3 px-4 py-2 bg-[#f5f6f8] dark:bg-[#2c2c2c] rounded-full shadow w-full max-w-md mx-auto mb-6">
          <button
            onClick={togglePlay}
            className="bg-[#1e2f97] text-white rounded-full w-10 h-10 flex items-center justify-center"
          >
            {isPlaying ? (
              <span className="text-xl">❚❚</span>
            ) : (
              <span className="text-xl">▶</span>
            )}
          </button>

          <div className="flex-1" ref={waveformRef}></div>

          <span className="text-sm font-medium text-[#333] dark:text-gray-200 min-w-[30px] text-center">
            {duration}
          </span>

          <span className="text-xl text-gray-500 dark:text-gray-300">🔊</span>
        </div>
      )}

      {/* Student Answer */}
      <label
        htmlFor="student-answer"
        className="block mb-2 text-sm font-medium text-[#223857] dark:text-white"
      >
        Student Answer
      </label>
      <textarea
        id="student-answer"
        value={studentAnswer}
        rows={4}
        readOnly={true}
        className={`w-full resize-none px-4 py-3 rounded-xl border font-medium text-sm sm:text-base ${
          isCorrect
            ? "bg-green-50 text-green-800 border-green-400 dark:bg-green-900 dark:text-green-100"
            : "bg-red-50 text-red-800 border-red-400 dark:bg-red-900 dark:text-red-100"
        }`}
      />

      <div className="mt-4 text-sm sm:text-base text-[#223857] dark:text-gray-300">
        <span className="font-medium text-[#21252b] dark:text-white">
          Correct Answer:
        </span>{" "}
        {correctAnswer}
      </div>

      <AssignmentFooter rating={rating} assignmentStatus={assignmentStatus} />
    </div>
  );
};
export const ImageQuestionCard = ({
  question,
  imageUrl,
  options,
  selectedAnswer,
  correctAnswer,
  rating,
  assignmentStatus,
}: ImageQuestionCardProps) => {
  const imageSrc = useMemo(() => {
    return imageUrl.startsWith("data:image")
      ? imageUrl
      : `data:image/jpeg;base64,${imageUrl}`;
  }, [imageUrl]);
  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#1D1D1D] p-6 md:p-8 rounded-xl shadow-md mt-20 mb-6">
      {/* Question */}
      <h2 className="text-lg md:text-xl font-semibold text-center text-[#223857] dark:text-white mb-4">
        {question}
      </h2>

      {/* Image + Options Grid */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Image */}
        <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow">
          <img
            src={imageSrc}
            alt="Question visual"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Options */}
        <div className="w-full md:w-1/2 flex flex-col gap-3">
          {options.map((option, index) => {
            const isSelected =
              option.trim().toLowerCase() ===
              selectedAnswer.trim().toLowerCase();
            const isCorrect =
              option.trim().toLowerCase() ===
              correctAnswer.trim().toLowerCase();
            const isCorrectSelected = isSelected && isCorrect;

            const baseClass =
              "w-full text-left px-5 py-3 rounded-xl border font-medium text-sm sm:text-base transition-all";

            let btnClass = `${baseClass} ${
              isCorrectSelected
                ? "bg-[#377e36] text-white border-[#377e36]"
                : "bg-[#f6f7fb] text-[#223857] border-[#d1d5db] dark:bg-[#2a2a2a] dark:text-[#ccc] dark:border-[#444]"
            }`;

            return (
              <button key={index} disabled className={btnClass}>
                <span className="font-semibold mr-2">
                  {String.fromCharCode(97 + index) + ")"}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>
      <AssignmentFooter rating={rating} assignmentStatus={assignmentStatus} />
    </div>
  );
};
export const MatchWordCard = ({
  questionText,
  audioFile,
  options,
  selectedOption,
  correctAnswer,
  rating,
  uploadFile,
  assignmentStatus,
}: MatchWordCardProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setIsCorrect(
      selectedOption.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    );
  }, [selectedOption, correctAnswer]);

  const handleAudioPlay = () => {
    if (audioRef.current) audioRef.current.play();
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#1D1D1D] p-6 md:p-8 rounded-xl shadow-md mt-20 mb-6">
      {/* Title */}
      <h2 className="text-lg md:text-xl font-semibold text-center text-[#223857] dark:text-white mb-4">
        {questionText}
      </h2>

      {/* Character with Audio */}
     {/* Character with Audio */}
{/* Character + Uploaded Image + Audio */}
<div className="flex flex-col items-center justify-center gap-3 mb-6">

  {/* Uploaded Image */}
  {uploadFile && (
    <img
      src={
        uploadFile.startsWith("data:image")
          ? uploadFile
          : uploadFile.startsWith("http")
          ? uploadFile
          : `data:image/jpeg;base64,${uploadFile}`
      }
      alt="Uploaded"
      className="w-40 h-auto rounded-lg shadow border"
    />
  )}

  {/* Default Character */}
  <img
    src="/assets/images/q4.svg"
    alt="character"
    className="w-24 h-24"
  />

  {/* Play Button */}
  <button
    className="relative bg-indigo-500 text-white px-4 py-2 rounded-full cursor-pointer text-sm flex items-center gap-2"
    onClick={handleAudioPlay}
  >
    <span>🔊</span>
    <span>Play</span>
    <audio ref={audioRef} src={`data:audio/mp3;base64,${audioFile}`} />
  </button>

</div>



      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {options.map((option, index) => {
          const isSelected =
            option.trim().toLowerCase() === selectedOption.trim().toLowerCase();
          const isCorrect =
            option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
          const isCorrectSelected = isSelected && isCorrect;

          const baseClass =
            "w-full text-left px-5 py-3 rounded-xl border font-medium text-sm sm:text-base transition-all";

          let btnClass = `${baseClass} ${
            isCorrectSelected
              ? "bg-[#377e36] text-white border-[#377e36]"
              : "bg-[#f6f7fb] text-[#223857] border-[#d1d5db] dark:bg-[#2a2a2a] dark:text-[#ccc] dark:border-[#444]"
          }`;

          return (
            <button key={index} disabled className={btnClass}>
              <span className="font-semibold mr-2">
                {String.fromCharCode(97 + index) + ")"}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <AssignmentFooter rating={rating} assignmentStatus={assignmentStatus} />
    </div>
  );
};
