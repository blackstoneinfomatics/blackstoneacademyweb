"use client";

import BaseLayout1 from "@/app/(tenant)/modules/users/Academic-coach/components/BaseLayout1";
import React, { useState, useRef, useEffect } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import axios from "axios";
import { io } from "socket.io-client";
import { CgAttachment } from "react-icons/cg";
import AcademicHeader from "../../components/academicHeader";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

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

interface IStudentInfo {
  studentId: string;
  studentEmail: string;
  studentPhone: number;
  course: string;
  package: string;
  city: string;
  country: string;
  gender: string;
}

interface IStudentResponse {
  totalCount: number;
  students: Array<{
    student: IStudentInfo;
    _id: string;
    username: string;
    password: string;
    role: string;
    status: string;
  }>;
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
  const [admin, setAdmin] = useState<IUser[]>([]);
  const [students, setStudents] = useState<IUser[]>([]);
  const [supervisors, setSupervisors] = useState<IUser[]>([]);
  const [activeTab, setActiveTab] = useState<
    "teachers" | "admin" | "all" | "supervisor" | "students"
  >("all");

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessageData[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageCount, setMessageCount] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
    const name = localStorage.getItem("AcademicCoachPortalName");
    const id = localStorage.getItem("AcademicCoachPortalId");
    setUserName(name || "");
    setUserId(id);
  }, []);

  const fetchStudents = async (): Promise<IUser[]> => {
    try {
      const token = localStorage.getItem("AcademicCoachAuthToken");

      if (!token) {
        console.error("❌ AcademicCoachAuthToken not found");
        return [];
      }

      const response = await axios.get<IStudentResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.students.map((student) => ({
        _id: student._id,
        userName: student.username,
        email: student.student.studentEmail,
        role: [student.role],
        status: student.status,
      }));
    } catch (err) {
      console.error("❌ Failed to fetch students:", err);
      return [];
    }
  };

  const fetchUsersByRole = async (role: string): Promise<IUser[]> => {
    try {
      const token = localStorage.getItem("AcademicCoachAuthToken");

      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return [];
      }

      if (role === "STUDENT") {
        return fetchStudents();
      }

      const response = await axios.get<{ users: IUser[] }>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}`,
        {
          params: { role },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.users;
    } catch (err) {
      console.error(`❌ Failed to fetch users for role ${role}:`, err);
      return [];
    }
  };

  const filteredUsers = (
    activeTab === "teachers"
      ? teachers
      : activeTab === "admin"
        ? admin
        : activeTab === "all"
          ? [...admin, ...students, ...teachers, ...supervisors]
          : activeTab === "supervisor"
            ? supervisors
            : students
  ).filter(
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
      const token = localStorage.getItem("AcademicCoachAuthToken");

      if (!token || !userId) {
        console.error("❌ Auth token or user ID not found");
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
      setMessages(fetchedMessages);

      const allMessages = fetchedMessages.flatMap((group) => group.messages);
      const unreadCount = allMessages.filter((m) => !m.isRead).length;
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

  useEffect(() => {
    if (!userId) return;

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
      const isForCurrentChat =
        (newMessage.senderId === userId &&
          newMessage.receiverId === selectedUser?._id) ||
        (newMessage.senderId === selectedUser?._id &&
          newMessage.receiverId === userId);

      if (newMessage.receiverId === userId && !newMessage.isRead) {
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

    socketRef.current.on("newmessage", handleNewMessage);

    const fetchAllUsers = async () => {
      try {
        const [teachersData, adminsData, studentData, supervisorsData] = await Promise.all([
          fetchUsersByRole("TEACHER"),
          fetchUsersByRole("ADMIN"),
          fetchUsersByRole("STUDENT"),
          fetchUsersByRole("SUPERVISOR"),
        ]);
        setTeachers(teachersData);
        setAdmin(adminsData);
        setStudents(studentData);
        setSupervisors(supervisorsData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();

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
    if (!selectedUser || !messageText.trim() || !userId) return;

    const newMessage: IMessagesend = {
      messages: messageText,
      senderId: userId,
      senderName: userName || "Academic Coach",
      receiverId: selectedUser._id,
      receiverName: selectedUser.userName,
      createdDate: new Date(),
      notificationStatus: "Unseen",
      isRead: false,
      status: "Active",
      senderEmail: "Blackstone@gmail.com",
      receiverEmail: selectedUser.email,
      createdBy: "System",
      updatedDate: new Date(),
      updatedBy: "System",
    };

    try {
      const token = localStorage.getItem("AcademicCoachAuthToken");

      if (!token) {
        console.error("❌ AcademicCoachAuthToken not found");
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

  const formatRole = (roles: string[]) => {
    return roles.map(role => {
      return role.toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }).join(', ');
  };

  if (!isClient) {
    return (
      <BaseLayout1>
        <AcademicHeader currentSection="Message" />
        <div className="py-3 px-5">
          <div className="flex flex-col md:flex-row gap-4 h-[85vh]">
            <div className="w-full md:w-[350px] bg-[#fff] dark:bg-[#343434] p-4 rounded-[12px] shadow-md flex flex-col">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              </div>
            </div>
          </div>
        </div>
      </BaseLayout1>
    );
  }

  return (
    <BaseLayout1>
      <AcademicHeader currentSection="Message" />
      <div className="py-3 px-5">
        <div className="flex flex-col md:flex-row gap-4 h-[85vh]">
          <div className="w-full md:w-[350px] bg-[#fff] dark:bg-[#343434] dark:text-[#fff] p-4 rounded-[12px] shadow-md flex flex-col">
            <div className="flex items-center space-x-3 p-2">
              <div>
                <img
                  src="/assets/images/account.png"
                  alt="Admin"
                  className="w-12 h-12 rounded-lg"
                />
              </div>
              <div>
                <div className="flex">
                  <h3 className="text-[18px] font-semibold text-[#010E30] dark:text-[#fff]">
                    {userName || "Academic Coach"}
                  </h3>
                  {messageCount > 0 && (
                    <span className="ml-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {messageCount}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#010e30a7] font-semibold dark:text-[#fff] dark:opacity-[60%]">
                  Academic coach
                </p>
              </div>
            </div>

            <div className="relative mt-2 mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 h-[18px] w-[18px] dark:border" />
              </div>
              <input
                type="text"
                placeholder="Search by Keyword"
                className="block w-full pl-10 pr-3 py-2 border border-[#CBCBCB] rounded-lg text-[12px] font-normal focus:outline-none focus:ring-1 focus:ring-[#576cbc] dark:text-[#fff] dark:opacity-[50%] dark:bg-[#343434] dark:border-[#504c4c]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex border-b dark:border-[#505050]">
              <button
                className={`px-2 py-1.5 text-[13px] ${activeTab === "all"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium"
                    : "text-[#777777] dark:text-[#7C7C7C] font-normal"
                  }`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                className={`px-2 py-1.5 text-[13px] ${activeTab === "admin"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium"
                    : "text-[#777777] dark:text-[#7C7C7C] font-normal"
                  }`}
                onClick={() => setActiveTab("admin")}
              >
                Admin
              </button>
              <button
                className={`px-2 py-1.5 text-[13px] ${activeTab === "students"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium"
                    : "text-[#777777] dark:text-[#7C7C7C] font-normal"
                  }`}
                onClick={() => setActiveTab("students")}
              >
                Students
              </button>
              <button
                className={`px-2 py-1.5 text-[13px] ${activeTab === "teachers"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium"
                    : "text-[#777777] dark:text-[#7C7C7C] font-normal"
                  }`}
                onClick={() => setActiveTab("teachers")}
              >
                Teachers
              </button>
              <button
                className={`px-2 py-1.5 text-[13px] ${activeTab === "supervisor"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium"
                    : "text-[#777777] dark:text-[#7C7C7C] font-normal"
                  }`}
                onClick={() => setActiveTab("supervisor")}
              >
                Supervisor
              </button>
            </div>

            <div className="mt-2 flex-1 overflow-y-auto scrollbar-none scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  className={`flex items-center border-b-2 dark:border-b-[#504c4c] justify-between w-full p-2 cursor-pointer ${selectedUser?._id === user._id
                      ? "bg-[#f0efef] dark:bg-[#3c3c3c] rounded"
                      : "hover:bg-[#f0efef] dark:hover:bg-[#3c3c3c] hover:rounded"
                    }`}
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex space-x-2 items-center">
                    <div className="relative">
                      <div className="w-9 h-9 bg-[#D0D0D0] dark:bg-[#444] rounded-lg flex items-center justify-center">
                        <span className="text-[#959595] dark:text-[#FFFFFF] font-medium text-[14px]">
                          {user.userName.charAt(0)}
                        </span>
                      </div>
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
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-medium truncate max-w-[180px]">
                        {formatRole(user.role)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-[#fff] dark:text-opacity-[60%] truncate max-w-[180px]">
                    {user.lastSeen}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:flex-1 bg-white dark:bg-[#2c2c2c] dark:text-[#fff] rounded-lg shadow-md flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                <div className="p-3 border-b dark:border-[#505050]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
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
                      </div>
                      <div>
                        <h3 className="text-xs font-medium dark:text-[#fff]">
                          {selectedUser.userName}
                        </h3>
                        <p className="text-[10px] text-gray-400 dark:text-[#fff] dark:text-opacity-[60%] capitalize">
                          {selectedUser.status}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                      {formatRole(selectedUser.role)}
                    </p>
                  </div>
                </div>

                <div className="relative flex-1 h-[calc(85vh-100px)]">
                  <div className="absolute inset-0 overflow-y-auto p-3 flex flex-col bg-gray-50 dark:bg-[#2C2C2C] chat-scroll-container scrollbar-none">
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
                              <div
                                key={msg._id}
                                className={`flex flex-col mb-3 ${msg.senderId === userId
                                    ? "items-end"
                                    : "items-start"
                                  }`}
                              >
                                <div
                                  className={`p-2 rounded-lg max-w-[80%] ${msg.senderId === userId
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
                                    {msg.senderId === userId && (
                                      <span className="text-[9px] dark:text-[#fff]">
                                        {msg.isRead ? "✓✓" : "✓"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-[#505050] p-3 bg-[#FAFAFB] dark:bg-[#343434]">
                  <div className="flex items-center rounded-lg bg-gray-50 dark:bg-[#444] p-1">
                    <button className="p-1 text-[#010E30] dark:text-[#FFFFFF] hover:text-gray-700 ml-1">
                      <CgAttachment size={14} />
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
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className={`p-1 rounded-lg flex items-center ${messageText.trim()
                          ? "bg-[#576CBC] text-white"
                          : "bg-gray-200 dark:bg-[#505050] text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FaTelegramPlane size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-[#2C2C2C]">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout1>
  );
};
export default Message;