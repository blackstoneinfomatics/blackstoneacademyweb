/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useTheme } from "@/context/ThemeContext";
import { Bell, CalendarDays, Moon, Sun, User, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import axios from "axios";
import AddPackage from "./AddPackage";
import AddMeeting from "./AddMeeting";
import AddExpenses from "./AddExpenses";
import AddEmployee from "./AddEmployee";
import KnowledgeBaseForm from "./AddKnowledgeBase";
import GenerateInvoice from "./GenerateInvoice";
import { toast } from "react-toastify";
import { appSuccessToastMessages } from "@/app/_components/contents/toast_message";
import { io } from "socket.io-client";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type NotificationType = {
  _id: string;
  senderId : string;
  senderName: string;
  messages: string;
  createdDate: string;
  notificationType: string;
  notificationStatus: "Seen" | "Unseen";
  isRead: boolean;
};

type AdminHeaderProps = {
  currentSection: string;
  showBackButton?: boolean;
  showBackPath?: string;
  employeeActiveTab?: "teachers" | "otheremployees" | "recruitment" | "leave";
};

export default function AdminHeader({
  currentSection,
  showBackButton = false,
  showBackPath = "",
  employeeActiveTab,
}: Readonly<AdminHeaderProps>) {
  const theme: any = useTheme();
  const darkMode = theme?.darkMode ?? false;
  const toggleDarkMode = theme?.toggleDarkMode ?? (() => {});
  const pathname = usePathname();
  const router = useRouter();

  const [showNotification, setShowNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<"Seen" | "Unseen">("Unseen");
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [showAddExpenses, setShowAddExpenses] = useState(false);
  const [showKnowledge,setShowKnowledge] =useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);

  const [permissions, setPermissions] = useState({
    leave: false,
    packages: false,
    expenses: false,
    meetings: false,
    invoice: false,
    employees: false,
    courses : false,
  });

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("AdminPortalId")
      : null;

  const handleNotificationClick = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("AdminAuthToken");
      if (!token) return;
      await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.NOTIFICATION.UPDATE}/${notificationId}`,
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
      console.error("Failed to mark notification as seen:", error);
    }
  };

  const loadPermissions = () => {
    try {
      const stored = localStorage.getItem("AdminRolePermission");
      if (stored) {
        const parsed = JSON.parse(stored);
        setPermissions({
          leave: parsed?.leave?.write ?? parsed?.employees?.write ?? false,
          packages: parsed?.packages?.write ?? parsed?.courses?.write ?? false,
          expenses: parsed?.expenses?.write ?? parsed?.invoice?.write ?? false,
          meetings: parsed?.meetings?.write ?? false,
          invoice: parsed?.invoice?.write ?? false,
          employees: parsed?.employees?.write ?? false,
          courses : parsed?.courses?.write ?? false,
        });
      }
    } catch (err) {
      console.error("Permission parsing error:", err);
    }
  };

  useEffect(() => {
    loadPermissions();
    window.addEventListener("storage", loadPermissions);
    return () => window.removeEventListener("storage", loadPermissions);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("AdminAuthToken");
      if (!userId || !token) return;
      try {
        const { data } = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.NOTIFICATION.GET_LIST}?receiverId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const list = data?.data?.notifications ?? [];
        setNotifications(list);
        const unread = list.filter((n: any) => !n.isRead).length;
        setNotificationCount(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [userId]);

useEffect(() => {
  const socket = io("https://api.blackstoneinfomaticstech.com");

  socket.on("notification", (data: any) => {
    setNotifications((prev) => [data, ...prev]);
  });

  return () => {
    socket.disconnect(); // cleanup
  };
}, []);


  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setShowNotification(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ADMIN_NOTIFICATION":
        return "👨‍💼";
      case "PACKAGE_UPDATE":
        return "📦";
      case "MEETING_REMINDER":
        return "📅";
      case "EXPENSE_ALERT":
        return "💰";
      case "SYSTEM_ALERT":
        return "⚠️";
      default:
        return "🔔";
    }
  };
    const handleNotificationRedirect = (notification : NotificationType) => {
  const { notificationType, senderId } = notification;

  switch (notificationType) {
    case "STUDENT_NOTIFICATION":
      router.push('/modules/users/admin-main/ui/evaluations');
      break;

    default:
      console.warn("Unknown notification type:", notificationType);
      break;
  }
};

  const getActionButton = () => {
    const path = pathname.toLowerCase();
    if (
      path.includes("employees") &&
      permissions.employees &&
      employeeActiveTab === "otheremployees"
    ) {
      return (
        <button
          onClick={() => setShowAddEmployee(true)}
          className="bg-[#576CBC] hover:bg-[#3a4f8a] text-white text-sm px-4 py-2 rounded-lg"
        >
          Add New
        </button>
      );
    }
    if (
      path.includes("dashboard") &&
      (permissions.leave || permissions.meetings)
    ) {
      return (
        <button
          onClick={() => router.push("/modules/users/admin-main/ui/employees")}
          className="bg-[#576CBC] hover:bg-[#3a4f8a] text-white text-sm px-4 py-2 rounded-lg"
        >
          Leave Approval
        </button>
      );
    }
    if (path.includes("package") && permissions.packages) {
      return (
        <button
          onClick={() => setShowAddPackage(true)}
          className="bg-[#576CBC] hover:bg-[#3a4f8a] text-white text-sm px-4 py-2 rounded-lg"
        >
          Add Package
        </button>
      );
    }
    if (path.includes("expenses") && (permissions.expenses || permissions.invoice)) {
      return (
        <button
          onClick={() => setShowAddExpenses(true)}
          className="bg-[#576CBC] hover:bg-[#3a4f8a] text-white text-sm px-4 py-2 rounded-lg"
        >
          Add Expenses
        </button>
      );
    }
    if (currentSection === "knowledge base" ) {
      return (
        <button
          onClick={() => setShowKnowledge(true)}
          className="bg-[#576CBC] hover:bg-[#3a4f8a] text-white text-sm px-4 py-2 rounded-lg"
        >
          Add Knowledge Base
        </button>
      );
    }
    if (path.includes("meeting") && permissions.meetings) {
      return (
        <button
          onClick={() => setShowAddMeeting(true)}
          className="bg-[#576CBC] hover:bg-[#3a4f8a] text-white text-sm px-4 py-2 rounded-lg"
        >
          Add Meeting
        </button>
      );
    }
    if (path.includes("invoice") && permissions.invoice) {
      return (
        <button
          onClick={() => setShowGenerateInvoice(true)}
          className="bg-[#576CBC] hover:bg-[#3a4f8a] text-white text-sm px-4 py-2 rounded-lg"
        >
          Generate Invoice
        </button>
      );
    }
    return null;
  };

  const userName =
    typeof window !== "undefined"
      ? localStorage.getItem("AdminPortalName")
      : null;

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (menuRef.current && !(menuRef.current as any).contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const handleLogOut = () => {
    router.push("/modules/users/admin-main/ui/login");
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
          {getActionButton()}

          <button
            onClick={() => router.push("/modules/users/admin-main/ui/admincalendar")}
            className="p-2.5 bg-white dark:bg-gray-700 rounded-lg"
          >
            <CalendarDays className="w-4 h-4 text-gray-800 dark:text-white" />
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotification(!showNotification)}
              className="relative p-2.5 bg-white dark:bg-gray-700 rounded-lg"
            >
              <Bell className="w-5 h-5 text-gray-800 dark:text-white" />
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#576CBC] text-white text-[10px] font-normal w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-md">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {showNotification && (
              <div className="absolute -ml-[360px] w-[90vw] sm:w-[470px] max-w-[95vw] mt-2 bg-white/90 dark:bg-[#252525]/80 backdrop-blur-md border rounded-lg shadow-2xl z-30 animate-fade-in-up">
                <div className="pt-3 pb-2 pl-4 border-b border-white flex justify-between items-center dark:border-[#252525]">
                  <h4 className="font-semibold text-[#010E30] text-lg dark:text-white">
                    Notifications
                  </h4>
                  <button
                    onClick={() => setShowNotification(false)}
                    className="mr-3"
                  >
                    <X size={18} className="text-red-600 dark:text-white" />
                  </button>
                </div>

                <div className="flex justify-start backdrop-blur-md px-5">
                                <div className="flex w-full justify-start gap-3">
                                  {["Unseen", "Seen"].map((tab) => (
                                    <button
                                      key={tab}
                                      onClick={() => setActiveTab(tab as "Seen" | "Unseen")}
                                      className={`relative text-sm px-2 py-1 font-medium transition-all text-black ${
                                        activeTab === tab
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
                                        className={`w-full text-left p-2   flex items-start gap-3 transition-all duration-200 border-b border-[#D9D9D9]  ${
                                          notification.notificationStatus === "Seen"
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

      {open && (
        <div className="absolute right-5 mt-2 w-40 bg-white dark:bg-[#252525] shadow-lg rounded-lg py-2 z-50" ref={menuRef}>
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

      {showAddPackage && <AddPackage onClose={() => setShowAddPackage(false)} />}
      {showAddMeeting && <AddMeeting onClose={() => setShowAddMeeting(false)} onMeetingCreated={() => setShowAddMeeting(false)} />}
      {showAddExpenses && <AddExpenses onClose={() => setShowAddExpenses(false)} refreshExpenses={() => {}} />}
      {showKnowledge && <KnowledgeBaseForm onClose={()=> setShowKnowledge(false)}/>}
      {showGenerateInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <GenerateInvoice onClose={() => setShowGenerateInvoice(false)} />
          </div>
        </div>
      )}
      {showAddEmployee && (
        <AddEmployee
          onClose={() => setShowAddEmployee(false)}
            onSuccess={() => {
            setShowAddEmployee(false);
            toast.success(appSuccessToastMessages.EMPLOYEE_CREATED);
          }}
        />
      )}
    </div>
  );
}

