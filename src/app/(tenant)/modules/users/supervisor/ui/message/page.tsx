"use client";

import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import React, { useState, useRef, useEffect } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import axios from "axios";
import { io } from "socket.io-client";
import { CgAttachment } from "react-icons/cg";
import SupervisorHeader from "../../components/supervisorHeader";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";




// Define your interfaces
interface IMessage {
  _id: string;
  messages: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  createdDate: string;
  time?: string;
  notificationStatus: "Unseen" | "Seen";
  isRead: boolean;
  status: "Active" | "Inactive";
}

interface IMessageData {
  _id: string;
  messages: IMessage[];
}

interface IMessageResponse {
  status: string;
  message: string;
  data: IMessageData[] | any;
}

interface IUser {
  _id: string;
  userName: string;
  email: string;
  role: string[];
  status: string;
  lastLoginDate?: string;
  lastSeen?: string;
}

export interface ALStudent {
  _id: string;
  student: {
    studentId?: string;
    studentEmail?: string;
    studentPhone?: number;
    course?: string;
    package?: string;
    city?: string;
    country?: string;
    gender?: string;
  };
  username?: string;
  password?: string;
  role?: "Student" | string;
  level?: string;
  status?: string;
  createdDate?: string;
  createdBy?: string;
  updatedDate?: string;
  __v?: number;
}

interface IMessagesend {
  messages: string;
  isRead: boolean;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  receiverId: string;
  receiverName: string;
  receiverEmail?: string;
  notificationStatus: "Unseen" | "Seen";
  status: "Active" | "Inactive";
  createdDate: Date;
  createdBy: string;
  updatedDate: Date;
  updatedBy: string;
}

// Robust conversion: handle missing fields safely
const convertStudentToUser = (student: ALStudent): IUser => {
  const userName = student.username?.trim() || student.student?.studentId || "No Name";
  const email = student.student?.studentEmail?.trim() || `no-email-${student._id}@blackstone.local`;
  const status = (student.status || "offline").toLowerCase();


  return {
    _id: student._id || `student-${Date.now()}`,
    userName,
    email,
    role: [student.role || "Student"],
    status,
    lastSeen: student.updatedDate || student.createdDate || new Date().toISOString(),
  };
};

