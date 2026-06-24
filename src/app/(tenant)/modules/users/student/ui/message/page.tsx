"use client";

import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import React, { useState, useRef, useEffect } from "react";
import { GrAttachment } from "react-icons/gr";
import { FaTelegramPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import StudentHeader from "../../components/StudentHeader";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";

interface IMessage {
  _id: string;
  messages: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  createdDate: string;
  time: string;
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
  data: IMessageData[];
}
interface Invoice {
  student: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPhone: number;
  };
  _id: string;
  courseName: string;
  amount: number;
  status: string;
  createdDate: string;
  invoiceStatus: "Paid" | "Pending";
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
interface IMessagesend {
  messages: string;
  isRead: boolean;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  receiverName: string;
  receiverEmail: string;
  notificationStatus: "Unseen" | "Seen";
  status: "Active" | "Inactive";
  createdDate: Date;
  createdBy: string;
  updatedDate: Date;
  updatedBy: string;
}

const Message = () => {
  const [teachers, setTeachers] = useState<IUser[]>([]);
  const [academicCoaches, setAcademicCoaches] = useState<IUser[]>([]);
  const [activeTab, setActiveTab] = useState<
    "teachers" | "academicCoaches" | "all"
  >("all");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessageData[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageCount, setMessageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    userId: "",
    userName: "",
    studentName: "",
    studentEmail: "",
    token: ""
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const userId = localStorage.getItem("StudentPortalId") || "";
    const userName = localStorage.getItem("StudentPortalName") || "";
    const studentName = localStorage.getItem("StudentName") || "Student";
    const studentEmail = localStorage.getItem("StudentEmail") || "student@blackstone.com";
    const token = localStorage.getItem("StudentAuthToken") || "";

    setUserData({
      userId,
      userName,
      studentName,
      studentEmail,
      token
    });
    
    setIsLoading(false);
  }, []);

  const fetchUsersByRole = async (role: string): Promise<IUser[]> => {
    try {
      if (!userData.token) {
        return [];
      }

      const response = await axios.get<{ users: IUser[] }>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      const allUsers = response.data.users;
      const filtered = allUsers.filter((user) =>
        user.role.some(
          (r) => r.toLowerCase().replace(/_/g, " ") === role.toLowerCase()
        )
      );
      return filtered;
    } catch (err) {
      toast.error(AppFailureToastMessages.UNAUTHORIZED);
      return [];
    }
  };

  const combinedUsers =
    activeTab === "all"
      ? [...teachers, ...academicCoaches]
      : activeTab === "teachers"
      ? teachers
      : academicCoaches;

  const filteredUsers = combinedUsers.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClick = (user: IUser) => {
    setSelectedUser(user);
    setMessages([]);
    fetchMessages(user._id);
  };

  const fetchMessages = async (receiverId: string) => {
    try {
      if (!userData.token) {
        return;
      }

      const { data } = await axios.get<IMessageResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MESSAGES.GET}/${userData.userId}/${receiverId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      const fetchedMessages = data?.data;
      setMessages(fetchedMessages);

      const allMessages = fetchedMessages.flatMap((group) => group.messages);
      const unreadCount = allMessages.filter((m) => !m.isRead).length;
      setMessageCount(unreadCount);
    } catch (error) {
      toast.error(AppFailureToastMessages.MEETING_FETCH);
    }
  };

  useEffect(() => {
    const container = document.querySelector(".chat-scroll-container");
    if (container && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (teachers.length === 0) {
        const result = await fetchUsersByRole("TEACHER");
        setTeachers(result);
      }
      if (academicCoaches.length === 0) {
        const result = await fetchUsersByRole("ACADEMICCOACH");
        setAcademicCoaches(result);
      }
    };
    
    if (userData.token) {
      fetchUsers();
    }
  }, [activeTab, userData.token]);

  useEffect(() => {
    setSelectedUser(null);
  }, [activeTab]);

  useEffect(() => {
    if (!socketRef.current && userData.userId) {
      socketRef.current = io("https://api.blackstoneinfomaticstech.com", {
        transports: ["websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        socketRef.current?.emit("subscribe", userData.userId);
      });

      socketRef.current.on("disconnect", () => {
        // socket disconnected
      });

      socketRef.current.on("connect_error", (err: any) => {
        toast.error(AppFailureToastMessages.NO_RESPONSE);
      });
    }
    
    const handleNewMessage = (newMessage: IMessage) => {
      const isForCurrentChat =
        (newMessage.senderId === userData.userId &&
          newMessage.receiverId === selectedUser?._id) ||
        (newMessage.senderId === selectedUser?._id &&
          newMessage.receiverId === userData.userId);

      if (newMessage.receiverId === userData.userId && !newMessage.isRead) {
        setMessageCount((prev) => prev + 1);
      }

      if (isForCurrentChat) {
        setMessages((prev) => {
          const dateKey = new Date(newMessage.createdDate)
            .toISOString()
            .split("T")[0];
          
          const existingGroupIndex = prev.findIndex(
            (group) => group._id === dateKey
          );

          const newState = [...prev];

          if (existingGroupIndex !== -1) {
            newState[existingGroupIndex] = {
              ...newState[existingGroupIndex],
              messages: [...newState[existingGroupIndex].messages, newMessage],
            };
          } else {
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

    if (socketRef.current) {
      socketRef.current.on("newmessage", handleNewMessage);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("newmessage", handleNewMessage);
      }
    };
  }, [userData.userId, selectedUser]);

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
    .flatMap((group) => group.messages)
    .reduce((acc, msg) => {
      const dateKey = new Date(msg.createdDate).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(msg);
      return acc;
    }, {} as Record<string, IMessage[]>);

  const handleSendMessage = async () => {
    if (!selectedUser || !messageText.trim() || !userData.userId) return;

    const newMessage: IMessagesend = {
      messages: messageText,
      senderId: userData.userId,
      senderName: userData.studentName,
      receiverId: selectedUser._id,
      receiverName: selectedUser.userName,
      createdDate: new Date(),
      notificationStatus: "Unseen",
      isRead: false,
      status: "Active",
      senderEmail: userData.studentEmail,
      receiverEmail: selectedUser.email,
      createdBy: "System",
      updatedDate: new Date(),
      updatedBy: "System",
    };

      try {
        if (!userData.token) {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
          return;
        }

      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MESSAGES.CREATE}`,
        newMessage,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      if (response.data.status === "success") {
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
          const dateKey = new Date(convertedMessage.createdDate)
            .toISOString()
            .split("T")[0];
          const existingGroupIndex = prev.findIndex(
            (group) => group._id === dateKey
          );

          if (existingGroupIndex !== -1) {
            const updated = [...prev];
            updated[existingGroupIndex] = {
              ...updated[existingGroupIndex],
              messages: [
                ...updated[existingGroupIndex].messages,
                convertedMessage,
              ],
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
        toast.error(response.data.message || AppFailureToastMessages.NO_RESPONSE);
      }
    } catch (error) {
      toast.error(AppFailureToastMessages.NO_RESPONSE);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-gray-400";
      case "busy":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const formatRole = (roles: string[]) => {
    return roles.map(role => {
      return role.toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }).join(', ');
  };

  if (isLoading) {
    return (
      <BaseLayout2>
        <StudentHeader currentSection="Message" />
        <div className="py-3 px-5">
          <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
          </div>
        </div>
      </BaseLayout2>
    );
  }

  return (
    <BaseLayout2>
      <StudentHeader currentSection="Message" />
      <div className="py-3 px-5">
        <div className="flex flex-col md:flex-row gap-4 h-[85vh]">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full md:w-[350px] bg-[#fff] dark:bg-[#343434] dark:text-[#fff] p-4 rounded-[12px] shadow-md flex flex-col"
          >
            <div className="flex items-center space-x-3 p-2">
              <motion.div whileHover={{ scale: 1.05 }}>
                <img
                  src="/assets/images/account.png"
                  alt="Student Avatar"
                  className="w-12 h-12 rounded-lg"
                />
              </motion.div>
              <div>
                <div className="flex">
                  <h3 className="text-[18px] font-medium text-[#010E30] dark:text-[#fff]">
                    {userData.userName}
                  </h3>
                </div>
                <p className="text-[12px] text-[#010e30a7] font-medium dark:text-[#fff] dark:opacity-[60%]">
                  Student
                </p>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative mt-2 mb-3"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-xs dark:border" />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                className="block w-full pl-10 pr-3 py-2 border border-[#CBCBCB] rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#576cbc] dark:text-[#fff] dark:opacity-[50%] dark:bg-[#343434] dark:border-[#504c4c]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>

            <div className="flex border-b dark:border-[#505050]">
              <button
                className={`px-2 py-1.5 text-[13px] ${
                  activeTab === "all"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC]"
                    : "text-[#010e30] dark:text-[#ffffff]"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                className={`px-2 py-1.5 text-[12px] font-medium ${
                  activeTab === "teachers"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC]"
                    : "text-[#010e30] dark:text-[#ffffff]"
                }`}
                onClick={() => setActiveTab("teachers")}
              >
                Teachers
              </button>
              <button
                className={`px-2 py-1.5 text-[12px] font-medium ${
                  activeTab === "academicCoaches"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC]"
                    : "text-[#010e30] dark:text-[#ffffff]"
                }`}
                onClick={() => setActiveTab("academicCoaches")}
              >
                Academic Coaches
              </button>
            </div>

            <div className="mt-2 flex-1 overflow-y-auto scrollbar-none scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.button
                    key={user._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center border-b dark:border-b-[#505050] justify-between w-full p-2 cursor-pointer ${
                      selectedUser?._id === user._id
                        ? "bg-[#f0efef] dark:bg-[#3c3c3c] rounded"
                        : "hover:bg-[#f0efef] dark:hover:bg-[#3c3c3c] hover:rounded"
                    }`}
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex space-x-2 items-center">
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-9 h-9 bg-[#D0D0D0] dark:bg-[#444] rounded-lg flex items-center justify-center"
                        >
                          <span className="text-[#959595] dark:text-[#FFFFFF] font-medium text-[14px]">
                            {user.userName.charAt(0)}
                          </span>
                        </motion.div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${getStatusColor(
                            user.status ?? "offline"
                          )}`}
                        ></div>
                      </div>
                      <div className="text-left">
                        <h5 className="font-medium text-[12px] text-[#010E30] dark:text-[#fff]">
                          {user.userName}
                        </h5>
                        <p className="text-[10px] text-gray-500 dark:text-[#fff] dark:text-opacity-[60%] truncate max-w-[180px]">
                          {user.lastSeen}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                      {formatRole(user.role)}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full md:flex-1 bg-white dark:bg-[#2c2c2c] dark:text-[#fff] rounded-lg shadow-md flex flex-col overflow-hidden"
          >
            {selectedUser ? (
              <>
                <div className="p-3 border-b dark:border-[#505050] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <div className="w-10 h-10 bg-[#D0D0D0] dark:bg-[#444] rounded-lg flex items-center justify-center">
                        <span className="dark:text-[#FFFFFF] text-sm">
                          {selectedUser.userName.charAt(0)}
                        </span>
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${getStatusColor(
                          selectedUser.status ?? "offline"
                        )}`}
                      ></div>
                    </motion.div>
                    <div>
                      <h3 className="text-xs font-medium dark:text-[#fff]">
                        {selectedUser.userName}
                      </h3>
                      <p className="text-[10px] text-[#010E3099]/60 dark:text-[#010E3099]/60 font-medium">
                        {formatRole(selectedUser.role)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative flex-1 h-[calc(85vh-100px)]">
                  <div className="absolute inset-0 overflow-y-auto p-3 flex flex-col bg-gray-50 dark:bg-[#2C2C2C] chat-scroll-container scrollbar-none">
                    <AnimatePresence>
                      {Object.entries(groupedMessages)
                        .sort(
                          (a, b) =>
                            new Date(a[0]).getTime() - new Date(b[0]).getTime()
                        )
                        .map(([date, msgs]) => (
                          <div key={date}>
                            <div className="text-center text-[#010E30] dark:text-[#FFFFFF] opacity-60 text-xs my-2 font-medium">
                              {formatDateLabel(date)}
                            </div>
                            {msgs
                              .sort(
                                (a, b) =>
                                  new Date(a.createdDate).getTime() - 
                                  new Date(b.createdDate).getTime()
                              )
                              .map((msg) => (
                                <motion.div
                                  key={msg._id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className={`flex flex-col mb-3 ${
                                    msg.senderId === userData.userId
                                      ? "items-end"
                                      : "items-start"
                                  }`}
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className={`p-2 rounded-lg max-w-[80%] ${
                                      msg.senderId === userData.userId
                                        ? "bg-[#576CBC] text-[#FFFFFF]"
                                        : "bg-[#F1F1F1] dark:bg-[#444] text-[#010E30] dark:text-[#FFFFFF]"
                                    }`}
                                  >
                                    <p className="text-xs">{msg.messages}</p>
                                    <div className="flex items-center justify-end mt-1 space-x-1">
                                      <span className="text-[9px] opacity-70 dark:text-[#fff]">
                                        {new Date(
                                          msg.createdDate
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      {msg.senderId === userData.userId && (
                                        <span className="text-[9px] dark:text-[#fff]">
                                          {msg.isRead ? "✓✓" : "✓"}
                                        </span>
                                      )}
                                    </div>
                                  </motion.div>
                                </motion.div>
                              ))}
                          </div>
                        ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </div>
<motion.div
  initial={{ y: 10, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  className=" border-gray-200 dark:border-[#252525] p-3 bg-white dark:bg-[#272727]"
>
  <div className="flex items-center w-full bg-gray-100 dark:bg-[#343434] rounded px-3 py-2">
    {/* Attachment */}
    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300">
      <GrAttachment size={16} />
    </button>

    {/* Input */}
    <input
      type="text"
      placeholder="Type a message"
      className="flex-1 px-2 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      value={messageText}
      onChange={(e) => setMessageText(e.target.value)}
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          selectedUser &&
          messageText.trim()
        ) {
          handleSendMessage();
        }
      }}
    />

    {/* Send */}
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSendMessage}
      className="p-2 rounded-full"
    >
      <FaTelegramPlane size={16} className="text-[#576CBC]" />
    </motion.button>
  </div>
</motion.div>




              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full bg-gray-50 dark:bg-[#2C2C2C]"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-[#444] rounded-full mb-3 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400 dark:text-[#FFFFFF]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-xs text-[#010E30] dark:text-[#FFFFFF] opacity-60">
                    Select a conversation to start chatting
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </BaseLayout2>
  );
};

export default Message;