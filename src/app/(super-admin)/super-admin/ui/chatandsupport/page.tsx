"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { FaTelegramPlane } from "react-icons/fa";
import { FiFilter, FiSearch, FiMoreVertical } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronDown } from "react-icons/io5";

import BaseLayout3 from "../../components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
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
  isGroup?: boolean;
  plan?: string;
  profileImage?: string;
  members?: { name: string; plan: string }[];
  groupSettings?: "everyone" | "admins";
}

interface IMessageData {
  _id: string;
  messages: IMessage[];
}

// ─────────────────────────────────────────────
// Plan colors
// ─────────────────────────────────────────────
const PLAN_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Premium: {
    bg: "bg-[#F3E8FF] dark:bg-[#3A2F58]",
    text: "text-[#8B5CF6] dark:text-[#C4A8FF]",
    dot: "#8B5CF6",
  },
  Standard: {
    bg: "bg-[#E0F2FE] dark:bg-[#22375A]",
    text: "text-[#3B82F6] dark:text-[#7EB0FF]",
    dot: "#3B82F6",
  },
  Basic: {
    bg: "bg-[#E6F7EC] dark:bg-[#1F3A2B]",
    text: "text-[#22C55E] dark:text-[#68D391]",
    dot: "#22C55E",
  },
};

