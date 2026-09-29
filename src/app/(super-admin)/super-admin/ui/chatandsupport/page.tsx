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
  deliveredAt?: string;
  seenAt?: string;
  replyTo?: {
    _id: string;
    messages: string;
    senderName: string;
  };
  attachment?: {
    name: string;
    size: number;
    type: string;
    url?: string;
  };
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
// File size formatter
// ─────────────────────────────────────────────
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─────────────────────────────────────────────
// Sub: Seen / Delivered dots
// ─────────────────────────────────────────────
const ReceiptDots = ({
  delivered,
  seen,
}: {
  delivered: boolean;
  seen: boolean;
}) => (
  <span className="ml-1 inline-flex items-center gap-[3px]">
    <span
      className={`inline-block h-[6px] w-[6px] rounded-full ${delivered ? "bg-[#9CA3AF]" : "bg-white/40"
        }`}
    />
    <span
      className={`inline-block h-[6px] w-[6px] rounded-full ${seen ? "bg-[#22C55E]" : "bg-white/40"
        }`}
    />
  </span>
);

// ─────────────────────────────────────────────
// Sub: Hover down-arrow menu on a message
// ─────────────────────────────────────────────
const MessageMenu = ({
  onInfo,
  onReply,
}: {
  onInfo: () => void;
  onReply: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-sm hover:bg-white dark:bg-[#2C2C2C]/80 dark:text-gray-300"
        aria-label="Message options"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-30 w-24 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-[#454545] dark:bg-[#2C2C2C]">
          <button
            type="button"
            onClick={() => {
              onInfo();
              setOpen(false);
            }}
            className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]"
          >
            Info
          </button>
          <button
            type="button"
            onClick={() => {
              onReply();
              setOpen(false);
            }}
            className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]"
          >
            Reply
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Sub: Message Info modal (with Read-By list)
// ─────────────────────────────────────────────
const MessageInfoModal = ({
  message,
  onClose,
}: {
  message: IMessage;
  onClose: () => void;
}) => {
  const readers =
    (message as any).readBy ??
    (message.seenAt
      ? [
        {
          _id: "u-1",
          name: "Blackstone Academy",
          plan: "Premium",
          time: message.seenAt,
        },
        {
          _id: "u-2",
          name: "Blackstone Academy",
          plan: "Standard",
          time: message.seenAt,
        },
        {
          _id: "u-3",
          name: "Jeevi Academy",
          plan: "Basic",
          time: message.seenAt,
        },
        {
          _id: "u-4",
          name: "sri_Academy",
          plan: "Premium",
          time: message.seenAt,
        },
        {
          _id: "u-5",
          name: "sabarish v r",
          plan: "Standard",
          time: message.seenAt,
        },
      ]
      : []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] rounded-xl bg-white dark:bg-[#2C2C2C] p-5 shadow-2xl"
      >
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-[14px] font-bold text-[#101B41] dark:text-white">
            Message Info
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-[12px]">
          <div className="rounded-md bg-gray-50 px-3 py-2 dark:bg-[#3A3A3A]">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Message
            </p>
            <p className="mt-1 text-[#101B41] dark:text-white break-words">
              {message.messages || "—"}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Sent</span>
            <span className="text-[#101B41] dark:text-white">
              {message.time}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Read</span>
            <span
              className={
                message.seenAt
                  ? "text-[#101B41] dark:text-white"
                  : "text-gray-400"
              }
            >
              {message.seenAt ?? "Not seen yet"}
            </span>
          </div>

          <div className="pt-1">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Read by
              </p>
              <span className="rounded-full bg-[#E6EAF2] px-2 py-[2px] text-[10px] font-semibold text-[#576CBC] dark:bg-[#3A4570] dark:text-[#A8B7E8]">
                {readers.length}
              </span>
            </div>

            <div className="max-h-[180px] overflow-y-auto rounded-md border border-gray-100 dark:border-[#3A3A3A] bg-white dark:bg-[#343434]">
              {readers.length === 0 ? (
                <p className="px-3 py-4 text-center text-[11px] text-gray-400">
                  No one has read this message yet
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-[#3A3A3A]">
                  {readers.map((r: any) => (
                    <li
                      key={r._id}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#E7E8EC] dark:bg-[#3A3A3A]">
                        <span className="text-[11px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
                          {r.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <span className="flex-1 truncate text-[12px] text-[#101B41] dark:text-white">
                        {r.name}
                      </span>
                      <span className="flex-shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
                        {r.time}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
          deliveredAt: "10:00 AM",
          seenAt: "10:01 AM",
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
          deliveredAt: "10:00 AM",
          seenAt: "10:02 AM",
        },
      ],
    },
  ]);

  // ─────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "groups">(
    "all"
  );
  const [selectedUser, setSelectedUser] = useState<IUser | null>(users[0]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Attachment
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [pendingName, setPendingName] = useState<string>("");
  const [editingName, setEditingName] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);

  const docInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(e.target as Node)
      ) {
        setAttachmentMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
  const [editGroupImagePreview, setEditGroupImagePreview] = useState<
    string | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Message actions
  const [replyTo, setReplyTo] = useState<IMessage | null>(null);
  const [infoMessage, setInfoMessage] = useState<IMessage | null>(null);

  // ─────────────────────────────────────────────
  // Plan tenants pool
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
  // People options (individual users)
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
  // All member options (plan tenants + individuals)
  // ─────────────────────────────────────────────
  const memberOptions = useMemo(() => {
    const fromPlans: { id: string; name: string; plan: string }[] = [];
    Object.entries(PLAN_TENANTS).forEach(([planKey, arr]) => {
      arr.forEach((m, i) => {
        fromPlans.push({
          id: `plan-${planKey}-${i}`,
          name: m.name,
          plan: m.plan,
        });
      });
    });

    const fromUsers: { id: string; name: string; plan: string }[] =
      peopleOptions.map((u) => ({
        id: u._id,
        name: u.userName,
        plan: u.plan ?? addGroupData.plan,
      }));

    const merged = [...fromPlans, ...fromUsers];
    return merged.filter(
      (m, i, arr) =>
        arr.findIndex(
          (x) => x.name === m.name && x.plan === m.plan
        ) === i
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peopleOptions, addGroupData.plan]);

  const selectedMembers = useMemo(
    () =>
      memberOptions.filter((m) =>
        addGroupData.selectedPeople.includes(m.id)
      ),
    [memberOptions, addGroupData.selectedPeople]
  );

  // Auto-check plan members on plan change
  useEffect(() => {
    setAddGroupData((prev) => ({
      ...prev,
      selectedPeople: memberOptions
        .filter((m) => m.plan === prev.plan)
        .map((m) => m.id),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addGroupData.plan, memberOptions.length]);

  // ─────────────────────────────────────────────
  // Filtered users (left chat list)
  // ─────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (activeTab === "all") {
      result = result.filter((u) => !u.role.includes("Group"));
    } else if (activeTab === "unread") {
      result = result.filter((user) => {
        const msgs = allMessages.find((g) => g._id === user._id)?.messages;
        return msgs?.some((m) => !m.isRead);
      });
    } else if (activeTab === "groups") {
      result = result.filter((u) => u.role.includes("Group"));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.userName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.some((r) => r.toLowerCase().includes(q))
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

  useEffect(() => {
    setPendingAttachment(null);
    setPendingName("");
    setEditingName(false);
    setAttachmentMenuOpen(false);
  }, [selectedUser?._id]);

  // Simulated read receipts
  useEffect(() => {
    if (!selectedUser) return;

    const pending = (
      allMessages.find((g) => g._id === selectedUser._id)?.messages ?? []
    ).filter((m) => m.senderId === currentUser.userId && !m.seenAt);

    const timers = pending.map((m) =>
      setTimeout(() => {
        setAllMessages((prev) =>
          prev.map((g) =>
            g._id !== selectedUser._id
              ? g
              : {
                ...g,
                messages: g.messages.map((x) =>
                  x._id === m._id
                    ? {
                      ...x,
                      seenAt: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      isRead: true,
                      notificationStatus: "Seen",
                    }
                    : x
                ),
              }
          )
        );
      }, 3000)
    );

    return () => timers.forEach(clearTimeout);
  }, [allMessages, selectedUser]);

  // ─────────────────────────────────────────────
  // Send message
  // ─────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!selectedUser) return;
    if (!messageText.trim() && !pendingAttachment) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage: IMessage = {
      _id: `msg-${Date.now()}`,
      messages: messageText.trim(),
      senderId: currentUser.userId,
      senderName: currentUser.userName,
      receiverId: selectedUser._id,
      receiverName: selectedUser.userName,
      createdDate: now.toISOString(),
      time: timeStr,
      notificationStatus: "Unseen",
      isRead: false,
      status: "Active",
      deliveredAt: timeStr,
      seenAt: undefined,
      replyTo: replyTo
        ? {
          _id: replyTo._id,
          messages: replyTo.messages,
          senderName: replyTo.senderName,
        }
        : undefined,
      attachment: pendingAttachment
        ? {
          name: pendingName || pendingAttachment.name,
          size: pendingAttachment.size,
          type: pendingAttachment.type,
          url: URL.createObjectURL(pendingAttachment),
        }
        : undefined,
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
    setReplyTo(null);
    setPendingAttachment(null);
    setPendingName("");
    setEditingName(false);
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
  // Group menu actions
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
    }
  };

  const handleClearChat = () => {
    if (!selectedUser) return;
    setAllMessages((prev) =>
      prev.map((g) =>
        g._id === selectedUser._id ? { ...g, messages: [] } : g
      )
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
  // Create Group (from combined member list)
  // ─────────────────────────────────────────────
  const handleCreateGroup = () => {
    const members = memberOptions
      .filter((m) => addGroupData.selectedPeople.includes(m.id))
      .map((m) => ({ name: m.name, plan: m.plan }));

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
        ? {
          ...prev,
          profileImage: editGroupImagePreview ?? prev.profileImage,
        }
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
              </div>
            </div>

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
                          {lastMessage?.messages ||
                            (lastMessage?.attachment
                              ? `📎 ${lastMessage.attachment.name}`
                              : "No messages yet")}
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

                      {selectedUser.role.includes("Group") ? (
                        <p className="text-[10px] text-[#8C919C] dark:text-[#B5B5B5] flex items-center gap-1">
                          Members
                          <span className="rounded bg-[#E6EAF2] px-1.5 py-[1px] text-[9px] font-medium text-[#576CBC] dark:bg-[#3A4570] dark:text-[#A8B7E8]">
                            {selectedUser.members?.length ?? 0}
                          </span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#8C919C] dark:text-[#B5B5B5] truncate">
                          {selectedUser.role[0]}
                        </p>
                      )}
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
                            className={`group flex mb-3 ${isMine ? "justify-end" : "justify-start"
                              }`}
                          >
                            <div className="relative max-w-[240px]">
                              <div
                                className={`px-3 py-2 rounded-lg ${isMine
                                  ? "bg-[#576CBC] text-white rounded-br-sm"
                                  : "bg-[#F0F1F3] dark:bg-[#242424] text-[#252B3A] dark:text-[#E2E2E2] rounded-bl-sm"
                                  }`}
                              >
                                {msg.replyTo && (
                                  <div
                                    className={`mb-1 rounded border-l-2 px-2 py-1 text-[10px] ${isMine
                                      ? "border-white/60 bg-white/10 text-white/90"
                                      : "border-[#576CBC] bg-white/60 text-[#576CBC] dark:bg-[#2A2A2A] dark:text-[#A8B7E8]"
                                      }`}
                                  >
                                    <p className="font-semibold">
                                      {msg.replyTo.senderName}
                                    </p>
                                    <p className="truncate">
                                      {msg.replyTo.messages}
                                    </p>
                                  </div>
                                )}

                                {msg.attachment && (
                                  <div
                                    className={`mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 ${isMine
                                      ? "bg-white/15 text-white"
                                      : "bg-white text-[#252B3A] dark:bg-[#2A2A2A] dark:text-white"
                                      }`}
                                  >
                                    <div
                                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${isMine
                                        ? "bg-white/20"
                                        : "bg-[#E6EAF2] dark:bg-[#3A4570]"
                                        }`}
                                    >
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={isMine ? "#fff" : "#576CBC"}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                      </svg>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-[10px] font-medium">
                                        {msg.attachment.name}
                                      </p>
                                      <p
                                        className={`text-[9px] ${isMine
                                          ? "text-white/70"
                                          : "text-gray-500 dark:text-gray-400"
                                          }`}
                                      >
                                        {formatFileSize(msg.attachment.size)}
                                      </p>
                                    </div>

                                    {msg.attachment.url && (
                                      <a
                                        href={msg.attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download={msg.attachment.name}
                                        className={`flex-shrink-0 text-[10px] underline ${isMine
                                          ? "text-white/80"
                                          : "text-[#576CBC]"
                                          }`}
                                      >
                                        Open
                                      </a>
                                    )}
                                  </div>
                                )}

                                {msg.messages && (
                                  <p className="text-[11px] leading-4 break-words">
                                    {msg.messages}
                                  </p>
                                )}

                                <div
                                  className={`mt-1 flex items-center justify-end text-[7px] ${isMine
                                    ? "text-white/70"
                                    : "text-[#9B9FA8] dark:text-[#8a8a8a]"
                                    }`}
                                >
                                  <span>{msg.time}</span>
                                  {isMine && (
                                    <ReceiptDots
                                      delivered={!!msg.deliveredAt}
                                      seen={!!msg.seenAt}
                                    />
                                  )}
                                </div>

                                <MessageMenu
                                  onInfo={() => setInfoMessage(msg)}
                                  onReply={() => setReplyTo(msg)}
                                />
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
                  {replyTo && (
                    <div className="mb-2 flex items-start justify-between rounded-md border-l-4 border-[#576CBC] bg-[#F0F1F3] dark:bg-[#2c2c2c] px-3 py-2 text-[11px]">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#576CBC] dark:text-[#A8B7E8]">
                          Replying to {replyTo.senderName}
                        </p>
                        <p className="truncate text-[#252B3A] dark:text-[#E2E2E2]">
                          {replyTo.messages || "📎 Attachment"}
                        </p>
                      </div>
                      <button
                        onClick={() => setReplyTo(null)}
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Cancel reply"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {pendingAttachment && (
                    <div className="mb-2 flex items-center gap-2 rounded-md border border-[#E6EAF2] bg-[#F8F9FC] px-2 py-1.5 dark:border-[#4A4A4A] dark:bg-[#2c2c2c]">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#E6EAF2] dark:bg-[#3A4570]">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#576CBC"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>

                      <div className="min-w-0 flex-1">
                        {editingName ? (
                          <input
                            autoFocus
                            type="text"
                            value={pendingName}
                            onChange={(e) => setPendingName(e.target.value)}
                            onBlur={() => setEditingName(false)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setEditingName(false);
                              if (e.key === "Escape") {
                                setPendingName(pendingAttachment.name);
                                setEditingName(false);
                              }
                            }}
                            className="w-full rounded border border-[#576CBC] bg-white px-1 py-[1px] text-[11px] font-medium text-[#252B3A] outline-none dark:bg-[#343434] dark:text-white"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingName(true)}
                            title="Click to rename"
                            className="block max-w-full truncate text-left text-[11px] font-medium text-[#252B3A] hover:text-[#576CBC] dark:text-white dark:hover:text-[#A8B7E8]"
                          >
                            {pendingName || pendingAttachment.name}
                          </button>
                        )}
                        <p className="text-[10px] text-[#8C919C] dark:text-[#8a8a8a]">
                          {formatFileSize(pendingAttachment.size)}
                          {pendingName &&
                            pendingName !== pendingAttachment.name && (
                              <span className="ml-1 text-[#576CBC]">
                                · renamed
                              </span>
                            )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPendingAttachment(null);
                          setPendingName("");
                          setEditingName(false);
                        }}
                        className="ml-1 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Remove attachment"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="h-10 bg-[#F6F7F9] dark:bg-[#2c2c2c] rounded-md flex items-center px-2">
                    <div className="relative" ref={attachmentMenuRef}>
                      <button
                        type="button"
                        onClick={() => setAttachmentMenuOpen((o) => !o)}
                        className="p-2 text-[#8E939D] dark:text-[#B5B5B5] hover:text-[#576CBC]"
                        aria-label="Attach file"
                      >
                        <GrAttachment size={13} />
                      </button>

                      {attachmentMenuOpen && (
                        <div className="absolute bottom-10 left-0 z-40 w-32 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-[#454545] dark:bg-[#2C2C2C]">
                          <button
                            type="button"
                            onClick={() => {
                              setAttachmentMenuOpen(false);
                              docInputRef.current?.click();
                            }}
                            className="block w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]"
                          >
                            Document
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAttachmentMenuOpen(false);
                              fileInputRef.current?.click();
                            }}
                            className="block w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]"
                          >
                            Files
                          </button>
                        </div>
                      )}
                    </div>

                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.odt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (file) {
                          setPendingAttachment(file);
                          setPendingName(file.name);
                        }
                        e.target.value = "";
                      }}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (file) {
                          setPendingAttachment(file);
                          setPendingName(file.name);
                        }
                        e.target.value = "";
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Type a message"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          (messageText.trim() || pendingAttachment)
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
                <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F]">
                  <h2 className="text-[16px] sm:text-[17px] font-semibold text-[#101B41] dark:text-white">
                    Add Group
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
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
                                  setAddGroupData((prev) => ({
                                    ...prev,
                                    plan,
                                  }));
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

                  <div>
                    <div className="mb-2 flex items-center justify-between rounded-t-md border border-b-0 border-[#E6EAF2] dark:border-[#4A4A4A] bg-[#F8F9FC] dark:bg-[#2c2c2c] px-3 py-2">
                      <span className="text-[12px] sm:text-[13px] font-medium text-[#101B41] dark:text-white truncate">
                        Select Members
                      </span>
                      <span className="rounded-md bg-[#E6F0EC] text-[#2F7A5C] px-2 py-0.5 text-[11px] font-semibold flex-shrink-0 ml-2">
                        {String(selectedMembers.length).padStart(2, "0")} selected
                      </span>
                    </div>

                    <div className="max-h-[240px] sm:max-h-[280px] overflow-y-auto rounded-b-md border border-[#E6EAF2] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] p-2 space-y-1">
                      {memberOptions.length === 0 ? (
                        <p className="py-4 text-center text-[11px] text-gray-400">
                          No members available
                        </p>
                      ) : (
                        memberOptions.map((member) => {
                          const c = getPlanColor(member.plan);
                          const isChecked =
                            addGroupData.selectedPeople.includes(member.id);
                          return (
                            <label
                              key={member.id}
                              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[12px] hover:bg-[#F8F9FC] dark:hover:bg-[#3A3A3A]"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  toggleSelectedPerson(member.id)
                                }
                                className="h-3.5 w-3.5 accent-[#576CBC] flex-shrink-0"
                              />
                              <span className="flex-1 truncate text-[#101B41] dark:text-white">
                                {member.name}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-[1px] rounded flex-shrink-0 ${c.bg} ${c.text}`}
                              >
                                {member.plan}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

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
                <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F]">
                  <h2 className="text-[16px] sm:text-[17px] font-semibold text-[#101B41] dark:text-white">
                    Group Details
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="relative self-start">
                      <label className="cursor-pointer block">
                        <div className="w-[66px] h-[66px] rounded-2xl bg-[#E7E8EC] dark:bg-[#3A3A3A] flex items-center justify-center overflow-hidden">
                          {editGroupImagePreview || selectedUser.profileImage ? (
                            <img
                              src={
                                editGroupImagePreview ||
                                selectedUser.profileImage ||
                                ""
                              }
                              alt={selectedUser.userName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[28px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
                              {selectedUser.userName
                                ?.charAt(0)
                                ?.toUpperCase() ?? "G"}
                            </span>
                          )}
                        </div>

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
                            setEditGroupImagePreview(
                              file ? URL.createObjectURL(file) : null
                            );
                          }}
                        />
                      </label>
                    </div>

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

                  {/* ── Group Members ── */}
                  <div className="rounded-md border border-[#E6EAF2] dark:border-[#4A4A4A] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#E6EAF2] dark:border-[#4A4A4A] bg-[#F8F9FC] dark:bg-[#2c2c2c] px-3 py-2">
                      <span className="text-[13px] font-medium text-[#101B41] dark:text-white">
                        Group Members
                      </span>
                      <span className="rounded-md bg-[#E6F0EC] text-[#2F7A5C] px-2 py-0.5 text-[11px] font-semibold">
                        {String(selectedUser.members?.length ?? 0).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto bg-white dark:bg-[#343434] p-2 space-y-1">
                      {(selectedUser.members ?? []).length === 0 ? (
                        <p className="py-4 text-center text-[11px] text-gray-400">
                          No members in this group
                        </p>
                      ) : (
                        (selectedUser.members ?? []).map((member, i) => {
                          const groupId = selectedUser._id;
                          const memberIndex = i;
                          const c = getPlanColor(member.plan);

                          return (
                            <div
                              key={`${member.name}-${i}`}
                              className="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-[#F8F9FC] dark:hover:bg-[#3A3A3A]"
                            >
                              <div className="w-6 h-6 rounded-md bg-[#E7E8EC] dark:bg-[#3A3A3A] flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
                                  {member.name?.charAt(0)?.toUpperCase() ??
                                    "B"}
                                </span>
                              </div>
                              <span className="flex-1 text-[12px] text-[#101B41] dark:text-white truncate">
                                {member.name}
                              </span>
                              <span
                                className={`text-[11px] flex-shrink-0 ${c.text}`}
                              >
                                {member.plan}
                              </span>

                              {/* 🗑 Remove member */}
                              <button
                                type="button"
                                onClick={() => {
                                  setUsers((prev) =>
                                    prev.map((u) =>
                                      u._id === groupId
                                        ? {
                                          ...u,
                                          members: (u.members ?? []).filter(
                                            (_, idx) =>
                                              idx !== memberIndex
                                          ),
                                        }
                                        : u
                                    )
                                  );
                                  setSelectedUser((prev) =>
                                    prev
                                      ? {
                                        ...prev,
                                        members: (prev.members ?? []).filter(
                                          (_, idx) => idx !== memberIndex
                                        ),
                                      }
                                      : prev
                                  );
                                }}
                                className="flex h-6 w-6 items-center justify-center rounded-md text-[#9EA3AE] hover:bg-[#FDECEC] hover:text-[#D14343] dark:hover:bg-[#4A2A2A] flex-shrink-0"
                                title="Remove member"
                                aria-label="Remove member"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-3.5 h-3.5"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                </svg>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* ── Group Settings ── */}
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

                  {/* ── Delete Group ── */}
                  <div className="rounded-md border border-[#F5D0D0] dark:border-[#5A2A2A] bg-[#FFF8F8] dark:bg-[#3A2525] p-3">
                    <p className="mb-1 text-[13px] font-medium text-[#D14343] dark:text-[#F87171]">
                      Delete Group
                    </p>
                    <p className="mb-3 text-[11px] text-[#8C919C] dark:text-[#B5B5B5]">
                      Once deleted, this group and all its messages will be
                      permanently removed.
                    </p>

                    {!showDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center gap-2 h-9 rounded-md border border-[#D14343] text-[#D14343] px-4 text-[12px] font-semibold hover:bg-[#FDECEC] dark:hover:bg-[#4A2A2A] transition-colors"
                      >
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

        {/* ═══════════ MESSAGE INFO MODAL ═══════════ */}
        {infoMessage && (
          <MessageInfoModal
            message={infoMessage}
            onClose={() => setInfoMessage(null)}
          />
        )}
      </div>
    </BaseLayout3>
  );
};

export default Message;