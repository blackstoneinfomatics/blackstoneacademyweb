"use client";

import { useTheme } from "@/context/ThemeContext";
import { CalendarDays, Bell, Sun, Moon, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import LeaveForm from "@/app/(tenant)/modules/users/supervisor/components/leaveForm";
import AddMeeting from "@/app/(tenant)/modules/users/supervisor/components/addMeeting";
import AddApplicants from "@/app/(tenant)/modules/users/supervisor/components/addApplicants";
import { getSocket } from "@/app/utils/socket";
import axios from "axios";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";

type Props = {
  readonly currentSection: string;
  readonly showBackButton?: boolean;
  readonly showBackPath?: string;
};

export interface Student {
  _id: string;
  teacherName: string;
  sessionClassType: string;
  username: string;
  password: string;
  role: string;
  status: string;
  createdDate: string | number | Date;
  createdBy: string;
  updatedDate: string | number | Date;
  __v: number;
  student: {
    studentId: string;
    studentEmail: string;
    studentPhone: string | number;
    course: string;
    package: string;
    city: string;
    country: string;
    gender: string;
  };
}
type NotificationType = {
  _id: string;
  senderId: string;
  senderName: string;
  messages: string;
  createdDate: string;
  notificationType: string;
  notificationStatus: "Seen" | "Unseen";
  isRead: boolean;
};

export default function SupervisorHeader({
  currentSection,
  showBackButton = false,
  showBackPath = "",
}: Props) {
  const theme: any = useTheme();
  const darkMode = theme?.darkMode ?? false;
  const toggleDarkMode = theme?.toggleDarkMode ?? (() => { });
  const [showNotification, setShowNotification] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showAddMeeting, setAddMeetings] = useState(false);
  const [showAddApplicant, setAddApplicant] = useState(false);
  const router = useRouter();
  const notificationRef = useRef(null);
  const [activeTab, setActiveTab] = useState<"Seen" | "Unseen">("Unseen");
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [dashboardWrite, setDashboardWrite] = useState(true);
    const [leaveWrite, setLeaveWrite] = useState(true);
    const [trailWrite, setTrailWrite] = useState(true);
      const [calendarWrite, setCalendarWrite] = useState(true); // For Add Meeting - Default true
    

    useEffect(() => {
      const roleAccessRaw = localStorage.getItem("SupervisorRolePermission");
      if (roleAccessRaw) {
        try {
          const roleAccess = JSON.parse(roleAccessRaw);
          const modules = roleAccess?.supervisormodules || roleAccess;
  console.log("✅ Role Access:", roleAccess);
          console.log("✅ Modules being used:", modules);
          console.log("🔐 Dashboard write:", modules?.dashboard?.write);
          console.log("🔐 Leave write:", modules?.leave);
  
  
          setDashboardWrite(modules?.dashboard?.write !== false);
        setLeaveWrite(modules?.leave ?? modules?.dashboard?.write ?? false);
        setCalendarWrite(modules?.schedule?.write !== false);
          setTrailWrite(modules?.trailmanagement?.write !== false);
        } catch (error) {
          console.error("❌ Invalid SupervisorRolePermission JSON", error);
        }
      }
    }, []);
  const [notificationCount, setNotificationCount] = useState(0);
  // Fetch old notifications
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("SupervisorPortalId")
      : null;
const fetchNotifications = async (token: string) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorAuthToken")
        : null;

    const userId =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorPortalId")
        : null;

    if (!token) {
      console.error("❌ Authentication token not found");
      return;
    }

    if (!userId) {
      console.error("❌ Supervisor ID not found");
      return;
    }

    const { data } = await axios.get(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.NOTIFICATION.GET_LIST}?receiverId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const notificationList = data?.data?.notifications ?? [];

    setNotifications(notificationList);

    const unreadCount = notificationList.filter(
      (n: NotificationType) => !n.isRead
    ).length;

    setNotificationCount(unreadCount);
  } catch (error: any) {
    console.error("❌ Failed to fetch notifications:", error);

    if (axios.isAxiosError(error)) {
      switch (error.response?.status) {
        case 401:
          console.error("Session expired");
          break;

        case 403:
          console.error("Permission denied");
          break;

        case 404:
          console.error("Notifications not found");
          break;

        case 500:
          console.error("Server error");
          break;

        default:
          console.error("Unable to load notifications");
      }
    }
  }
};

  // Mark as Seen
  const handleNotificationClick = async (notificationId: string) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("SupervisorAuthToken")
          : null;

      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return;
      }

      await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.NOTIFICATION.CREATE}/${notificationId}`,
        {
          isRead: true,
          notificationStatus: "Seen",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId
            ? { ...n, isRead: true, notificationStatus: "Seen" }
            : n
        )
      );

      setNotificationCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("❌ Failed to mark as seen:", error);
    }
  };

  // Real-time notifications with Socket.IO
  useEffect(() => {
    const socket = getSocket(userId ?? "");

    const handleNotification = (newNotification: NotificationType) => {
      console.log("Received new notification:", newNotification);
      setNotifications((prev) => [newNotification, ...prev]);

      if (!newNotification.isRead) {
        setNotificationCount((prev) => prev + 1);
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [userId]);
  const userName =
    typeof window !== "undefined"
      ? localStorage.getItem("SupervisorPortalName")
      : null;
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !(menuRef.current as any).contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogOut = () => {
    router.push("/modules/users/supervisor/ui/sign");
  };

  // Load on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("SupervisorAuthToken");
      if (token) {
        fetchNotifications(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, [userId]);
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "STUDENT_NOTIFICATION":
        return "🎓";
      case "TEACHER_ADDED":
        return "👩‍🏫";
      case "SYSTEM_ALERT":
        return "⚠️";
      case "MEETING_REMINDER":
        return "📅";
      case "MESSAGE":
        return "💬";
      case "ADMIN_MEETING_SCHEDULED":
        return "📝";
      default:
        return "🔔";
    }
  };
  const handleNotificationRedirect = (notification: NotificationType) => {
    const { notificationType, senderId } = notification;

    switch (notificationType) {

      case "TEACHER_ADDED":
        router.push(`/modules/users/supervisor/ui/recruitment`);
        break;

      case "ADMIN_NOTIFICATION":
        router.push(`/modules/users/admin-main/ui/dashboard?alertId=${senderId}`);
        break;

      case "ADMIN_MEETING_SCHEDULED":
        router.push('/modules/users/supervisor/ui/meetingandtraining');
        break;

      default:
        console.warn("Unknown notification type:", notificationType);
        break;
    }
  };

  const renderButton = () => {
    if (currentSection === "Dashboard") {
      return (
        <button
          onClick={() => setShowLeaveForm(true)}
          className="bg-[#6C78F5] hover:bg-[#5a65d1] text-white text-sm px-4 py-2 rounded-lg"
          disabled={!leaveWrite}
        >
          Request for Leave
        </button>
      );
    }
    if (currentSection === "Applicants") {
      return (
        <button
          onClick={() => setAddApplicant(true)}
          className="bg-[#6C78F5] hover:bg-[#5a65d1] text-white text-sm px-4 py-2 rounded-lg"
          disabled={!trailWrite}
        >
          Add Applicant
        </button>
      );
    }
       if (currentSection === "Calendar") {
      return (
        <button
          onClick={() => setAddMeetings(true)}
          className="bg-[#576CBC] hover:bg-[#4459A9] text-white text-sm px-4 py-2 rounded-lg"
          disabled={!calendarWrite}
        >
          Add Meeting
        </button>
      );
    }
    if (
      currentSection === "Scheduled Meetings" ||
      currentSection === "Calendar"
    ) {
      return (
        <button
          onClick={() => setAddMeetings(true)}
          className="bg-[#6C78F5] hover:bg-[#5a65d1] text-white text-sm px-4 py-2 rounded-lg"
          disabled={!calendarWrite}
        >
          Add Meeting
        </button>
      );
    }
    if (currentSection === "Teacher's List") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/modules/users/supervisor/ui/feedback")}
            className="text-[#5a65d1] border border-[#5a65d1] text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Feedback
          </button>
          <button
            onClick={() => router.push("/modules/users/supervisor/ui/viewschedule")}
            className="bg-[#6C78F5] hover:bg-[#5a65d1] text-white text-sm px-4 py-2 rounded-lg"
          >
            Scheduled Classes
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex justify-between items-center py-2 pl-1 mb-1">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <IoArrowBackCircleSharp
              className="text-[25px] text-[#012a4a] cursor-pointer dark:text-white"
              onClick={() => router.push(showBackPath)}
            />
          )}
          <h1 className="text-xl font-semibold text-[#000836] dark:text-white">
            {currentSection}
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {renderButton()}
          <button
            onClick={() => router.push("/modules/users/supervisor/ui/calendar")}
            className="p-2.5 bg-white dark:bg-gray-700 rounded-lg"
          >
            <CalendarDays className="w-4 h-4 text-gray-800 dark:text-white" />
          </button>
          <button
            onClick={() => setShowNotification(true)}
            className="relative p-2.5 bg-white dark:bg-gray-700 rounded-lg"
          >
            <Bell className="w-5 h-5 text-gray-800 dark:text-white" />

            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#6C78F5] text-white text-[10px] font-normal w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-md">
                {notificationCount}
              </span>
            )}
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2.5 bg-white dark:bg-gray-700 rounded-lg"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-gray-800 dark:text-white" />
            ) : (
              <Moon className="w-4 h-4 text-gray-800 dark:text-white" />
            )}
          </button>
          <button
            className="p-2.5 bg-white dark:bg-gray-700 rounded-full"
            onClick={() => setOpen((prev) => !prev)}
          >
            <User className="w-4 h-4 text-gray-800 dark:text-white" />
          </button>
        </div>
      </div>
      {showLeaveForm && <LeaveForm onClose={() => setShowLeaveForm(false)} />}
      {showAddMeeting && <AddMeeting onClose={() => setAddMeetings(false)} />}
      {open && (
        <div className="absolute right-5 mt-2 w-40 bg-[#ffff] dark:bg-[#252525] shadow-lg rounded-lg py-2 z-50">
          <div className="px-4 py-2 text-sm text-gray-800 dark:text-white font-semibold">
            {userName}
          </div>
          <hr className="border-gray-300 dark:border-gray-600 my-1" />
          <button
            onClick={handleLogOut}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Log Out
          </button>
        </div>
      )}
      {showAddApplicant && (
        <AddApplicants onClose={() => setAddApplicant(false)} />
      )}
      {showNotification && (
        <div
          ref={notificationRef}
          className="absolute pb-6 ml-[810px] w-[90vw] sm:w-[470px] max-w-[95vw] -mt-1 bg-white/90 dark:bg-[#252525]/80 backdrop-blur-md border rounded-lg shadow-2xl z-30 animate-fade-in-up animation-transition-all duration-300"
        >
          <div className="pt-3 pb-2 pl-4 border-b border-white flex justify-between items-center dark:border-[#252525]">
            <h4 className="font-semibold text-[#010E30] text-lg dark:text-[#FFFFFF]">
              Notifications
            </h4>
            <button
              onClick={() => setShowNotification(false)}
              className="text-white hover:text-gray-200"
            >
              <X
                size={18}
                className="text-red-600 mr-3 font-semibold dark:text-white"
              />
            </button>
          </div>

          <div className="flex justify-start backdrop-blur-md px-5">
            <div className="flex w-full justify-start gap-3">
              {["Unseen", "Seen"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "Seen" | "Unseen")}
                  className={`relative text-sm px-2 py-1 font-medium transition-all text-black ${activeTab === tab
                      ? "text-[#576CBC] dark:text-[#576CBC]"
                      : "dark:text-white"
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#576CBC] rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 overflow-y-auto scrollbar-hide p-1 px-5">
            {notifications && notifications.length > 0 ? (
              notifications
                .filter((n) =>
                  activeTab === "Seen"
                    ? n.notificationStatus === "Seen"
                    : n.notificationStatus !== "Seen"
                )
                .map((notification) => (
                  <button
                    key={notification._id}
                    onClick={() => {
                      if (notification.notificationStatus !== "Seen") {
                        handleNotificationClick(notification._id);
                      }
                    }}
                    disabled = {!dashboardWrite}
                    className={`w-full text-left p-2   flex items-start gap-3 transition-all duration-200 border-b border-[#D9D9D9]  ${notification.notificationStatus === "Seen"
                        ? "bg-white/20 text-gray-900 hover:bg-white/50 dark:bg-[#252525]"
                        : " text-gray-900 font-medium hover:bg-[#bfc5e8] dark:bg-[#252525] dark:hover:bg-[#5a5858]"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E4E7F4] flex items-center justify-center relative shrink-0 dark:bg-[#343434] ">
                      <span className="text-sm font-semibold text-[#576CBC] ">
                        {notification.senderName?.[0] || "N"}
                      </span>
                      {!notification.isRead && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#68D391] rounded-full border-2 border-white dark:bg-[#68D391]"></span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-xs font-semibold dark:text-white">
                          {notification.senderName.toLowerCase() || "Unknown"}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-[#bbb0b099]">
                          {new Date(notification.createdDate)
                            .toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            .replace(",", "")}
                        </span>
                      </div>
                      <div className="text-xs mt-0.5 text-gray-800 flex items-center gap-1">
                        <span>
                          {getNotificationIcon(notification.notificationType)}
                        </span>
                        <span
                          onClick={() =>
                            handleNotificationRedirect(notification)
                          }
                          className="text-xs text-[#43424299] dark:text-[#bbb0b099] dark:hover:text-white cursor-pointer hover:underline transition"
                        >
                          {notification.messages}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
            ) : (
              <div className="p-6 text-center text-gray-800">
                <Bell size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-700">No notifications found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
