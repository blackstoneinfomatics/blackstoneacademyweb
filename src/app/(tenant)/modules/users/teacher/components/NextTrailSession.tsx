"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { toast } from "react-toastify";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

interface TrialClass {
  _id: string;
  trialId: string;
  subject: string;
  meetingLocation: string;
  classType: string;
  meetingType: string;
  meetingLink: string;
  isScheduledMeeting: boolean;
  scheduledStartDate: string;
  scheduledEndDate: string;
  scheduledFrom: string;
  scheduledTo: string;
  timeZone: string;
  description: string;
  meetingStatus: string;
  studentResponse: string;
  status: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  __v: number;
  academicCoach: {
    academicCoachId: string | null;
    name: string | null;
    email: string | null;
  };
  teacher: {
    teacherId: string;
    name: string;
    email: string;
  };
  student: {
    studentId: string;
    name: string;
    city: string;
    country: string;
  };
  course: {
    courseId: string;
    courseName: string;
  };
}

const NextTrailSession = () => {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [selectedTrial, setSelectedTrial] = useState<TrialClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const teacherId = localStorage.getItem("TeacherPortalId");
      const token = localStorage.getItem("TeacherAuthToken");

      if (!teacherId) {
                toast.error(
                  AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_TEACHER_ID
                );
                setLoading(false);
                return;
              }
      
       if (!token) {
                toast.error(
                  AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_TOKEN
                );
                setLoading(false);
                return;
              }

      try {
        const response = await axios.get<TrialClass[]>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_TEACHER_TRAILCLASS}`,
          {
            params: { teacherId },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;
        if (data.length > 0) {
  setSelectedTrial(data[0]);
} else {
  setSelectedTrial(null);

  console.log(
    AppValidationMessages.TRIAL_CLASS.NO_TRIAL_CLASS_FOUND
  );
}
      } catch (err) {
  console.error(err);

  toast.error(
    AppFailureToastMessages.TRIAL_CLASS_FETCH
  );

  setError(
    AppFailureToastMessages.TRIAL_CLASS_FETCH
  );
} finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedTrial?.scheduledStartDate || !selectedTrial?.scheduledFrom) return;

    const classStart = new Date(selectedTrial.scheduledStartDate);
    const [h, m] = selectedTrial.scheduledFrom.split(":").map(Number);
    classStart.setHours(h, m, 0, 0);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = classStart.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        setTime({ hours: 0, minutes: 0, seconds: 0 });
        setIsTimeUp(true);
      } else {
        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTime({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTrial]);

  const formatTime = (value: number) => (value < 10 ? `0${value}` : value);
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

const handleStartClass = (
  meetingLink: string | undefined
) => {
  if (!meetingLink) {
    toast.error(
      AppValidationMessages.TRIAL_CLASS.MEETING_LINK_REQUIRED
    );
    return;
  }

  window.open(meetingLink, "_blank");
};

  if (loading) return <p className="text-center">Loading upcoming class...</p>;
  if (!selectedTrial) {
    return (
      <div className="relative overflow-hidden bg-[#78A1DB] rounded-xl shadow flex items-center justify-center text-white p-2 min-h-[102px]">
        {/* Floating, soft background shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/15 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float-rev" />
          <div className="absolute top-1/2 -translate-y-1/2 left-4 w-12 h-12 bg-white/10 rounded-full blur-xl animate-float-slower" />
        </div>

        {/* Message */}
          <p className="float-text text-sm sm:text-base font-medium">Trial class for now 📚 No classes ahead</p>

        {/* Scoped animations */}
        <style jsx>{`
          @keyframes floatY {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes floatYSmall {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .animate-float-slow { animation: floatY 7s ease-in-out infinite; }
          .animate-float-slower { animation: floatY 9s ease-in-out infinite; }
          .animate-float-rev { animation: floatY 8s ease-in-out infinite reverse; }
          .float-text { animation: floatYSmall 5s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }


  return (
    <div className="bg-[#71a1db] rounded-xl shadow flex justify-between items-center text-white px-6 py-4">
      <div className="items-center">
        <h3 className="text-[16px] font-medium leading-tight">
          Trial Session Due in
        </h3>
        <p className="text-[13px] mt-1 text-gray-300">
          Class Date: {formatDate(selectedTrial.scheduledStartDate)}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {isTimeUp ? (
          <button
            onClick={() => handleStartClass(selectedTrial?.meetingLink)}
            className="relative text-white px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: "#1C3456",
              backgroundSize: "400% 400%",
              animation: "moveGradient 5s ease infinite",
            }}
          >
            Join Meeting
          </button>
        ) : (
          <>
            <p className="text-[16px] font-semibold whitespace-nowrap">
              Starts in
            </p>
            <div className="relative flex items-center justify-center">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white">
                <div className="text-center">
                  <p className="text-[6px] font-bold text-[#234878]">SESSION</p>
                  <p className="text-[10px] font-extrabold text-[#223857]">
                    {formatTime(time.hours)}:{formatTime(time.minutes)}:
                    {formatTime(time.seconds)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NextTrailSession;
