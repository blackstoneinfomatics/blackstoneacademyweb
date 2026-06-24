"use client";

import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import React, { useState, useRef, useEffect } from "react";
import { GrAttachment } from "react-icons/gr";
import { FaTelegramPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import axios from "axios";
import { io } from "socket.io-client";
import { Bell } from "lucide-react";
import TeacherHeader from "../../components/TeacherHeader";
import { getSocket } from "@/app/utils/socket";
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

export interface IStudentResponse {
  totalCount: number;
  students: IStudent[];
}

export interface IStudent {
  _id: string;
  username: string;
  password: string;
  role: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  __v: number;
  classScheduleCount: number;
  student: IStudentDetails;
}

export interface IStudentDetails {
  studentId: string;
  studentEmail: string;
  studentPhone: number;
  course: string;
  package: string;
  city: string;
  country: string;
  gender: string;
}

const Message = () => {
  // Set a sample userId, it should be dynamic based on logged-in user
  const [students, setStudents] = useState<IStudent[]>([]);
  const [supervisor, setSupervisor] = useState<IUser[]>([]);
  const [activeTab, setActiveTab] = useState<"students" | "supervisor" | "academic">("students");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageCount, setMessageCount] = useState<number>(0);
    const [userName, setUserName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
 const [academicCoaches, setAcademicCoaches] = useState<IUser[]>([]);
  const [userStatus, setUserStatus] = useState<string>("inactive");
  
    useEffect(() => {
      // setIsClient(true);
      const name = localStorage.getItem("TeacherPortalName");
      const id = localStorage.getItem("TeacherPortalId");
      setUserName(
  name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : ""
);

      // setUserId(id);
    }, []);
  let userId: string | null = null;

  if (typeof window !== "undefined") {
    userId = localStorage.getItem('TeacherId');
  }
  // ✅ Fetch students from the student database
  const fetchStudents = async (): Promise<IStudent[]> => {
    try {
       const token =
    typeof window !== "undefined" ? localStorage.getItem("TeacherAuthToken") : null;

  if (!token) {
    console.error("❌ AdminAuthToken not found");
  }
      const response = await axios.get<IStudentResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}`,{
          headers: {
            'Authorization': `Bearer ${token}`
          },
        }
      );
      return response.data.students;
    } catch (err) {
      console.error("❌ Failed to fetch students:", err);

      return [];
    }
  };

  // ✅ Fetch supervisor from the tenantUser database
  const fetchSupervisor = async (role: string): Promise<IUser[]> => {
    try {
       const token =
    typeof window !== "undefined" ? localStorage.getItem("TeacherAuthToken") : null;

  if (!token) {
    console.error("❌ AdminAuthToken not found");
  }
      const response = await axios.get<{ users: IUser[] }>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}`,
        {
          params: { role },
          headers: {
            'Authorization': `Bearer ${token}`
            },
        }
      );
      console.log(response.data);
      return response.data.users;
    } catch (err) {
      console.error("❌ Failed to fetch supervisor:", err);
      return [];
    }
  };

  // Filter users based on search query
  const filteredUsers: (IUser | IStudent)[] = (
    activeTab === "students"
      ? students
      : activeTab === "supervisor"
      ? supervisor
      : academicCoaches
  ).filter((user) => {
    const isStudent = "username" in user;
    const name = isStudent ? user.username : user.userName;
    const email = isStudent ? user.student?.studentEmail ?? "" : user.email;

    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle message selection
  const handleUserClick = (user: IUser | IStudent) => {
    let selected;
    if ("userName" in user) {
      selected = user; // supervisor (IUser)
    } else {
      selected = {
        ...user,
        userName: user.username,
        email: user.student?.studentEmail ?? "N/A",
        role: [user.role],
      } as IUser;
    }
    setSelectedUser(selected);
    setMessages([]); // Optional: clear previous messages
    fetchMessages(selected._id); // ✅ Load messages for the selected user
  };
  

  // Fetch messages from API
  const fetchMessages = async (receiverId: string) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("TeacherAuthToken") : null;

      if (!token) {
        console.error("❌ TeacherAuthToken not found");
        return;
      }

      const { data } = await axios.get<IMessageResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MESSAGES.GET}/${userId}/${receiverId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
          // withCredentials: true, // optional, helps when cookies are required
        }
      );

      const fetchedMessages = data?.data?.[0]?.messages ?? [];
     console.log(fetchMessages);
    // Filter by senderId and receiverId
    const filteredMessages = fetchedMessages.filter(
      (msg: any) => 
        (msg.senderId === userId && msg.receiverId === receiverId) ||
        (msg.senderId === receiverId && msg.receiverId === userId) // for bidirectional chat
    );
    setMessages(filteredMessages);
      // Count unread messages
      const unreadCount = fetchedMessages.filter((m) => !m.isRead).length;
      setMessageCount(unreadCount); // Update the unread message count
    } catch (err: any) {
      console.error("Error fetching messages:", err.message);
      // If CORS or network issue, error.response will be undefined — log request too
      console.error("error.response:", err.response);
      console.error("error.request:", err.request);
    }
  };
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    const socketRef = getSocket(userId ?? '')

    // Handle incoming messages
    const handleNewMessage = (newMessage: IMessage) => {
      console.log("Received new message:", newMessage);
      setMessages((prev) => [newMessage, ...prev]);
      // Only increment count if message is unread
      if (!newMessage.isRead) {
        setMessageCount((prev) => prev + 1);
      }
    };
    const handleUserStatusCheck = (statusUpdate: { success: string; message: string }) => {
      console.log("user status response:", statusUpdate);
       setUserStatus(statusUpdate.success);
    }
      console.log("selectUserId in useEffect:", selectedUser?._id);
      const userIdToCheck = selectedUser?._id;
      socketRef.emit("userActiveStatusCheck", { userId : userIdToCheck , senderId: userId });
     socketRef.on("userActiveStatusResponse",handleUserStatusCheck);
       
  
    socketRef.on("newmessage", handleNewMessage);

    const fetchAllUsers = async () => {
      const [studentsList, supervisorList] = await Promise.all([
        fetchStudents(),
        fetchSupervisor("SUPERVISOR"),
      ]);

      // Try the role value present in your DB ("ACADEMICCOACH"), fall back to "ACADEMIC_COACH"
      let academicList = await fetchSupervisor("ACADEMICCOACH");
      if (!academicList || academicList.length === 0) {
        academicList = await fetchSupervisor("ACADEMIC_COACH");
      }

      setStudents(studentsList);
      setSupervisor(supervisorList);
      setAcademicCoaches(academicList);
    };
    
    fetchAllUsers();
    // Cleanup: remove only the message listener
    return () => {
      socketRef.off("newmessage", handleNewMessage);
    };
  }, [userId,selectedUser]);
      

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!selectedUser || !messageText.trim()) return;

    // Create the message object in IMessagesend format
    const newMessage: IMessagesend = {
      messages: messageText,
      senderId: userId ?? '',
      senderName: "Teacher",
      receiverId: selectedUser._id,
      receiverName: `${selectedUser.userName}`,
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
       const token =
    typeof window !== "undefined" ? localStorage.getItem("TeacherAuthToken") : null;

  if (!token) {
    console.error("❌ TeacherAuthToken not found");
    return;
  }
      // Send the new message to the backend API
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
        // Convert IMessagesend to IMessage before updating state
        const convertedMessage: IMessage = {
          _id: Date.now().toString(), // Generate a unique _id
          messages: newMessage.messages,
          senderId: newMessage.senderId,
          senderName: newMessage.senderName,
          receiverId: newMessage.receiverId,
          receiverName: newMessage.receiverName,
          createdDate: newMessage.createdDate.toISOString(), // Ensure date is in string format
          time: new Date().toLocaleTimeString(),
          notificationStatus: newMessage.notificationStatus,
          isRead: newMessage.isRead,
          status: newMessage.status,
        };

        // Update messages state with the new message
        setMessages((prev) => [convertedMessage, ...prev]);
        setMessageText(""); // Clear the message input
      } else {
        console.error("Error posting message:", response.data.message);
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
    <BaseLayout>
    <TeacherHeader currentSection="Message" />
      <div className="py-3 px-5">
        <div className="flex flex-col md:flex-row gap-4 h-[85vh]">
          {/* Left Panel */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full md:w-[350px] dark:bg-[#343434] bg-white p-4 rounded-lg shadow-md flex flex-col border "
          >
            <div className="flex items-center space-x-3 p-2">
              <motion.div whileHover={{ scale: 1.05 }}>
                <img
                  src="/assets/images/account.png"
                  alt="Supervisor"
                  className="w-12 h-12 rounded-lg border border-[#dbdbdb]"
                />
              </motion.div>
              <div>
                <div className="flex">
                  <h3 className="text-[18px] font-semibold text-[#010E30] dark:text-[#fff]">
                  {userName}{" "}
                  </h3>
                  <button className="ml-2 text-gray-500">
                    {messageCount > 0 && (
                      <span className=" -mt-7 bg-red-600 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center animate-pulse">
                        {messageCount}
                      </span>
                    )}
                  </button>
                </div>

                <p className="text-xs dark:text-[#FFFFFF99] text-gray-400">Teacher</p>
              </div>
            </div>

            {/* Search Bar */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative mt-2 mb-3"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-xs" />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                className="dark:bg-[#343434] block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                className={`px-3 py-1.5 text-xs font-medium ${
                  activeTab === "students"
                    ? "text-[#002B4D] dark:text-[#576CBC] border-b-2 border-[#576CBC]"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("students")}
              >
                Students
              </button>
              <button
                className={`px-3 py-1.5 text-xs  font-medium ${
                  activeTab === "supervisor"
                    ? "text-[#002B4D] dark:text-[#576CBC] border-b-2 border-[#576CBC]"
                    : "text-gray-500 "
                }`}
                onClick={() => setActiveTab("supervisor")}
              >
                Supervisor
              </button>
              <button
                className={`px-3 py-1.5 text-xs  font-medium ${
                  activeTab === "academic"
                    ? "text-[#002B4D] dark:text-[#576CBC] border-b-2 border-[#576CBC]"
                    : "text-gray-500 "
                }`}
                onClick={() => setActiveTab("academic")}
              >
                Academic Coach
              </button>
            </div>
            <div className="h-full overflow-scroll   scrollbar-none">
              {/* User List */}
              {filteredUsers.map((user) => {
                const isSupervisor = "userName" in user;
                const displayName = isSupervisor ? user.userName : user.username;
                const email = isSupervisor
                  ? user.email
                  : user.student?.studentEmail ?? "N/A";
                const status = user.status ?? "offline";
                const lastSeen = isSupervisor ? user.lastSeen ?? "" : ""; // optional
                const avatarInitial =
                  displayName?.charAt(0).toUpperCase() ?? "?";

                return (
                  <motion.button
                    key={user._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center  dark:bg-[#343434] border-b-1 justify-between w-full p-2 rounded cursor-pointer ${
                      selectedUser?._id === user._id
                        ? "bg-gray-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex space-x-2 items-center">
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-9 h-9 bg-gray-200 dark:text-[#576CBC] rounded-lg flex items-center justify-center"
                        >
                          <span className="text-gray-600  text-xs">
                            {avatarInitial}
                          </span>
                        </motion.div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${getStatusColor(
                            status
                          )}`}
                        ></div>
                      </div>
                      <div className="text-left">
                        <h5 className="font-medium text-xs dark:text-[#FFFFFF] text-[#374557]">
                          {displayName}
                        </h5>
                        <p className="text-[10px]  text-gray-400 truncate max-w-[180px]">
                          {email}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400">{lastSeen}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full md:flex-1 bg-white dark:bg-[#2C2C2C] rounded-lg shadow-md flex flex-col border  overflow-hidden"
          >
            {selectedUser ? (
              <>
                <div className="border-b border-gray-200 p-3">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600  text-sm">
                          {selectedUser.userName.charAt(0)}
                        </span>
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${getStatusColor(
                          userStatus ?? "offline"
                        )}`}
                      ></div>
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

                <div className="flex-1 p-3 overflow-y-auto dark:text-[#FFFFFF] dark:bg-[#343434] scrollbar-none bg-gray-50 flex flex-col">
                  {" "}
                  {/* Added flex-col-reverse */}
                  <AnimatePresence>
                    {[...messages].reverse().map(
                      (
                        msg // Reverse the messages array
                      ) => (
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
                            className={`p-2 rounded-lg max-w-[80%] shadow-sm dark:bg-[#343434] ${
                              msg.senderId === userId
                                ? "bg-[#576CBC]  text-white shadow-lg rounded-tr-none"
                                : "bg-[#F1F1F1] shadow-lg rounded-tl-none"
                            }`}
                          >
                            <p className="text-xs dark:text-[#FFFFFF]">{msg.messages}</p>
                            <div className="flex items-center justify-end mt-1 space-x-1">
                              <span className="text-[9px] opacity-70 dark:text-[#FFFFFF]">
                                {new Date(msg.createdDate).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                              {msg.senderId === userId && (
                                <span className="text-[9px]">
                                  {msg.isRead ? "✓✓" : "✓"}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="border-t border-gray-200 dark:bg-[#2C2C2C] p-3 bg-white"
                >
                  <div className="flex items-center rounded-lg dark:bg-[#343434] bg-gray-50 p-1">
                    <button className="p-1 text-gray-500 hover:text-gray-700 ml-1">
                      <GrAttachment size={14} />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-2 py-1.5 text-xs bg-transparent outline-none"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className={`p-1 rounded-lg dark:bg-[#343434]  flex items-center ${
                        messageText.trim()
                          ? "bg-[#4CBC9A] dark:bg-[#343434] text-white"
                          : "bg-gray-200 dark:text-[#576CBC] text-gray-400 cursor-not-allowed"
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
                className="flex items-center justify-center h-full dark:bg-[#343434] bg-gray-50"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto dark:bg-[#343434] bg-gray-200 rounded-full mb-3 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
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
                  <p className="text-xs text-gray-500">
                    Select a conversation to start chatting
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Message;