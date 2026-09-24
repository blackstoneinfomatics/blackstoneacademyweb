"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { FaTelegramPlane } from "react-icons/fa";
import { FiFilter, FiSearch, FiMoreVertical } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import BaseLayout3 from "../../components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";

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

interface IUser {
  _id: string;
  userName: string;
  email: string;
  role: string[];
  status: string;
  lastLoginDate?: string;
  lastSeen?: string;
}

interface IMessageData {
  _id: string;
  messages: IMessage[];
}

const Message = () => {
  // --------------------------------------------------
  // CURRENT USER
  // --------------------------------------------------

  const currentUser = {
    userId: "admin-001",
    userName: "Will Jonto",
    role: "Super admin",
  };

  // --------------------------------------------------
  // DUMMY USERS
  // --------------------------------------------------

  const [users] = useState<IUser[]>([
    {
      _id: "academy-001",
      userName: "Blackstone Academy",
      email: "academy@example.com",
      role: ["Student"],
      status: "online",
      lastSeen: "2m ago",
    },
    {
      _id: "academy-002",
      userName: "Blackstone Academy",
      email: "academy2@example.com",
      role: ["Parent"],
      status: "online",
      lastSeen: "3m ago",
    },
    {
      _id: "academy-003",
      userName: "Blackstone Academy",
      email: "academy3@example.com",
      role: ["Admin"],
      status: "online",
      lastSeen: "5m ago",
    },
    {
      _id: "academy-004",
      userName: "Blackstone Academy",
      email: "academy4@example.com",
      role: ["Teacher"],
      status: "online",
      lastSeen: "8m ago",
    },
    {
      _id: "academy-005",
      userName: "Blackstone Academy",
      email: "academy5@example.com",
      role: ["Student"],
      status: "online",
      lastSeen: "10m ago",
    },
    {
      _id: "academy-006",
      userName: "Blackstone Academy",
      email: "academy6@example.com",
      role: ["Parent"],
      status: "offline",
      lastSeen: "20m ago",
    },
    {
      _id: "academy-007",
      userName: "Blackstone Academy",
      email: "academy7@example.com",
      role: ["Teacher"],
      status: "online",
      lastSeen: "30m ago",
    },
    {
      _id: "academy-008",
      userName: "Blackstone Academy",
      email: "academy8@example.com",
      role: ["Student"],
      status: "online",
      lastSeen: "35m ago",
    },
    {
      _id: "group-001",
      userName: "Academic Coaches",
      email: "group@example.com",
      role: ["Group"],
      status: "online",
      lastSeen: "1h ago",
    },
  ]);

  // --------------------------------------------------
  // DUMMY MESSAGES
  // --------------------------------------------------

  const [allMessages, setAllMessages] = useState<IMessageData[]>([
    {
      _id: "academy-001",
      messages: [
        {
          _id: "msg-001",
          messages: "Lorem ipsum dolor sit",
          senderId: "academy-001",
          senderName: "Blackstone Academy",
          receiverId: "admin-001",
          receiverName: "Will Jonto",
          createdDate: "2025-09-28T10:00:00",
          time: "10:00 AM",
          notificationStatus: "Seen",
          isRead: true,
          status: "Active",
        },
        {
          _id: "msg-002",
          messages: "Lorem ipsum",
          senderId: "academy-001",
          senderName: "Blackstone Academy",
          receiverId: "admin-001",
          receiverName: "Will Jonto",
          createdDate: "2025-09-28T10:02:00",
          time: "10:02 AM",
          notificationStatus: "Seen",
          isRead: true,
          status: "Active",
        },
        {
          _id: "msg-003",
          messages: "Lorem ipsum dolor sit",
          senderId: "academy-001",
          senderName: "Blackstone Academy",
          receiverId: "admin-001",
          receiverName: "Will Jonto",
          createdDate: "2025-09-28T10:05:00",
          time: "10:05 AM",
          notificationStatus: "Seen",
          isRead: true,
          status: "Active",
        },
        {
          _id: "msg-004",
          messages: "Lorem ipsum dolor sit amet",
          senderId: "admin-001",
          senderName: "Will Jonto",
          receiverId: "academy-001",
          receiverName: "Blackstone Academy",
          createdDate: "2025-09-30T10:00:00",
          time: "10:00 AM",
          notificationStatus: "Seen",
          isRead: true,
          status: "Active",
        },
      ],
    },

    {
      _id: "academy-002",
      messages: [
        {
          _id: "msg-005",
          messages: "Hello, we need some help.",
          senderId: "academy-002",
          senderName: "Blackstone Academy",
          receiverId: "admin-001",
          receiverName: "Will Jonto",
          createdDate: "2025-09-30T09:30:00",
          time: "09:30 AM",
          notificationStatus: "Unseen",
          isRead: false,
          status: "Active",
        },
      ],
    },

    {
      _id: "academy-003",
      messages: [
        {
          _id: "msg-006",
          messages: "Good morning.",
          senderId: "academy-003",
          senderName: "Blackstone Academy",
          receiverId: "admin-001",
          receiverName: "Will Jonto",
          createdDate: "2025-09-30T08:30:00",
          time: "08:30 AM",
          notificationStatus: "Seen",
          isRead: true,
          status: "Active",
        },
      ],
    },
  ]);

  // --------------------------------------------------
  // STATES
  // --------------------------------------------------

  const [activeTab, setActiveTab] = useState<
    "all" | "unread" | "groups"
  >("all");

  const [selectedUser, setSelectedUser] = useState<IUser | null>(
    users[0]
  );

  const [messageText, setMessageText] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
const [showBroadcast, setShowBroadcast] = useState(false);

const [broadcastData, setBroadcastData] = useState({
  messageTitle: "Today Updates day",
  messageType: "Select",
  message: "",
  attachment: null as File | null,
});
  // --------------------------------------------------
  // FILTER USERS
  // --------------------------------------------------

  const filteredUsers = useMemo(() => {
    let result = users;

    if (activeTab === "unread") {
      result = users.filter((user) => {
        const userMessages = allMessages.find(
          (group) => group._id === user._id
        );

        return userMessages?.messages.some(
          (message) => !message.isRead
        );
      });
    }

    if (activeTab === "groups") {
      result = users.filter((user) =>
        user.role.includes("Group")
      );
    }

    if (searchQuery.trim()) {
      result = result.filter(
        (user) =>
          user.userName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          user.email
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          user.role.some((role) =>
            role
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
      );
    }

    return result;
  }, [users, activeTab, searchQuery, allMessages]);

  // --------------------------------------------------
  // SELECT USER
  // --------------------------------------------------

  const handleUserClick = (user: IUser) => {
    setSelectedUser(user);
  };

  // --------------------------------------------------
  // GET SELECTED USER MESSAGES
  // --------------------------------------------------

  const selectedMessages = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    const group = allMessages.find(
      (item) => item._id === selectedUser._id
    );

    return group?.messages || [];
  }, [selectedUser, allMessages]);

  // --------------------------------------------------
  // SCROLL TO BOTTOM
  // --------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedMessages]);

  // --------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------

  const handleSendMessage = () => {
    if (!selectedUser || !messageText.trim()) {
      return;
    }

    const newMessage: IMessage = {
      _id: `msg-${Date.now()}`,
      messages: messageText.trim(),

      senderId: currentUser.userId,
      senderName: currentUser.userName,

      receiverId: selectedUser._id,
      receiverName: selectedUser.userName,

      createdDate: new Date().toISOString(),

      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),

      notificationStatus: "Seen",
      isRead: true,
      status: "Active",
    };

    setAllMessages((prev) => {
      const existingGroup = prev.find(
        (group) => group._id === selectedUser._id
      );

      if (existingGroup) {
        return prev.map((group) =>
          group._id === selectedUser._id
            ? {
                ...group,
                messages: [...group.messages, newMessage],
              }
            : group
        );
      }

      return [
        ...prev,
        {
          _id: selectedUser._id,
          messages: [newMessage],
        },
      ];
    });

    setMessageText("");
  };

  // --------------------------------------------------
  // STATUS COLOR
  // --------------------------------------------------

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
        return "bg-green-400";

      case "busy":
        return "bg-yellow-400";

      default:
        return "bg-gray-300";
    }
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // GROUP MESSAGES BY DATE
  // --------------------------------------------------

  const groupedMessages = selectedMessages.reduce(
    (acc, message) => {
      const date = formatDate(message.createdDate);

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push(message);

      return acc;
    },
    {} as Record<string, IMessage[]>
  );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <BaseLayout3>
    <SuperAdminHeader currentSection="Chats" />
      <div className="min-h-screen rounded-2xl bg-[#F5F7FC] dark:bg-[#1F1F1F] p-4 md:p-6">

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between mb-4">

          <h1 className="text-[22px] font-semibold text-[#010E30] dark:text-white">
            Institute Chats
          </h1>

          <button
            className="bg-[#576CBC] hover:bg-[#4c61aa] text-white text-[13px] font-medium px-4 py-2 rounded-md"
           onClick={()=>setShowBroadcast(true)}
           >

            Broadcast Chat
          </button>
{showBroadcast && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-[420px] bg-white dark:bg-[#343434] rounded-md shadow-xl border border-[#576CBC]"
    >

      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-3">

        <h2 className="text-[17px] font-semibold text-[#010E30] dark:text-white">
          Broadcast Chat
        </h2>

        <button
          onClick={() => setShowBroadcast(false)}
          className="text-[#777D89] dark:text-[#B5B5B5] hover:text-[#010E30] dark:hover:text-white text-lg"
        >
          ×
        </button>

      </div>

      {/* BODY */}
      <div className="px-3 pb-3">

        {/* SEND TO */}
        <div className="mb-3">

          <p className="text-[12px] font-medium text-[#252B3A] dark:text-[#E2E2E2] mb-2">
            Send To
          </p>

          <div className="flex items-center gap-4">

            <label className="flex items-center gap-1.5 text-[11px] text-[#4D5360] dark:text-[#B5B5B5]">
              <input
                type="checkbox"
                checked
                readOnly
                className="accent-[#576CBC]"
              />
              All Tenants
            </label>

            <label className="flex items-center gap-1.5 text-[11px] text-[#4D5360] dark:text-[#B5B5B5]">
              <input
                type="checkbox"
                className="accent-[#576CBC]"
              />
              Select Tenants
            </label>

          </div>

        </div>

        {/* INFO MESSAGE */}
        <div className="flex items-center gap-2 bg-[#EEF2FF] dark:bg-[#36477e33] rounded-md px-3 py-2 mb-3">

          <span className="text-[#576CBC] text-[12px]">
            ●
          </span>

          <p className="text-[11px] text-[#4E5A7A] dark:text-[#C7D2FE]">
            This message will be sent to all tenants (288 tenants)
          </p>

        </div>

        {/* MESSAGE TITLE */}
        <div className="mb-3">

          <label className="block text-[11px] font-medium text-[#252B3A] dark:text-[#E2E2E2] mb-1">
            Message Title
          </label>

          <input
            type="text"
            value={broadcastData.messageTitle}
            onChange={(e) =>
              setBroadcastData({
                ...broadcastData,
                messageTitle: e.target.value,
              })
            }
            className="w-full h-8 border border-[#D9DBE2] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] rounded-md px-2 text-[11px] text-[#252B3A] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
          />

        </div>

        {/* MESSAGE TYPE */}
        <div className="mb-3">

          <label className="block text-[11px] font-medium text-[#252B3A] dark:text-[#E2E2E2] mb-1">
            Message
          </label>

          <select
            value={broadcastData.messageType}
            onChange={(e) =>
              setBroadcastData({
                ...broadcastData,
                messageType: e.target.value,
              })
            }
            className="w-full h-8 border border-[#D9DBE2] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] rounded-md px-2 text-[11px] text-[#555B68] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
          >
            <option value="Select">Select</option>
            <option value="Announcement">Announcement</option>
            <option value="Information">Information</option>
            <option value="Reminder">Reminder</option>
            <option value="Alert">Alert</option>
          </select>

        </div>

        {/* MESSAGE */}
        <div className="mb-3">

          <textarea
            placeholder="Message"
            value={broadcastData.message}
            onChange={(e) =>
              setBroadcastData({
                ...broadcastData,
                message: e.target.value,
              })
            }
            className="w-full h-[90px] border border-[#D9DBE2] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] rounded-md p-2 text-[11px] text-[#252B3A] dark:text-[#E2E2E2] resize-none outline-none focus:border-[#576CBC]"
          />

        </div>

        {/* ATTACHMENT */}
        <div className="mb-4">

          <label className="block text-[11px] font-medium text-[#252B3A] dark:text-[#E2E2E2] mb-1">
            Attachments
          </label>

          <div className="flex items-center border border-[#D9DBE2] dark:border-[#4A4A4A] rounded-md h-8 overflow-hidden">

            <label className="flex-1 px-2 text-[11px] text-[#777D89] dark:text-[#B5B5B5] cursor-pointer">

              {broadcastData.attachment
                ? broadcastData.attachment.name
                : "File"}

              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setBroadcastData({
                    ...broadcastData,
                    attachment:
                      e.target.files?.[0] || null,
                  })
                }
              />

            </label>

            <label className="px-2 text-[10px] text-[#576CBC] cursor-pointer">
              Upload

              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setBroadcastData({
                    ...broadcastData,
                    attachment:
                      e.target.files?.[0] || null,
                  })
                }
              />
            </label>

          </div>

        </div>

        {/* SEND BUTTON */}
        <div className="flex justify-end">

          <button
            onClick={() => {
              console.log("Broadcast Data:", broadcastData);
              setShowBroadcast(false);
            }}
            className="bg-[#576CBC] hover:bg-[#4C61AA] text-white text-[11px] font-medium px-4 py-2 rounded-md"
          >
            Send All Tenant
          </button>

        </div>

      </div>

    </motion.div>

  </div>
)}
        </div>

        {/* MAIN CHAT CONTAINER */}
        <div className="flex gap-3 h-[calc(100vh-105px)]">

          {/* ========================================= */}
          {/* LEFT CHAT LIST */}
          {/* ========================================= */}

          <div className="w-[350px] bg-white dark:bg-[#343434] rounded-lg shadow-sm border border-[#E8EAF0] dark:border-[#3F3F3F] flex flex-col">

            {/* CURRENT USER */}
            <div className="p-3 border-b border-[#EEEEEE] dark:border-[#3F3F3F]">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-md bg-[#E7EAF2] dark:bg-[#2c2c2c] flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/images/account.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">

                  <h3 className="text-[14px] font-semibold text-[#010E30] dark:text-white">
                    {currentUser.userName}
                  </h3>

                  <p className="text-[11px] text-[#7B8190] dark:text-[#B5B5B5]">
                    {currentUser.role}
                  </p>

                </div>

              </div>

            </div>

            {/* SEARCH */}
            <div className="px-3 pt-3">

              <div className="flex items-center gap-2">

                <div className="relative flex-1">

                  <FiSearch
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9EA3AE] dark:text-[#8a8a8a]"
                  />

                  <input
                    type="text"
                    placeholder="Search by keyword"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="w-full h-8 pl-9 pr-3 border border-[#DDDFE6] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] rounded-md text-[12px] text-[#252B3A] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
                  />

                </div>

                <button
                  className="w-8 h-8 border border-[#DDDFE6] dark:border-[#4A4A4A] rounded-md flex items-center justify-center text-[#777D89] dark:text-[#B5B5B5] hover:bg-[#F5F6FA] dark:hover:bg-[#2F2F2F]"
                >
                  <FiFilter size={13} />
                </button>

              </div>

            </div>

            {/* TABS */}
            <div className="flex items-center px-3 mt-2 border-b border-[#EEEEEE] dark:border-[#3F3F3F]">

              <button
                onClick={() => setActiveTab("all")}
                className={`text-[12px] px-2 py-2 ${
                  activeTab === "all"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium"
                    : "text-[#6D7280] dark:text-[#B5B5B5]"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setActiveTab("unread")}
                className={`text-[12px] px-2 py-2 ${
                  activeTab === "unread"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium"
                    : "text-[#6D7280] dark:text-[#B5B5B5]"
                }`}
              >
                Unread
              </button>

              <button
                onClick={() => setActiveTab("groups")}
                className={`text-[12px] px-2 py-2 ${
                  activeTab === "groups"
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium"
                    : "text-[#6D7280] dark:text-[#B5B5B5]"
                }`}
              >
                Groups
              </button>

            </div>

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto">

              <AnimatePresence>

                {filteredUsers.map((user) => {

                  const userMessages =
                    allMessages.find(
                      (group) => group._id === user._id
                    )?.messages || [];

                  const lastMessage =
                    userMessages[userMessages.length - 1];

                  const unread = userMessages.some(
                    (message) => !message.isRead
                  );

                  return (
                    <motion.button
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`w-full flex items-center gap-2 px-3 py-2 border-b border-[#F0F1F4] dark:border-[#3F3F3F] text-left hover:bg-[#F7F8FC] dark:hover:bg-[#2F2F2F] ${
                        selectedUser?._id === user._id
                          ? "bg-[#F4F6FB] dark:bg-[#2c2c2c]"
                          : ""
                      }`}
                      onClick={() =>
                        handleUserClick(user)
                      }
                    >

                      {/* AVATAR */}
                      <div className="relative flex-shrink-0">

                        <div className="w-8 h-8 rounded-md bg-[#E7E8EC] dark:bg-[#242424] flex items-center justify-center">
                          <span className="text-[12px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
                            B
                          </span>
                        </div>

                        <span
                          className={`absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-white dark:border-[#343434] ${getStatusColor(
                            user.status
                          )}`}
                        />

                      </div>

                      {/* USER DETAILS */}
                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-1">

                          <span className="text-[12px] font-semibold text-[#252B3A] dark:text-white truncate">
                            {user.userName}
                          </span>

                          <span className="text-[10px] px-1.5 py-[1px] rounded bg-[#E9F0FF] dark:bg-[#36477e33] text-[#576CBC]">
                            {user.role[0]}
                          </span>

                        </div>

                        <p className="text-[12px] text-[#989DA8] dark:text-[#8a8a8a] truncate mt-[2px]">
                          {lastMessage?.messages ||
                            "No messages yet"}
                        </p>

                      </div>

                      {/* TIME */}
                      <div className="flex flex-col items-end gap-1">

                        <span className="text-[10px] text-[#A2A6AF] dark:text-[#8a8a8a]">
                          {lastMessage
                            ? lastMessage.time
                            : user.lastSeen}
                        </span>

                        {unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#576CBC]" />
                        )}

                      </div>

                    </motion.button>
                  );
                })}

              </AnimatePresence>

            </div>

          </div>

          {/* ========================================= */}
          {/* RIGHT CHAT */}
          {/* ========================================= */}

          <div className="flex-1 bg-white dark:bg-[#343434] rounded-lg shadow-sm border border-[#E8EAF0] dark:border-[#3F3F3F] flex flex-col min-w-0">

            {selectedUser ? (
              <>

                {/* CHAT HEADER */}
                <div className="h-[58px] px-4 border-b border-[#EEEEEE] dark:border-[#3F3F3F] flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="relative">

                      <div className="w-9 h-9 rounded-md bg-[#E7E8EC] dark:bg-[#242424] flex items-center justify-center">
                        <span className="text-[13px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
                          B
                        </span>
                      </div>

                      <span
                        className={`absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-white dark:border-[#343434] ${getStatusColor(
                          selectedUser.status
                        )}`}
                      />

                    </div>

                    <div>

                      <h3 className="text-[13px] font-semibold text-[#252B3A] dark:text-white">
                        {selectedUser.userName}
                      </h3>

                      <p className="text-[10px] text-[#8C919C] dark:text-[#B5B5B5]">
                        {selectedUser.role[0]}
                      </p>

                    </div>

                  </div>

                  <button className="text-[#777D89] dark:text-[#B5B5B5]">
                    <FiMoreVertical size={15} />
                  </button>

                </div>

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto px-5 py-4 bg-[#FCFCFD] dark:bg-[#2c2c2c]">

                  {Object.entries(groupedMessages).map(
                    ([date, msgs]) => (
                      <div key={date}>

                        {/* DATE */}
                        <div className="text-center mb-4">

                          <span className="text-[10px] text-[#A3A7B0] dark:text-[#8a8a8a]">
                            {date}
                          </span>

                        </div>

                        {msgs.map((msg) => {

                          const isMine =
                            msg.senderId ===
                            currentUser.userId;

                          return (
                            <div
                              key={msg._id}
                              className={`flex mb-3 ${
                                isMine
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >

                              <div
                                className={`max-w-[240px] px-3 py-2 rounded-lg ${
                                  isMine
                                    ? "bg-[#576CBC] text-white rounded-br-sm"
                                    : "bg-[#F0F1F3] dark:bg-[#242424] text-[#252B3A] dark:text-[#E2E2E2] rounded-bl-sm"
                                }`}
                              >

                                <p className="text-[11px] leading-4">
                                  {msg.messages}
                                </p>

                                <div
                                  className={`text-[7px] mt-1 text-right ${
                                    isMine
                                      ? "text-white/70"
                                      : "text-[#9B9FA8] dark:text-[#8a8a8a]"
                                  }`}
                                >
                                  {msg.time}
                                </div>

                              </div>

                            </div>
                          );
                        })}

                      </div>
                    )
                  )}

                  <div ref={messagesEndRef} />

                </div>

                {/* MESSAGE INPUT */}
                <div className="p-3 border-t border-[#EEEEEE] dark:border-[#3F3F3F]">

                  <div className="h-10 bg-[#F6F7F9] dark:bg-[#2c2c2c] rounded-md flex items-center px-2">

                    <button className="p-2 text-[#8E939D] dark:text-[#B5B5B5]">
                      <GrAttachment size={13} />
                    </button>

                    <input
                      type="text"
                      placeholder="Type a message"
                      value={messageText}
                      onChange={(e) =>
                        setMessageText(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          messageText.trim()
                        ) {
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 bg-transparent outline-none text-[11px] text-[#252B3A] dark:text-[#E2E2E2] placeholder:text-[#A5A9B2] dark:placeholder:text-[#7A7A7A]"
                    />

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      className="p-2 text-[#576CBC]"
                    >
                      <FaTelegramPlane size={13} />
                    </motion.button>

                  </div>

                </div>

              </>
            ) : (

              /* EMPTY STATE */

              <div className="flex-1 flex items-center justify-center">

                <p className="text-[13px] text-[#9A9EA8] dark:text-[#8a8a8a]">
                  Select a conversation to start chatting
                </p>

              </div>

            )}

          </div>

        </div>
      </div>
    </BaseLayout3>
  );
};

export default Message;