const Message = () => {
  const [teachers, setTeachers] = useState<IUser[]>([]);
  const [admin, setAdmin] = useState<IUser[]>([]);
  const [students, setStudents] = useState<IUser[]>([]); // Changed to IUser[]
  const [academicCoaches, setAcademicCoaches] = useState<IUser[]>([]);
  const [activeTab, setActiveTab] = useState<
    "teachers" | "admin" | "all" | "students" | "academic-coach"
  >("teachers");

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessageData[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageCount, setMessageCount] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const [userStatus, setUserStatus] = useState<string>("inactive");


  // read from localStorage safely
  let userId: string | null = null;
  const userName = typeof window !== "undefined" ? localStorage.getItem("SupervisorPortalName") : null;

  if (typeof window !== "undefined") {
    userId = localStorage.getItem("SupervisorPortalId");
  }

  // Fetch students endpoint with flexible response handling
  const fetchStudents = async (): Promise<IUser[]> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("SupervisorAuthToken") : null;

      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return [];
      }

      const res = await axios.get<any>(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Log for debugging
      console.log("Full students API response:", res?.data);

      let studentsArray: ALStudent[] = [];

      if (Array.isArray(res.data)) {
        studentsArray = res.data;
      } else if (res.data && Array.isArray(res.data.users)) {
        studentsArray = res.data.users;
      } else if (res.data && Array.isArray(res.data.data)) {
        studentsArray = res.data.data;
      } else if (res.data && Array.isArray(res.data.students)) {
        studentsArray = res.data.students;
      } else {
        // Fallback: try to find any array inside data object
        const maybeArray = Object.values(res.data || {}).find((v) => Array.isArray(v));
        if (Array.isArray(maybeArray)) {
          studentsArray = maybeArray as ALStudent[];
        } else {
          console.warn("Unexpected student API response shape:", res.data);
          return [];
        }
      }

      // Ensure valid array
      if (!Array.isArray(studentsArray)) {
        console.error("Students data is not an array:", studentsArray);
        return [];
      }

      // Convert to IUser safely
      return studentsArray.map(convertStudentToUser);
    } catch (err: any) {
      console.error("Error fetching students:", err);
      console.error("Error details:", err?.response?.data);
      return [];
    }
  };

  // Flexible fetch users by role: tries multiple role name variants and returns first non-empty
  const fetchUsersByRoleFlexible = async (roleBase: string): Promise<IUser[]> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("SupervisorAuthToken") : null;
    if (!token) {
      console.error("❌ SupervisorAuthToken not found");
      return [];
    }

    // Common variations to try (order matters)
    const roleCandidates = [
      roleBase,
      roleBase.toLowerCase(),
      roleBase.toUpperCase(),
      // Camel / Pascal variants
      roleBase.replace(/[_\s]/g, ""),
      roleBase.replace(/[_]/g, " "),
      roleBase.split(/[_\s]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(""),
      roleBase.split(/[_\s]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
    ].filter((v, i, a) => !!v && a.indexOf(v) === i);

    for (const r of roleCandidates) {
      try {
        const response = await axios.get<any>(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}`, {
          params: { role: r },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Accept multiple response shapes
        const usersFromRes: IUser[] =
          Array.isArray(response?.data) ? response.data :
          Array.isArray(response?.data?.users) ? response.data.users :
          Array.isArray(response?.data?.data) ? response.data.data :
          [];

        if (Array.isArray(usersFromRes) && usersFromRes.length > 0) {
          console.log(`Fetched users for role variant "${r}"`, usersFromRes.length);
          // Normalize minimal fields if needed
          return usersFromRes.map((u: any) => ({
            _id: u._id || u.id || `${r}-${Math.random()}`,
            userName: (u.userName || u.username || u.name || "No Name").toString(),
            email: (u.email || "no-email@example.com").toString(),
            role: Array.isArray(u.role) ? u.role : [u.role || r],
            status: (u.status || "offline").toString(),
            lastSeen: u.lastSeen || u.updatedAt || u.updatedDate || "",
          }));
        }
      } catch (err) {
        console.warn(`fetchUsersByRoleFlexible: tried role="${r}" and failed`, err);
        // continue trying other variants
      }
    }

    // If we got here, no variant returned users; return empty array
    return [];
  };

  // Filter users based on search query safely (guard missing fields)
  const filteredUsers = (
    activeTab === "teachers"
      ? teachers
      : activeTab === "admin"
      ? admin
      : activeTab === "students"
      ? students
      : activeTab === "academic-coach"
      ? academicCoaches
      : activeTab === "all"
      ? [...teachers, ...admin, ...students, ...academicCoaches]
      : []
  ).filter((user) => {
    const q = searchQuery?.toLowerCase?.() || "";
    return (
      (user.userName ?? "").toLowerCase().includes(q) ||
      (user.email ?? "").toLowerCase().includes(q)
    );
  });

  // Handle message selection
  const handleUserClick = (user: IUser) => {
    setSelectedUser(user);
    setMessages([]);
    fetchMessages(user._id);
  };

  // Fetch messages from API
  const fetchMessages = async (receiverId: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("SupervisorAuthToken") : null;

      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return;
      }

      // userId might be null; guard it
      if (!userId) {
        console.error("SupervisorPortalId not found in localStorage");
        return;
      }

      const { data } = await axios.get<IMessageResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MESSAGES.GET}/${userId}/${receiverId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedMessages = data?.data || [];
      setMessages(fetchedMessages);

      const allMessages = (Array.isArray(fetchedMessages) ? fetchedMessages : []).flatMap((group: any) =>
        Array.isArray(group.messages) ? group.messages : []
      );
      const unreadCount = allMessages.filter((m: any) => !m.isRead).length;
      setMessageCount(unreadCount);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize socket connection and fetch users
  useEffect(() => {
    // initialize socket only once
    if (!socketRef.current) {
      socketRef.current = io("https://api.blackstoneinfomaticstech.com", {
        transports: ["websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to Socket.IO with ID:", socketRef.current?.id);
        // subscribe only if userId exists
        if (userId) {
          socketRef.current?.emit("subscribe", userId);
        }
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from Socket.IO");
      });

      socketRef.current.on("connect_error", (err: any) => {
        console.error("Connection error:", err);
      });
    }

    // Handle incoming messages
    const handleNewMessage = (newMessage: IMessage) => {
      console.log("Received new message:", newMessage);

      const isForCurrentChat =
        (newMessage.senderId === userId && newMessage.receiverId === selectedUser?._id) ||
        (newMessage.senderId === selectedUser?._id && newMessage.receiverId === userId);

      if (newMessage.receiverId === userId && !newMessage.isRead) {
        setMessageCount((prev) => prev + 1);
      }

      if (isForCurrentChat) {
        setMessages((prev) => {
          const dateKey = new Date(newMessage.createdDate).toISOString().split("T")[0];
          const existingGroupIndex = prev.findIndex((group) => group._id === dateKey);
          const newState = [...prev];

          if (existingGroupIndex !== -1) {
            newState[existingGroupIndex] = {
              ...newState[existingGroupIndex],
              messages: [...newState[existingGroupIndex].messages, newMessage],
            };
          } else {
            // Prepend a new date group so latest appears at bottom when sorted later
            newState.unshift({
              _id: dateKey,
              messages: [newMessage],
            });
          }

          return newState;
        });

        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    const handleUserStatusCheck = (statusUpdate: { success: string; message: string }) => {
      console.log("user status response:", statusUpdate);
       setUserStatus(statusUpdate.success);
    }
      console.log("selectUserId in useEffect:", selectedUser?._id);
      const userIdToCheck = selectedUser?._id;
      if (socketRef.current && selectedUser?._id) {
        const userIdToCheck = selectedUser?._id;
      
        socketRef.current.emit("userActiveStatusCheck", {
          userId: userIdToCheck,
          senderId: userId
        });
      
        socketRef.current.on("userActiveStatusResponse", handleUserStatusCheck);
      }
      

    socketRef.current.on("newmessage", handleNewMessage);

    // Fetch all user lists (try flexible role names)
    const fetchAllUsers = async () => {
      try {
        const [teachersList, adminList, academicCoachList, studentsList] = await Promise.all([
          fetchUsersByRoleFlexible("Teacher"),
          fetchUsersByRoleFlexible("Admin"),
          fetchUsersByRoleFlexible("AcademicCoach"),
          fetchStudents(),
        ]);

        console.log("Fetched data:", {
          teachers: teachersList?.length,
          admin: adminList?.length,
          academicCoaches: academicCoachList?.length,
          students: studentsList?.length,
        });

        setTeachers(teachersList || []);
        setAdmin(adminList || []);
        setAcademicCoaches(academicCoachList || []);
        setStudents(studentsList || []);
      } catch (error) {
        console.error("Error fetching all users:", error);
        setTeachers([]);
        setAdmin([]);
        setAcademicCoaches([]);
        setStudents([]);
      }
    };

    fetchAllUsers();

    return () => {
      try {
        socketRef.current?.off("newmessage", handleNewMessage);
      } catch (e) {
        // ignore cleanup errors
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedUser]); // we depend on userId and selectedUser for subscription / chat logic

  const formatDateLabel = (dateString: string): string => {
    const inputDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (sameDay(inputDate, today)) return "Today";
    if (sameDay(inputDate, yesterday)) return "Yesterday";

    return inputDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const groupedMessages = messages
    .flatMap((group) => group.messages || [])
    .reduce((acc, msg) => {
      const dateKey = new Date(msg.createdDate).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(msg);
      return acc;
    }, {} as Record<string, IMessage[]>);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!selectedUser || !messageText.trim()) return;

    const newMessage: IMessagesend = {
      messages: messageText,
      senderId: userId ?? "",
      senderName: userName ?? "Supervisor",
      receiverId: selectedUser._id,
      receiverName: selectedUser.userName,
      createdDate: new Date(),
      notificationStatus: "Unseen",
      isRead: false,
      status: "Active",
      senderEmail: "supervisor@blackstone.com", // Update this if available
      receiverEmail: selectedUser.email,
      createdBy: "System",
      updatedDate: new Date(),
      updatedBy: "System",
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("SupervisorAuthToken") : null;

      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return;
      }

      const response = await axios.post(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MESSAGES.CREATE}`, newMessage, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // On success, append locally to messages for instant UI feedback
      if (response.data?.status === "success" || response.status === 200) {
        const convertedMessage: IMessage = {
          _id: Date.now().toString(),
          messages: newMessage.messages,
          senderId: newMessage.senderId,
          senderName: newMessage.senderName,
          receiverId: newMessage.receiverId,
          receiverName: newMessage.receiverName,
          createdDate: newMessage.createdDate.toISOString(),
          time: new Date().toLocaleTimeString(),
          notificationStatus: newMessage.notificationStatus,
          isRead: newMessage.isRead,
          status: newMessage.status,
        };

        setMessages((prev) => {
          const dateKey = new Date(convertedMessage.createdDate).toISOString().split("T")[0];
          const existingGroupIndex = prev.findIndex((group) => group._id === dateKey);

          if (existingGroupIndex !== -1) {
            const updated = [...prev];
            updated[existingGroupIndex] = {
              ...updated[existingGroupIndex],
              messages: [...updated[existingGroupIndex].messages, convertedMessage],
            };
            return updated;
          } else {
            return [
              ...prev,
              {
                _id: dateKey,
                messages: [convertedMessage],
              },
            ];
          }
        });

        setMessageText("");
      } else {
        console.error("Error posting message:", response.data?.message || response.statusText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const s = (status || "").toString().toLowerCase();
    if (s === "active" || s === "online") return "bg-green-500";
    if (s === "busy") return "bg-yellow-500";
    if (s === "inactive" || s === "offline") return "bg-gray-400";
    return "bg-gray-400";
  };

  return (
    <BaseLayout3>
      <SupervisorHeader currentSection="Message" />
      <div className="py-3 px-5">
        <div className="flex flex-col md:flex-row gap-4 h-[85vh]">
          {/* Left Panel */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full md:w-[350px] bg-[#fff] dark:bg-[#343434] dark:text-[#fff] p-4 rounded-[12px] shadow-md flex flex-col"
          >
            <div className="flex items-center space-x-3 p-2">
              <motion.div whileHover={{ scale: 1.05 }}>
                <img src="/assets/images/account.png" alt="Admin" className="w-12 h-12 rounded-lg" />
              </motion.div>
              <div>
                <div className="flex">
                  <h3 className="text-[18px] font-medium text-[#010E30] dark:text-[#fff]">{userName}</h3>
                  <button className="ml-[4px] text-gray-500">
                    {messageCount > 0 && (
                      <span className=" -mt-2 ml-1 bg-red-600 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center animate-pulse">
                        {messageCount}
                      </span>
                    )}
                  </button>
                </div>

                <p className="text-[12px] text-[#010e30a7] font-medium dark:text-[#fff] dark:opacity-[60%]">Supervisor</p>
              </div>
            </div>

            {/* Search Bar */}
            <motion.div whileHover={{ scale: 1.01 }} className="relative mt-2 mb-3 ">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-xs dark:border " />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                className="block w-full pl-10 pr-3 py-2 border border-[#CBCBCB] rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#576cbc] dark:text-[#fff] dark:opacity-[50%] dark:bg-[#343434] dark:border-[#504c4c]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>

            {/* Tabs */}
            <div className="flex">
              <button
                className={`px-2 py-1.5 text-[12px] font-medium ${
                  activeTab === "all" ? "text-[#576CBC] border-b-2 border-[#576CBC]" : "text-[#010e30] dark:text-[#ffffff]"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                className={`px-2 py-1.5 text-[12px] font-medium ${
                  activeTab === "teachers" ? "text-[#576CBC] border-b-2 border-[#576CBC]" : "text-[#010e30] dark:text-[#ffffff]"
                }`}
                onClick={() => setActiveTab("teachers")}
              >
                Teachers
              </button>
              <button
                className={`px-2 py-1.5 text-[12px] font-medium ${
                  activeTab === "admin" ? "text-[#576CBC] border-b-2 border-[#576CBC]" : "text-[#010e30] dark:text-[#ffffff]"
                }`}
                onClick={() => setActiveTab("admin")}
              >
                Admin
              </button>
              <button
                className={`px-2 py-1.5 text-[12px] font-medium ${
                  activeTab === "students" ? "text-[#576CBC] border-b-2 border-[#576CBC]" : "text-[#010e30] dark:text-[#ffffff]"
                }`}
                onClick={() => setActiveTab("students")}
              >
                Students
              </button>
              <button
                className={`px-2 py-1.5 text-[12px] font-medium ${
                  activeTab === "academic-coach" ? "text-[#576CBC] border-b-2 border-[#576CBC]" : "text-[#010e30] dark:text-[#ffffff]"
                }`}
                onClick={() => setActiveTab("academic-coach")}
              >
                Academic
              </button>
            </div>

            {/* User List */}
            <div className="mt-2 flex-1 overflow-y-auto scrollbar-none scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.button
                    key={user._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center border-b-2 dark:border-b-[#504c4c]  justify-between w-full p-2  cursor-pointer ${
                      selectedUser?._id === user._id ? "bg-[#f0efef] dark:bg-[#3c3c3c] rounded" : "hover:bg-[#f0efef] dark:hover:bg-[#3c3c3c] hover:rounded"
                    }`}
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex space-x-2 items-center">
                      <div className="relative">
                        <motion.div whileHover={{ scale: 1.05 }} className="w-9 h-9 bg-[#D0D0D0] dark:bg-[#D0D0D0] rounded-lg flex items-center justify-center">
                          <span className="text-[#959595] dark:text-[#959595] font-medium text-[14px]">{(user.userName || "U").charAt(0)}</span>
                        </motion.div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border ${getStatusColor(user.status ?? "offline")}`} />
                      </div>
                      <div className="text-left">
                        <h5 className="font-medium  text-[12px] text-[#010E30] dark:text-[#fff]">{user.userName}</h5>
                        <p className="text-[10px] text-gray-500 dark:text-[#fff] dark:text-opacity-[60%] truncate max-w-[180px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400">{user.lastSeen ? new Date(user.lastSeen).toLocaleString() : ""}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Chat Panel */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="w-full md:flex-1 bg-white dark:bg-[#2c2c2c] dark:text-[#fff] rounded-lg shadow-md flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                <div className=" p-3">
                  <div className="flex items-center space-x-2">
                    <motion.div whileHover={{ scale: 1.05 }} className="relative">
                      <div className="w-10 h-10 bg-[#D0D0D0] dark:bg-[#D0D0D0]  rounded-lg flex items-center justify-center">
                        <span className="dark:text-[#959595] text-sm">{(selectedUser.userName || "U").charAt(0)}</span>
                      </div>
                      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${getStatusColor(userStatus ?? "offline")}`} />
                    </motion.div>
                    <div>
                      <h3 className="text-xs dark:text-[#FFFFFF] font-semibold">
                        {selectedUser.userName}
                      </h3>
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-1 ${getStatusColor(
                            userStatus ?? "offline"
                          )}`}
                        ></span>
                        <p className="text-[10px] dark:text-[#FFFFFF99]/60 text-gray-400 capitalize">
                          {userStatus} • {selectedUser.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-3 overflow-y-auto scrollbar-none bg-[#fbfbfb] dark:bg-[#343434] flex flex-col">
                  <AnimatePresence>
                    {Object.entries(groupedMessages)
                      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                      .map(([date, msgs]) => (
                        <div key={date}>
                          <div className="text-center text-gray-500  text-xs my-2 font-medium">{formatDateLabel(date)}</div>

                          {msgs
                            .toSorted((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime())
                            .map((msg) => (
                              <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex flex-col mb-3 ${msg.senderId === userId ? "items-end" : "items-start"}`}>
                                <motion.div whileHover={{ scale: 1.01 }} className={`p-2 rounded-lg max-w-[80%] ${msg.senderId === userId ? "bg-[#576CBC] text-[#fff]  rounded-lg" : "bg-[#F1F1F1] rounded-lg dark:bg-[#2c2c2c]"}`}>
                                  <p className="text-xs">{msg.messages}</p>
                                  <div className="flex items-center justify-end mt-1 space-x-1">
                                    <span className="text-[9px] opacity-70">
                                      {new Date(msg.createdDate).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    {msg.senderId === userId && <span className="text-[9px]">{msg.isRead ? "✓✓" : "✓"}</span>}
                                  </div>
                                </motion.div>
                              </motion.div>
                            ))}
                        </div>
                      ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-3 bg-white dark:bg-[#2c2c2c]">
                  <div className="flex items-center rounded-lg bg-[#f3f3f3] p-1 dark:bg-[#343434]">
                    <button className="p-1 text-gray-400 ml-1">
                      <CgAttachment size={14} />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-2 py-1.5 text-xs bg-transparent outline-none"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className={`p-1 rounded-lg flex items-center ${messageText.trim() ? "" : "bg-gray-200 dark:bg-[#2c2c2c] text-gray-400 cursor-not-allowed"}`}
                    >
                      <img src="/assets/images/Iconsax.png" alt="Send" className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-full bg-gray-50 dark:bg-[#343434]">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-[#2c2c2c] rounded-full mb-3 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500">Select a conversation to start chatting</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </BaseLayout3>
  );
};

export default Message;
