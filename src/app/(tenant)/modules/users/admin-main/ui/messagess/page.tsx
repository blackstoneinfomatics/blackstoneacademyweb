"use client";
import React, { useState, useRef, useEffect } from "react";
import { GrAttachment } from "react-icons/gr";
import { FaTelegramPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import axios from "axios";
import { io } from "socket.io-client";
import { Bell } from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import BaseLayout4 from "../../components/BaseLayout4";
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
  createdDate: Date; // ISO date string
  createdBy: string;
  updatedDate: Date; // ISO date string
  updatedBy: string;
}

const Message = () => {
  const [teachers, setTeachers] = useState<IUser[]>([]);
  const [supervisors, setSupervisors] = useState<IUser[]>([]);
  const [academicCoaches, setAcademicCoaches] = useState<IUser[]>([]);
  const [activeTab, setActiveTab] = useState<
    "supervisors" | "academicCoaches" | "teachers" | "all"
  >("all");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessageData[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageCount, setMessageCount] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const [dashboardRead, setdashboardRead] = useState(false);

  let userId: string | null = null;
  const userName =
    typeof window !== "undefined"
      ? localStorage.getItem("AdminPortalName")
      : null;
  if (typeof window !== "undefined") {
    userId = localStorage.getItem("AdminPortalId");
  }

  const fetchUsersByRole = async (role: string): Promise<IUser[]> => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return [];
      }

      const response = await axios.get<{ users: IUser[] }>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔥 Client-side filtering here
      const allUsers = response.data.users;
      const filtered = allUsers.filter((user) =>
        user.role.some(
          (r) => r.toLowerCase().replace(/_/g, "") === role.toLowerCase()
        )
      );
      return filtered;
    } catch (err) {
      console.error(`❌ Failed to fetch users:`, err);
      return [];
    }
  };

  // Filter users based on search query
  const combinedUsers =
    activeTab === "all"
      ? [...teachers, ...academicCoaches, ...supervisors]
      : activeTab === "supervisors"
      ? supervisors
      : activeTab === "academicCoaches"
      ? academicCoaches
      : teachers;
  const filteredUsers = combinedUsers.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // Handle message selection
  const handleUserClick = (user: IUser) => {
    setSelectedUser(user);
    setMessages([]);
    fetchMessages(user._id);
  };

  // Fetch messages from API

  const fetchMessages = async (receiverId: string) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
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

      const fetchedMessages = data?.data;
      setMessages(fetchedMessages); // for rendering

      // Count unread messages in all groups
      const allMessages = fetchedMessages.flatMap((group) => group.messages);
      const unreadCount = allMessages.filter((m) => !m.isRead).length;
      setMessageCount(unreadCount);
      // Update the unread message count
    } catch (error) {
      console.error("Error fetching messages:", error);
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
      if (supervisors.length === 0) {
        const result = await fetchUsersByRole("SUPERVISOR");
        setSupervisors(result);
      }
      if (academicCoaches.length === 0) {
        const result = await fetchUsersByRole("ACADEMICCOACH");
        setAcademicCoaches(result);
      }
      if (teachers.length === 0) {
        const result = await fetchUsersByRole("TEACHER");
        setTeachers(result);
      }
    };
    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    setSelectedUser(null); // clear selected user on tab change
  }, [activeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const roleAccessRaw = localStorage.getItem("AdminRolePermission");

      if (roleAccessRaw) {
        try {
          const roleAccess = JSON.parse(roleAccessRaw);
          const hasRead = roleAccess?.messages?.write ?? false;
          console.log(hasRead);
          setdashboardRead(hasRead);
        } catch (error) {
          console.error("Invalid JSON in AdminRolePermission:", error);
        }
      }
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
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
        socketRef.current?.emit("subscribe", userId);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from Socket.IO");
      });

      socketRef.current.on("connect_error", (err: any) => {
        console.error("Connection error:", err);
      });
    }
    const handleNewMessage = (newMessage: IMessage) => {
      console.log("Received new message:", newMessage);

      // Check if message is relevant to current chat or should increment count
      const isForCurrentChat =
        (newMessage.senderId === userId &&
          newMessage.receiverId === selectedUser?._id) ||
        (newMessage.senderId === selectedUser?._id &&
          newMessage.receiverId === userId);
      console.log(userId);
      console.log(selectedUser?._id);
      // Always update message count for unread messages
      if (newMessage.receiverId === userId && !newMessage.isRead) {
        setMessageCount((prev) => prev + 1);
      }

      // Only update messages if it's for the current chat
      if (isForCurrentChat) {
        setMessages((prev) => {
          const dateKey = new Date(newMessage.createdDate)
            .toISOString()
            .split("T")[0];
          console.log("enter");
          // Find if we already have messages for this date
          const existingGroupIndex = prev.findIndex(
            (group) => group._id === dateKey
          );

          // Create a new state array
          const newState = [...prev];

          if (existingGroupIndex !== -1) {
            // Add to existing date group - append to maintain chronological order
            newState[existingGroupIndex] = {
              ...newState[existingGroupIndex],
              messages: [...newState[existingGroupIndex].messages, newMessage],
            };
          } else {
            // Create new date group at the beginning (since we're using flex-col-reverse)
            newState.unshift({
              _id: dateKey,
              messages: [newMessage],
            });
          }

          return newState;
        });

        // Scroll to bottom after new message
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    socketRef.current.on("newmessage", handleNewMessage);

    return () => {
      socketRef.current?.off("newmessage", handleNewMessage);
    };
  }, [userId, selectedUser]);

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
  }; // Replace your current groupedMessages logic with:
  const groupedMessages = messages
    .flatMap((group) => group.messages)
    .reduce((acc, msg) => {
      const dateKey = new Date(msg.createdDate).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(msg);
      return acc;
    }, {} as Record<string, IMessage[]>);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!selectedUser || !messageText.trim()) return;

    // Create the message object in IMessagesend format
    const newMessage: IMessagesend = {
      messages: messageText,
      senderId: userId ?? "",
      senderName:  "userName",
      receiverId: selectedUser._id,
      receiverName: selectedUser.userName,
      createdDate: new Date(),
      notificationStatus: "Unseen",
      isRead: false,
      status: "Active",
      senderEmail:"Blackstone@gmail.com",
      receiverEmail: selectedUser.email,
      createdBy: "System",
      updatedDate: new Date(),
      updatedBy: "System",
    };

    try {
      // Send the new message to the backend API
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MESSAGES.CREATE}`,
        newMessage,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the message was successfully posted
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
            // Append to existing group
            const updated = [...prev];
            updated[existingGroupIndex] = {
              ...updated[existingGroupIndex],
              messages: [
                ...updated[existingGroupIndex].messages,
                convertedMessage,
              ], // Append to end
            };
            return updated;
          } else {
            // Add new group at the end
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
        console.error("Error posting message:", response.data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
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

 return (
    <BaseLayout4>
      <AdminHeader currentSection={"Messages"} />

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
             <img
                  src="/assets/images/account.png"
                  alt="Admin"
                  className="w-12 h-12 rounded-lg"
                />
              </motion.div>
              <div>
                <div className="flex">
                <h3 className="text-[18px] font-medium text-[#010E30] dark:text-[#fff]">
                    {userName}
                  </h3>
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
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative mt-2 mb-3"
            >
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
                  activeTab === "supervisors"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC]"
                    : "text-[#010e30] dark:text-[#ffffff]"
                }`}
                onClick={() => setActiveTab("supervisors")}
              >
                Supervisors
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
              <button
                className={`px-2 py-1.5 text-[12px] font-medium ${
                  activeTab === "teachers"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium dark:text-[#576CBC]"
                    : "text-[#010e30] dark:text-[#ffffff]"
                }`}
                onClick={() => setActiveTab("teachers")}
              >
                Teachers
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
                        <h5 className="font-medium  text-[12px] text-[#010E30] dark:text-[#fff]">
                          {user.userName}
                        </h5>
                        <p className="text-[10px] text-gray-500 dark:text-[#fff] dark:text-opacity-[60%] truncate max-w-[180px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-[#fff] dark:text-opacity-[60%] truncate max-w-[180px]">
                      {user.lastSeen}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full md:flex-1 bg-white dark:bg-[#2c2c2c] dark:text-[#fff] rounded-lg shadow-md flex flex-col overflow-hidden"
          >
            {selectedUser ? (
              <>
                <div className=" p-3">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <div className="w-10 h-10 bg-[#D0D0D0] dark:bg-[#D0D0D0]  rounded-lg flex items-center justify-center">
                        <span className="dark:text-[#959595] text-sm">
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
                      <h3 className="text-xs font-medium">
                        {selectedUser.userName}
                      </h3>
                      <div className="flex items-center">
                        <p className="text-[10px] text-gray-400 capitalize">
                          {selectedUser.status} • {selectedUser.role}
                        </p>
                      </div>
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
                              .toSorted(
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
                                    msg.senderId === userId
                                      ? "items-end"
                                      : "items-start"
                                  }`}
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className={`p-2 rounded-lg max-w-[80%] ${
                                      msg.senderId === userId
                                        ? "bg-[#576CBC] text-[#FFFFFF]"
                                        : "bg-[#F1F1F1] dark:bg-[#444] text-[#010E30] dark:text-[#FFFFFF]"
                                    }`}
                                  >
                                    <p className="text-xs">{msg.messages}</p>
                                    <div className="flex items-center justify-end mt-1 space-x-1">
                                      <span className="text-[9px] opacity-70">
                                        {new Date(
                                          msg.createdDate
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      {msg.senderId === userId && (
                                        <span className="text-[9px]">
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
                  className="border-t border-gray-200 dark:border-[#505050] p-3 bg-[#FAFAFB] dark:bg-[#343434]"
                >
                  <div className="flex items-center rounded-lg bg-gray-50 dark:bg-[#444] p-1">
                    <button className="p-1 text-[#010E30] dark:text-[#FFFFFF] hover:text-gray-700 ml-1">
                      <GrAttachment size={14} />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-2 py-1.5 text-xs bg-transparent outline-none text-[#010E30] dark:text-[#FFFFFF]"
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
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className={`p-1 rounded-lg flex items-center ${
                        messageText.trim()
                          ? "bg-[#576CBC] text-white"
                          : "bg-gray-200 dark:bg-[#505050] text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FaTelegramPlane size={14} />
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
    </BaseLayout4>
  );
};

export default Message;