const getPlanColor = (plan?: string) =>
  PLAN_COLORS[plan ?? ""] ?? {
    bg: "bg-gray-100 dark:bg-[#3A3A3A]",
    text: "text-gray-600 dark:text-gray-300",
    dot: "#9CA3AF",
  };

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const Message = () => {
  const currentUser = {
    userId: "admin-001",
    userName: "Will Jonto",
    role: "Super admin",
  };

  // ─────────────────────────────────────────────
  // Users
  // ─────────────────────────────────────────────
  const [users, setUsers] = useState<IUser[]>([
    {
      _id: "academy-001",
      userName: "Blackstone Academy",
      email: "academy@example.com",
      role: ["Student"],
      status: "online",
      lastSeen: "2m ago",
      plan: "Standard",
    },
    {
      _id: "academy-002",
      userName: "Blackstone Academy",
      email: "academy2@example.com",
      role: ["Parent"],
      status: "online",
      lastSeen: "3m ago",
      plan: "Premium",
    },
    {
      _id: "academy-003",
      userName: "Blackstone Academy",
      email: "academy3@example.com",
      role: ["Admin"],
      status: "online",
      lastSeen: "5m ago",
      plan: "Basic",
    },
    {
      _id: "academy-004",
      userName: "Blackstone Academy",
      email: "academy4@example.com",
      role: ["Teacher"],
      status: "online",
      lastSeen: "8m ago",
      plan: "Standard",
    },
    {
      _id: "academy-005",
      userName: "Blackstone Academy",
      email: "academy5@example.com",
      role: ["Student"],
      status: "online",
      lastSeen: "10m ago",
      plan: "Standard",
    },
    {
      _id: "academy-006",
      userName: "Blackstone Academy",
      email: "academy6@example.com",
      role: ["Parent"],
      status: "offline",
      lastSeen: "20m ago",
      plan: "Basic",
    },
    {
      _id: "group-001",
      userName: "Academic Coaches",
      email: "group@example.com",
      role: ["Group"],
      status: "online",
      lastSeen: "1h ago",
      isGroup: true,
      plan: "Basic",
      members: [
        { name: "Blackstone Academy", plan: "Premium" },
        { name: "Blackstone Academy", plan: "Basic" },
      ],
      groupSettings: "everyone",
    },
  ]);

  // ─────────────────────────────────────────────
  // Messages
  // ─────────────────────────────────────────────
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
  ]);

  // ─────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "groups">("all");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(users[0]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Broadcast
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    messageTitle: "Today Updates day",
    messageType: "Select",
    message: "",
    attachment: null as File | null,
  });

  // 3-dot menu
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  // Add Group
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [addGroupData, setAddGroupData] = useState({
    groupName: "Basic Plan",
    plan: "Basic",
    profileImage: null as File | null,
    profilePreview: null as string | null,
    selectedPeople: [] as string[],
  });
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [showPeopleDropdown, setShowPeopleDropdown] = useState(false);
  const [peopleSearch, setPeopleSearch] = useState("");

  // Group Details
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [editGroupImagePreview, setEditGroupImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ─────────────────────────────────────────────
  // Plan tenants (fallback)
  // ─────────────────────────────────────────────
  const PLAN_TENANTS: Record<string, { name: string; plan: string }[]> = {
    Basic: [
      { name: "Blackstone Academy", plan: "Basic" },
      { name: "Blackstone Academy", plan: "Basic" },
      { name: "Blackstone Academy", plan: "Basic" },
    ],
    Standard: [
      { name: "Blackstone Academy", plan: "Standard" },
      { name: "Blackstone Academy", plan: "Standard" },
    ],
    Premium: [
      { name: "Blackstone Academy", plan: "Premium" },
      { name: "Blackstone Academy", plan: "Premium" },
    ],
  };

  // ─────────────────────────────────────────────
  // People options
  // ─────────────────────────────────────────────
  const peopleOptions = useMemo(
    () => users.filter((u) => !u.role.includes("Group")),
    [users]
  );

  const filteredPeople = useMemo(() => {
    if (!peopleSearch.trim()) return peopleOptions;
    const t = peopleSearch.toLowerCase();
    return peopleOptions.filter(
      (p) =>
        p.userName.toLowerCase().includes(t) ||
        p.email.toLowerCase().includes(t)
    );
  }, [peopleOptions, peopleSearch]);

  const toggleSelectedPerson = (id: string) => {
    setAddGroupData((prev) => {
      const exists = prev.selectedPeople.includes(id);
      return {
        ...prev,
        selectedPeople: exists
          ? prev.selectedPeople.filter((p) => p !== id)
          : [...prev.selectedPeople, id],
      };
    });
  };

  // ─────────────────────────────────────────────
  // Filtered users
  // ─────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let result = users;

    if (activeTab === "unread") {
      result = result.filter((user) => {
        const msgs = allMessages.find((g) => g._id === user._id)?.messages;
        return msgs?.some((m) => !m.isRead);
      });
    }

    if (activeTab === "groups") {
      result = result.filter((u) => u.role.includes("Group"));
    }

    if (searchQuery.trim()) {
      result = result.filter(
        (u) =>
          u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.role.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return result;
  }, [users, activeTab, searchQuery, allMessages]);

  const handleUserClick = (user: IUser) => setSelectedUser(user);

  const selectedMessages = useMemo(() => {
    if (!selectedUser) return [];
    return allMessages.find((g) => g._id === selectedUser._id)?.messages || [];
  }, [selectedUser, allMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages]);

  // ─────────────────────────────────────────────
  // Send message
  // ─────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!selectedUser || !messageText.trim()) return;

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
      const existing = prev.find((g) => g._id === selectedUser._id);
      if (existing) {
        return prev.map((g) =>
          g._id === selectedUser._id
            ? { ...g, messages: [...g.messages, newMessage] }
            : g
        );
      }
      return [...prev, { _id: selectedUser._id, messages: [newMessage] }];
    });

    setMessageText("");
  };

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const groupedMessages = selectedMessages.reduce((acc, message) => {
    const date = formatDate(message.createdDate);
    if (!acc[date]) acc[date] = [];
    acc[date].push(message);
    return acc;
  }, {} as Record<string, IMessage[]>);

  // ─────────────────────────────────────────────
  // 3-dot menu
  // ─────────────────────────────────────────────
  const handleOpenGroupDetails = () => {
    setShowGroupMenu(false);
    setEditGroupImagePreview(selectedUser?.profileImage ?? null);
    setShowGroupDetails(true);
  };

  const handleDeleteGroup = async () => {
    if (!selectedUser) return;
    const deletedId = selectedUser._id;

    try {
      // await deleteGroupApi(deletedId);

      setUsers((prev) => prev.filter((u) => u._id !== deletedId));
      setAllMessages((prev) => prev.filter((g) => g._id !== deletedId));
      setSelectedUser((prev) =>
        prev?._id === deletedId
          ? users.find((u) => u._id !== deletedId) ?? null
          : prev
      );

      setShowDeleteConfirm(false);
      setShowGroupDetails(false);
      setShowGroupMenu(false);
      setEditGroupImagePreview(null);
    } catch (err) {
      console.error("Failed to delete group:", err);
      // optionally show a toast/error
    }
  };

  const handleClearChat = () => {
    if (!selectedUser) return;
    setAllMessages((prev) =>
      prev.map((g) => (g._id === selectedUser._id ? { ...g, messages: [] } : g))
    );
    setShowGroupMenu(false);
  };

  const handleDeleteChat = () => {
    if (!selectedUser) return;
    setAllMessages((prev) => prev.filter((g) => g._id !== selectedUser._id));
    setShowGroupMenu(false);
    setSelectedUser(null);
  };

  // ─────────────────────────────────────────────
  // Create Group
  // ─────────────────────────────────────────────
  const handleCreateGroup = () => {
    const manualMembers = peopleOptions
      .filter((p) => addGroupData.selectedPeople.includes(p._id))
      .map((p) => ({ name: p.userName, plan: p.plan ?? "Basic" }));

    const members =
      manualMembers.length > 0
        ? manualMembers
        : PLAN_TENANTS[addGroupData.plan] || [];

    const newGroup: IUser = {
      _id: `group-${Date.now()}`,
      userName: addGroupData.groupName,
      email: "group@example.com",
      role: ["Group"],
      status: "online",
      lastSeen: "just now",
      isGroup: true,
      plan: addGroupData.plan,
      profileImage: addGroupData.profilePreview ?? undefined,
      members,
      groupSettings: "everyone",
    };

    setUsers((prev) => [newGroup, ...prev]);
    setSelectedUser(newGroup);
    setShowAddGroup(false);
    setAddGroupData({
      groupName: "Basic Plan",
      plan: "Basic",
      profileImage: null,
      profilePreview: null,
      selectedPeople: [],
    });
    setPeopleSearch("");
  };

  const handleSaveGroupDetails = () => {
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u._id === selectedUser._id
          ? { ...u, profileImage: editGroupImagePreview ?? u.profileImage }
          : u
      )
    );

    setSelectedUser((prev) =>
      prev
        ? { ...prev, profileImage: editGroupImagePreview ?? prev.profileImage }
        : prev
    );

    setShowGroupDetails(false);
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
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
            onClick={() => setShowBroadcast(true)}
          >
            Broadcast Chat
          </button>
        </div>

        {/* MAIN CONTAINER */}
        <div className="flex flex-col md:flex-row gap-3 md:h-[calc(100vh-105px)]">
          {/* LEFT PANEL */}
          <div className="w-full md:w-[350px] md:flex-shrink-0 bg-white dark:bg-[#343434] rounded-lg shadow-sm border border-[#E8EAF0] dark:border-[#3F3F3F] flex flex-col">
            {/* CURRENT USER */}
            <div className="p-3 border-b border-[#EEEEEE] dark:border-[#3F3F3F]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#E7EAF2] dark:bg-[#2c2c2c] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src="/assets/images/account.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-[#010E30] dark:text-white truncate">
                    {currentUser.userName}
                  </h3>
                  <p className="text-[11px] text-[#7B8190] dark:text-[#B5B5B5] truncate">
                    {currentUser.role}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddGroup(true)}
                  title="Add Group"
                  className="ml-auto h-10 w-10 flex-shrink-0 flex items-center justify-center transition hover:opacity-90"
                >
                  <img
                    src="/assets/images/superadmin-chatandsupport-addgroup-icon.svg"
                    alt="Add Group"
                    className="h-5.5 w-5.5 object-contain"
                  />
                </button>
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-9 pr-3 border border-[#DDDFE6] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] rounded-md text-[12px] text-[#252B3A] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
                  />
                </div>
                <button className="w-8 h-8 border border-[#DDDFE6] dark:border-[#4A4A4A] rounded-md flex items-center justify-center text-[#777D89] dark:text-[#B5B5B5] hover:bg-[#F5F6FA] dark:hover:bg-[#2F2F2F]">
                  <FiFilter size={13} />
                </button>
              </div>
            </div>

            {/* TABS */}
            <div className="flex items-center px-3 mt-3 border-b border-[#EEEEEE] dark:border-[#3F3F3F]">
              {(["all", "unread", "groups"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[12px] px-3 py-2 capitalize transition ${activeTab === tab
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium"
                    : "text-[#6D7280] dark:text-[#B5B5B5]"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto max-h-[400px] md:max-h-none">
              <AnimatePresence>
                {filteredUsers.map((user) => {
                  const userMessages =
                    allMessages.find((g) => g._id === user._id)?.messages || [];
                  const lastMessage = userMessages[userMessages.length - 1];
                  const unread = userMessages.some((m) => !m.isRead);
                  const planColor = getPlanColor(user.plan);

                  return (
                    <motion.button
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`w-full flex items-center gap-2 px-3 py-2 border-b border-[#F0F1F4] dark:border-[#3F3F3F] text-left hover:bg-[#F7F8FC] dark:hover:bg-[#2F2F2F] ${selectedUser?._id === user._id
                        ? "bg-[#F4F6FB] dark:bg-[#2c2c2c]"
                        : ""
                        }`}
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-md bg-[#E7E8EC] dark:bg-[#242424] flex items-center justify-center overflow-hidden">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.userName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[12px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
                              {user.userName?.charAt(0)?.toUpperCase() ?? "B"}
                            </span>
                          )}
                        </div>
                        <span
                          className={`absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-white dark:border-[#343434] ${getStatusColor(
                            user.status
                          )}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[12px] font-semibold text-[#252B3A] dark:text-white truncate">
                            {user.userName}
                          </span>
                          {user.plan && (
                            <span
                              className={`text-[10px] px-1.5 py-[1px] rounded flex-shrink-0 ${planColor.bg} ${planColor.text}`}
                            >
                              {user.plan}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#989DA8] dark:text-[#8a8a8a] truncate mt-[2px]">
                          {lastMessage?.messages || "No messages yet"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[10px] text-[#A2A6AF] dark:text-[#8a8a8a]">
                          {lastMessage ? lastMessage.time : user.lastSeen}
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

          {/* RIGHT CHAT PANEL */}
          <div className="flex-1 bg-white dark:bg-[#343434] rounded-lg shadow-sm border border-[#E8EAF0] dark:border-[#3F3F3F] flex flex-col min-w-0 min-h-[500px] md:min-h-0">
            {selectedUser ? (
              <>
                <div className="h-[58px] px-4 border-b border-[#EEEEEE] dark:border-[#3F3F3F] flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-md bg-[#E7E8EC] dark:bg-[#242424] flex items-center justify-center overflow-hidden">
                        {selectedUser.profileImage ? (
                          <img
                            src={selectedUser.profileImage}
                            alt={selectedUser.userName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[13px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
                            {selectedUser.userName?.charAt(0)?.toUpperCase() ??
                              "B"}
                          </span>
                        )}
                      </div>
                      <span
                        className={`absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-white dark:border-[#343434] ${getStatusColor(
                          selectedUser.status
                        )}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-semibold text-[#252B3A] dark:text-white truncate">
                        {selectedUser.userName}
                      </h3>
                      <p className="text-[10px] text-[#8C919C] dark:text-[#B5B5B5] truncate">
                        {selectedUser.role[0]}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowGroupMenu((o) => !o)}
                      className="text-[#777D89] dark:text-[#B5B5B5] p-2 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-md"
                    >
                      <FiMoreVertical size={15} />
                    </button>

                    {showGroupMenu && (
                      <div className="absolute right-0 top-10 z-40 w-[160px] bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        <button
                          className="block w-full text-left px-4 py-2 text-[12px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                          onClick={handleOpenGroupDetails}
                        >
                          Group Details
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-[12px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                          onClick={handleClearChat}
                        >
                          Clear chat
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-[12px] text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]"
                          onClick={handleDeleteChat}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 bg-[#FCFCFD] dark:bg-[#2c2c2c]">
                  {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="text-center mb-4">
                        <span className="text-[10px] text-[#A3A7B0] dark:text-[#8a8a8a]">
                          {date}
                        </span>
                      </div>

                      {msgs.map((msg) => {
                        const isMine = msg.senderId === currentUser.userId;
                        return (
                          <div
                            key={msg._id}
                            className={`flex mb-3 ${isMine ? "justify-end" : "justify-start"
                              }`}
                          >
                            <div
                              className={`max-w-[240px] px-3 py-2 rounded-lg ${isMine
                                ? "bg-[#576CBC] text-white rounded-br-sm"
                                : "bg-[#F0F1F3] dark:bg-[#242424] text-[#252B3A] dark:text-[#E2E2E2] rounded-bl-sm"
                                }`}
                            >
                              <p className="text-[11px] leading-4 break-words">
                                {msg.messages}
                              </p>
                              <div
                                className={`text-[7px] mt-1 text-right ${isMine
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
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-[#EEEEEE] dark:border-[#3F3F3F]">
                  <div className="h-10 bg-[#F6F7F9] dark:bg-[#2c2c2c] rounded-md flex items-center px-2">
                    <button className="p-2 text-[#8E939D] dark:text-[#B5B5B5]">
                      <GrAttachment size={13} />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && messageText.trim()) {
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
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[13px] text-[#9A9EA8] dark:text-[#8a8a8a]">
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ BROADCAST MODAL ═══════════ */}
        <AnimatePresence>
          {showBroadcast && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
              onClick={() => setShowBroadcast(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[420px] bg-white dark:bg-[#343434] rounded-md shadow-xl"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#3F3F3F]">
                  <h2 className="text-[16px] font-semibold text-[#010E30] dark:text-white">
                    Broadcast Chat
                  </h2>
                  <button
                    onClick={() => setShowBroadcast(false)}
                    className="text-[#777D89] dark:text-[#B5B5B5] hover:text-[#010E30] dark:hover:text-white text-xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-[12px] font-medium text-[#252B3A] dark:text-[#E2E2E2] mb-1">
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
                      className="w-full h-9 border border-[#D9DBE2] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] rounded-md px-3 text-[12px] text-[#252B3A] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#252B3A] dark:text-[#E2E2E2] mb-1">
                      Message
                    </label>
                    <textarea
                      placeholder="Type your message..."
                      value={broadcastData.message}
                      onChange={(e) =>
                        setBroadcastData({
                          ...broadcastData,
                          message: e.target.value,
                        })
                      }
                      className="w-full h-[100px] border border-[#D9DBE2] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] rounded-md p-2 text-[12px] text-[#252B3A] dark:text-[#E2E2E2] resize-none outline-none focus:border-[#576CBC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#252B3A] dark:text-[#E2E2E2] mb-1">
                      Attachments
                    </label>
                    <div className="flex items-center border border-[#D9DBE2] dark:border-[#4A4A4A] rounded-md h-9 overflow-hidden">
                      <span className="flex-1 px-3 text-[12px] text-[#777D89] dark:text-[#B5B5B5] truncate">
                        {broadcastData.attachment
                          ? broadcastData.attachment.name
                          : "No file chosen"}
                      </span>
                      <label className="px-3 text-[11px] font-medium text-[#576CBC] cursor-pointer hover:bg-[#F2F4FF] dark:hover:bg-[#2A3550] h-full flex items-center">
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) =>
                            setBroadcastData({
                              ...broadcastData,
                              attachment: e.target.files?.[0] || null,
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowBroadcast(false)}
                      className="h-9 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold hover:bg-[#F2F4FF] dark:hover:bg-[#2A3550]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        console.log("Broadcast Data:", broadcastData);
                        setShowBroadcast(false);
                      }}
                      className="h-9 rounded-md bg-[#576CBC] hover:bg-[#4C61AA] text-white px-4 text-[12px] font-semibold"
                    >
                      Send All Tenant
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════ ADD GROUP MODAL ═══════════ */}
        <AnimatePresence>
          {showAddGroup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4"
              onClick={() => setShowAddGroup(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-[460px] max-h-[92vh] sm:max-h-[90vh] bg-white dark:bg-[#2c2c2c] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              >
                {/* HEADER */}
                <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F]">
                  <h2 className="text-[16px] sm:text-[17px] font-semibold text-[#101B41] dark:text-white">
                    Add Group
                  </h2>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {/* Group Name + Profile Photo */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* ✅ Photo with + badge */}
                    <div className="relative self-start">
                      <label className="cursor-pointer block">
                        <div className="w-[60px] h-[60px] rounded-2xl bg-[#E7E8EC] dark:bg-[#3A3A3A] flex items-center justify-center overflow-hidden">
                          {addGroupData.profilePreview ? (
                            <img
                              src={addGroupData.profilePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[28px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
                              G
                            </span>
                          )}
                        </div>

                        {/* Plus badge — top right */}
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#576CBC] border-2 border-white dark:border-[#2c2c2c] flex items-center justify-center shadow-sm">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setAddGroupData({
                              ...addGroupData,
                              profileImage: file,
                              profilePreview: file
                                ? URL.createObjectURL(file)
                                : null,
                            });
                          }}
                        />
                      </label>
                    </div>

                    {/* Group name */}
                    <div className="flex-1 min-w-0">
                      <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-white">
                        Group Name
                      </label>
                      <input
                        type="text"
                        value={addGroupData.groupName}
                        onChange={(e) =>
                          setAddGroupData({
                            ...addGroupData,
                            groupName: e.target.value,
                          })
                        }
                        className="w-full h-10 sm:h-9 rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 text-[12px] text-[#101B41] dark:text-white outline-none focus:border-[#576CBC]"
                      />
                    </div>
                  </div>

                  {/* Select Plan */}
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-white">
                      Select Plan
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPlanDropdown((o) => !o)}
                        className="w-full h-10 sm:h-9 rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 text-[12px] text-[#101B41] dark:text-white text-left flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: getPlanColor(addGroupData.plan)
                                .dot,
                            }}
                          />
                          {addGroupData.plan}
                        </span>
                        <IoChevronDown className="text-[#777D89] dark:text-[#B5B5B5]" />
                      </button>

                      {showPlanDropdown && (
                        <div className="absolute left-0 right-0 top-11 sm:top-10 z-20 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#3A3A3A] shadow-lg overflow-hidden">
                          {["Basic", "Standard", "Premium"].map((plan) => {
                            const c = getPlanColor(plan);
                            return (
                              <button
                                key={plan}
                                onClick={() => {
                                  setAddGroupData({ ...addGroupData, plan });
                                  setShowPlanDropdown(false);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2.5 sm:py-2 text-[12px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: c.dot }}
                                />
                                {plan}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Select Users */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-[12px] font-medium text-[#101B41] dark:text-white">
                        Select Users
                      </label>
                      <span className="text-[11px] text-[#576CBC] dark:text-[#A8B7E8]">
                        {addGroupData.selectedPeople.length} selected
                      </span>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPeopleDropdown((o) => !o)}
                        className="w-full min-h-[40px] sm:min-h-[36px] rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 py-1.5 text-[12px] text-[#101B41] dark:text-white text-left flex items-center justify-between gap-2"
                      >
                        <span className="flex-1 truncate text-[#8C919C] dark:text-[#8a8a8a]">
                          {addGroupData.selectedPeople.length === 0
                            ? "Select users..."
                            : `${addGroupData.selectedPeople.length} user${addGroupData.selectedPeople.length > 1 ? "s" : ""
                            } selected`}
                        </span>
                        <IoChevronDown
                          className={`text-[#777D89] dark:text-[#B5B5B5] transition-transform flex-shrink-0 ${showPeopleDropdown ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {showPeopleDropdown && (
                        <div className="absolute left-0 right-0 top-11 sm:top-10 z-30 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#3A3A3A] shadow-lg overflow-hidden">
                          <div className="border-b border-gray-200 dark:border-gray-700 p-2">
                            <input
                              type="text"
                              placeholder="Search users..."
                              value={peopleSearch}
                              onChange={(e) => setPeopleSearch(e.target.value)}
                              className="w-full h-8 rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[11px] text-[#101B41] dark:text-white outline-none focus:border-[#576CBC]"
                            />
                          </div>

                          <div className="max-h-[160px] sm:max-h-[200px] overflow-y-auto">
                            {filteredPeople.length === 0 ? (
                              <p className="py-4 text-center text-[11px] text-gray-400">
                                No users found
                              </p>
                            ) : (
                              filteredPeople.map((person) => {
                                const isChecked =
                                  addGroupData.selectedPeople.includes(
                                    person._id
                                  );
                                const c = getPlanColor(person.plan);
                                return (
                                  <label
                                    key={person._id}
                                    className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[12px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() =>
                                        toggleSelectedPerson(person._id)
                                      }
                                      className="h-3.5 w-3.5 accent-[#576CBC] flex-shrink-0"
                                    />
                                    <span className="flex-1 truncate">
                                      {person.userName}
                                    </span>
                                    {person.plan && (
                                      <span
                                        className={`text-[10px] px-1.5 py-[1px] rounded flex-shrink-0 ${c.bg} ${c.text}`}
                                      >
                                        {person.plan}
                                      </span>
                                    )}
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selected chips */}
                    {addGroupData.selectedPeople.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 rounded-md border border-[#E6EAF2] dark:border-[#4A4A4A] bg-[#F8F9FC] dark:bg-[#2c2c2c] p-2 max-h-[80px] overflow-y-auto">
                        {addGroupData.selectedPeople.map((id) => {
                          const person = peopleOptions.find((p) => p._id === id);
                          if (!person) return null;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => toggleSelectedPerson(id)}
                              className="inline-flex items-center gap-1 rounded-md bg-[#E6EAF2] px-2 py-1 text-[11px] font-medium text-[#576CBC] hover:bg-[#D6DDF0] dark:bg-[#3A4570] dark:text-[#A8B7E8]"
                            >
                              <span className="max-w-[100px] truncate">
                                {person.userName}
                              </span>
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="flex-shrink-0"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Tenant List */}
                  <div>
                    <div className="mb-2 flex items-center justify-between rounded-t-md border border-b-0 border-[#E6EAF2] dark:border-[#4A4A4A] bg-[#F8F9FC] dark:bg-[#2c2c2c] px-3 py-2">
                      <span className="text-[12px] sm:text-[13px] font-medium text-[#101B41] dark:text-white truncate">
                        {addGroupData.plan} Plan Tenants
                      </span>
                      <span className="rounded-md bg-[#E6F0EC] text-[#2F7A5C] px-2 py-0.5 text-[11px] font-semibold flex-shrink-0 ml-2">
                        {String(
                          (PLAN_TENANTS[addGroupData.plan] || []).length
                        ).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="max-h-[140px] sm:max-h-[180px] overflow-y-auto rounded-b-md border border-[#E6EAF2] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] p-3 space-y-2">
                      {(PLAN_TENANTS[addGroupData.plan] || []).map(
                        (tenant, i) => {
                          const c = getPlanColor(tenant.plan);
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between gap-2 text-[12px]"
                            >
                              <span className="text-[#576CBC] dark:text-[#A8B7E8] truncate">
                                {tenant.name}
                              </span>
                              <span
                                className={`text-[11px] flex-shrink-0 ${c.text}`}
                              >
                                {tenant.plan}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex-shrink-0 flex justify-end gap-2 sm:gap-3 px-5 py-3 border-t border-[#F0F1F4] dark:border-[#3F3F3F] bg-white dark:bg-[#2c2c2c]">
                  <button
                    onClick={() => setShowAddGroup(false)}
                    className="flex-1 sm:flex-none h-10 sm:h-9 rounded-md border border-[#576CBC] text-[#576CBC] px-4 sm:px-5 text-[12px] font-semibold hover:bg-[#F2F4FF] dark:hover:bg-[#2A3550]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    className="flex-1 sm:flex-none h-10 sm:h-9 rounded-md bg-[#576CBC] hover:bg-[#4C61AA] text-white px-4 sm:px-5 text-[12px] font-semibold"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════ GROUP DETAILS MODAL ═══════════ */}
        <AnimatePresence>
          {showGroupDetails && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4"
              onClick={() => setShowGroupDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-[460px] max-h-[92vh] sm:max-h-[90vh] bg-white dark:bg-[#2c2c2c] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              >
                {/* HEADER */}
                <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F]">
                  <h2 className="text-[16px] sm:text-[17px] font-semibold text-[#101B41] dark:text-white">
                    Group Details
                  </h2>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {/* Group Name + Photo */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* ✅ Photo with edit image badge */}
                    <div className="relative self-start">
                      <label className="cursor-pointer block">
                        <div className="w-[66px] h-[66px] rounded-2xl bg-[#E7E8EC] dark:bg-[#3A3A3A] flex items-center justify-center overflow-hidden">
                          {editGroupImagePreview || selectedUser.profileImage ? (
                            <img
                              src={editGroupImagePreview || selectedUser.profileImage || ""}
                              alt={selectedUser.userName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[28px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
                              {selectedUser.userName?.charAt(0)?.toUpperCase() ?? "G"}
                            </span>
                          )}
                        </div>

                        {/* ✅ Edit badge — image field */}
                        <img
                          src="/assets/images/superadmin-chatandsupport-editgroupicon.svg"
                          alt="Edit"
                          className="absolute -top-1 -right-1 w-4 h-4 object-contain"
                        />

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setEditGroupImagePreview(file ? URL.createObjectURL(file) : null);
                          }}
                        />
                      </label>
                    </div>

                    {/* Group name */}
                    <div className="flex-1 min-w-0">
                      <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-white">
                        Group Name
                      </label>
                      <input
                        type="text"
                        value={selectedUser.userName || "Basic Plan"}
                        readOnly
                        className="w-full h-10 sm:h-9 rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 text-[12px] text-[#101B41] dark:text-white outline-none"
                      />
                      <p className="mt-1 text-[10px] text-[#8C919C] dark:text-[#8a8a8a]">
                        Click avatar to change photo
                      </p>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="rounded-md border border-[#E6EAF2] dark:border-[#4A4A4A] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#E6EAF2] dark:border-[#4A4A4A] bg-[#F8F9FC] dark:bg-[#2c2c2c] px-3 py-2">
                      <span className="text-[13px] font-medium text-[#101B41] dark:text-white">
                        Group Members
                      </span>
                      <span className="rounded-md bg-[#E6F0EC] text-[#2F7A5C] px-2 py-0.5 text-[11px] font-semibold">
                        {String(selectedUser.members?.length ?? 0).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto bg-white dark:bg-[#343434] p-2 space-y-1">
                      {(selectedUser.members ?? []).map((member, i) => {
                        const c = getPlanColor(member.plan);
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-[#F8F9FC] dark:hover:bg-[#3A3A3A]"
                          >
                            <div className="w-6 h-6 rounded-md bg-[#E7E8EC] dark:bg-[#3A3A3A] flex items-center justify-center">
                              <span className="text-[10px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
                                {member.name?.charAt(0)?.toUpperCase() ?? "B"}
                              </span>
                            </div>
                            <span className="flex-1 text-[12px] text-[#101B41] dark:text-white truncate">
                              {member.name}
                            </span>
                            <span className={`text-[11px] flex-shrink-0 ${c.text}`}>
                              {member.plan}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Group Settings */}
                  <div className="rounded-md border border-[#E6EAF2] dark:border-[#4A4A4A] p-3">
                    <p className="mb-2 text-[13px] font-medium text-[#101B41] dark:text-white">
                      Group Settings
                    </p>
                    <p className="mb-2 text-[12px] text-[#6D7280] dark:text-[#B5B5B5]">
                      Who can send messages
                    </p>
                    <div className="flex flex-wrap items-center gap-6">
                      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                        <input
                          type="radio"
                          name="groupSettings"
                          checked={
                            selectedUser.groupSettings === "everyone" ||
                            !selectedUser.groupSettings
                          }
                          onChange={() => { }}
                          className="h-3.5 w-3.5 accent-[#576CBC]"
                        />
                        Everyone
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                        <input
                          type="radio"
                          name="groupSettings"
                          checked={selectedUser.groupSettings === "admins"}
                          onChange={() => { }}
                          className="h-3.5 w-3.5 accent-[#576CBC]"
                        />
                        Admins only
                      </label>
                    </div>
                  </div>

                  {/* ✅ DELETE GROUP SECTION */}
                  <div className="rounded-md border border-[#F5D0D0] dark:border-[#5A2A2A] bg-[#FFF8F8] dark:bg-[#3A2525] p-3">
                    <p className="mb-1 text-[13px] font-medium text-[#D14343] dark:text-[#F87171]">
                      Delete Group
                    </p>
                    <p className="mb-3 text-[11px] text-[#8C919C] dark:text-[#B5B5B5]">
                      Once deleted, this group and all its messages will be permanently removed.
                    </p>

                    {!showDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center gap-2 h-9 rounded-md border border-[#D14343] text-[#D14343] px-4 text-[12px] font-semibold hover:bg-[#FDECEC] dark:hover:bg-[#4A2A2A] transition-colors"
                      >
                        {/* Trash icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                        Delete Group
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[12px] font-medium text-[#101B41] dark:text-white">
                          Are you sure you want to delete this group?
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 h-9 rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] text-[#101B41] dark:text-white px-3 text-[12px] font-semibold hover:bg-[#F8F9FC] dark:hover:bg-[#3A3A3A]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteGroup}
                            className="flex-1 h-9 rounded-md bg-[#D14343] hover:bg-[#B93636] text-white px-3 text-[12px] font-semibold"
                          >
                            Yes, Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex-shrink-0 flex justify-end gap-2 sm:gap-3 px-5 py-3 border-t border-[#F0F1F4] dark:border-[#3F3F3F] bg-white dark:bg-[#2c2c2c]">
                  <button
                    onClick={() => setShowGroupDetails(false)}
                    className="flex-1 sm:flex-none h-10 sm:h-9 rounded-md border border-[#576CBC] text-[#576CBC] px-4 sm:px-5 text-[12px] font-semibold hover:bg-[#F2F4FF] dark:hover:bg-[#2A3550]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGroupDetails}
                    className="flex-1 sm:flex-none h-10 sm:h-9 rounded-md bg-[#576CBC] hover:bg-[#4C61AA] text-white px-4 sm:px-5 text-[12px] font-semibold"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseLayout3>
  );
};

export default Message;