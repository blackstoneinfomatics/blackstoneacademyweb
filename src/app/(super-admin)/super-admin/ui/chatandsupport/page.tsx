"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiClock, FiMoreVertical, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import BaseLayout3 from "../../components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import { ChatMessageComposer } from "./ChatMessageComposer";
import { ChatRoomSearch } from "./ChatRoomSearch";
import { AddGroupModal, type GroupFormData } from "./AddGroupModal";
import { BroadcastModal, type BroadcastData } from "./BroadcastModal";
import { GroupDetailsModal } from "./GroupDetailsModal";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// ─────────────────────────────────────────────
// API Endpoints
// ─────────────────────────────────────────────
const API_BASE = AppApiEndpoints.API_END_POINT;

const API_ACTIVE_PLANS = `${API_BASE}${AppApiEndpoints.CHAT.GET_ACTIVE_PLANS}`;
const API_TENANTS_BY_PLAN = (planId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.GET_TENANTS_BY_PLAN(planId)}`;
const API_CREATE_CHAT_ROOM = `${API_BASE}${AppApiEndpoints.CHAT.ROOM}`;
const API_LIST_CHAT_ROOMS = `${API_BASE}${AppApiEndpoints.CHAT.ROOM}`;

const API_SEND_CHAT_MESSAGE = `${API_BASE}${AppApiEndpoints.CHAT.MESSAGE}`;
const API_CLEAR_CHAT = `${API_BASE}${AppApiEndpoints.CHAT.CLEAR}`;
const API_MARK_CHAT_SEEN = `${API_BASE}${AppApiEndpoints.CHAT.SEEN}`;
const API_MESSAGE_SEEN_USERS = (messageId: string, userId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.MESSAGE_SEEN_USERS(messageId, userId)}`;
const ROOM_MESSAGES_PAGE_LIMIT = 20;
const API_ROOM_MESSAGES = (roomId: string, userId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.ROOM_MESSAGES(roomId, userId, ROOM_MESSAGES_PAGE_LIMIT)}`;

const API_UPDATE_CHAT_ROOM = (roomId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.ROOM_BY_ID(roomId)}`;
 const API_DELETE_MESSAGE_FOR_EVERYONE =(messageId: string , userId :string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.DELETE_MESSAGE_FOR_EVERYONE(messageId, userId)}`;

const ROOMS_PAGE_LIMIT = 100;
const DEFAULT_CREATOR_ID = "6aba4e3ee619505595695943";

// ─────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────
const LS_KEY_REMOVED = "chatRoom.removedTenants.";
const LS_KEY_ROOM_MEMBERS = "chatRoom.allMembers.";
const LS_KEY_CLEARED_AT = "chatRoom.clearedAt.";

const getChatClearedAt = (roomId: string): number | null => {
  if (typeof window === "undefined") return null;
  const value = Number(window.localStorage.getItem(LS_KEY_CLEARED_AT + roomId));
  return Number.isFinite(value) && value > 0 ? value : null;
};

const setChatClearedAt = (roomId: string, timestamp: number) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY_CLEARED_AT + roomId, String(timestamp));
  } catch { }
};

const removeChatClearedAt = (roomId: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LS_KEY_CLEARED_AT + roomId);
  } catch { }
};

const getRemovedTenants = (roomId: string): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY_REMOVED + roomId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setRemovedTenants = (roomId: string, ids: string[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY_REMOVED + roomId, JSON.stringify(ids));
  } catch { }
};

const addRemovedTenant = (roomId: string, tenantId: string) => {
  const current = getRemovedTenants(roomId);
  if (!current.includes(tenantId)) {
    setRemovedTenants(roomId, [...current, tenantId]);
  }
};

const removeFromRemovedTenant = (roomId: string, tenantId: string) => {
  const current = getRemovedTenants(roomId);
  setRemovedTenants(
    roomId,
    current.filter((id) => id !== tenantId)
  );
};

// 🔑 Per-room full member snapshot
interface StoredMember {
  tenantId: string;
  tenantName: string;
}

const getRoomMembersCache = (roomId: string): StoredMember[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY_ROOM_MEMBERS + roomId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setRoomMembersCache = (roomId: string, members: StoredMember[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LS_KEY_ROOM_MEMBERS + roomId,
      JSON.stringify(members)
    );
  } catch { }
};

// Merge new members into the stored snapshot (never lose existing entries)
const mergeIntoRoomMembersCache = (
  roomId: string,
  newMembers: StoredMember[]
) => {
  const current = getRoomMembersCache(roomId);
  const map = new Map(current.map((m) => [m.tenantId, m]));
  newMembers.forEach((m) => {
    if (!map.has(m.tenantId)) {
      map.set(m.tenantId, m);
    }
  });
  // ✅ Array.from for TS compatibility
  setRoomMembersCache(roomId, Array.from(map.values()));
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type RoomType = "TENANT" | "SEGMENT" | "GLOBAL";

interface IMessage {
  _id: string;
  messages: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  createdDate: string;
  dateLabel?: string;
  time: string;
  notificationStatus: "Unseen" | "Seen";
  isRead: boolean;
  status: "Active" | "Inactive";
  deliveredAt?: string;
  isDeleted : boolean;
  seenAt?: string;
  replyTo?: { messageId: string; messages: string; senderName: string; senderId : string; };
  attachment?: { name: string; size: number; type: string; url?: string };
  side?: "left" | "right";
  canReply?: boolean;
}

interface IRoomMessageResponse {
  _id?: string;
  senderId?: string;
  senderName?: string;
  message?: string;
  createdAt?: string;
  timestamp?: string;
  isDeleted?: boolean;
  dateLabel?: string;
  side?: "left" | "right";
  replyTo?: {
    messageId?: string;
    message?: string;
    senderName?: string;
    senderId?: string;
  } | null;
  attachments?: {
    name?: string;
    size?: number;
    type?: string;
    url?: string;
  }[];
}

interface IRoomMessagesResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    messages?: IRoomMessageResponse[];
  };
}

interface IMessageSeenUser {
  userId: string;
  name: string;
  seenAt: string;
}

interface IMessageSeenResponse {
  success?: boolean;
  message?: string;
  data?: {
    totalSeen?: number;
    seenUsers?: IMessageSeenUser[];
  };
}

interface IUser {
  profileImage: string | null;
  _id: string;
  userName: any;
  email: string;
  role: string[];
  status: string;
  lastSeen: string;
  isGroup: boolean;
  roomType: RoomType;
  plan: any;
  members: {
    name: string;
    plan: any;
    tenantId?: string;
    isSelected?: boolean;
  }[];
  groupSettings: "everyone" | "admins";
  lastMessage?: { text: string; time: string; senderName?: string };
  unreadCount: number;
  isUnread: boolean;
  roomId?: string;
  roomCode?: string;
  description?: string;
  planName?: string;
  planId?: string;
  sendAccess?: "EVERYONE" | "ADMIN_ONLY";
}

interface IMessageData {
  _id: string;
  messages: IMessage[];
}

interface IPlan {
  _id: string;
  planName: string;
  status: string;
}

interface IPlanTenant {
  _id: string;
  tenantName?: string;
  name?: string;
  plan?: string;
  planName?: string;
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

const FALLBACK_COLORS = [
  { bg: "bg-[#E6F7EC] dark:bg-[#1F3A2B]", text: "text-[#22C55E] dark:text-[#68D391]", dot: "#22C55E" },
  { bg: "bg-[#E0F2FE] dark:bg-[#22375A]", text: "text-[#3B82F6] dark:text-[#7EB0FF]", dot: "#3B82F6" },
  { bg: "bg-[#F3E8FF] dark:bg-[#3A2F58]", text: "text-[#8B5CF6] dark:text-[#C4A8FF]", dot: "#8B5CF6" },
  { bg: "bg-[#FFF7E8] dark:bg-[#4A3B22]", text: "text-[#F4A429] dark:text-[#FCD68B]", dot: "#F4A429" },
  { bg: "bg-[#FDEAEA] dark:bg-[#4A2A2A]", text: "text-[#E35D5D] dark:text-[#F89B9B]", dot: "#E35D5D" },
  { bg: "bg-[#EAF8EC] dark:bg-[#1F3A2B]", text: "text-[#34A853] dark:text-[#7FD495]", dot: "#34A853" },
];

const hashString = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const getPlanColor = (plan?: string) => {
  if (!plan) {
    return {
      bg: "bg-gray-100 dark:bg-[#3A3A3A]",
      text: "text-gray-600 dark:text-gray-300",
      dot: "#9CA3AF",
    };
  }
  if (PLAN_COLORS[plan]) return PLAN_COLORS[plan];
  const lower = plan.toLowerCase();
  if (lower.includes("premium") || lower.includes("pro") || lower.includes("ultra")) {
    return PLAN_COLORS.Premium;
  }
  if (lower.includes("standard")) return PLAN_COLORS.Standard;
  if (lower.includes("basic")) return PLAN_COLORS.Basic;
  return FALLBACK_COLORS[hashString(plan) % FALLBACK_COLORS.length];
};

// ─────────────────────────────────────────────
// ID helpers
// ─────────────────────────────────────────────
const extractTenantId = (t: any): string => {
  const raw =
    t?._id ??
    t?.tenantId ??
    t?.id ??
    t?.tenant?._id ??
    t?.tenant?.tenantId ??
    t?.tenant?.id ??
    t?.subscription?.tenantId ??
    t?.subscription?.tenant?._id ??
    "";
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && typeof raw.$oid === "string") {
    return raw.$oid;
  }
  return raw ? String(raw) : "";
};

const extractRoomId = (r: any): string => {
  const raw = r?._id ?? r?.roomId ?? r?.chatRoomId ?? r?.id ?? "";
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && typeof raw.$oid === "string") {
    return raw.$oid;
  }
  return raw ? String(raw) : "";
};

const normalizeRoomType = (raw: any): RoomType => {
  const t = String(raw ?? "").toUpperCase();
  if (t === "SEGMENT") return "SEGMENT";
  if (t === "GLOBAL") return "GLOBAL";
  return "TENANT";
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatMessageTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─────────────────────────────────────────────
// Sub-components
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

const MessageMenu = ({
  showInfo,
  showReply,
  showDelete,
  onInfo,
  onReply,
  onDelete,
}: {
  showInfo: boolean;
  showReply: boolean;
  showDelete: boolean;
  onInfo: () => void;
  onReply: () => void;
  onDelete: () => void;
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
          {showInfo && (
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
          )}
          {showReply && (
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
          )}
          {showDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const MessageInfoModal = ({
  message,
  onClose,
}: {
  message: IMessage;
  onClose: () => void;
}) => {
  const [seenUsers, setSeenUsers] = useState<IMessageSeenUser[]>([]);
  const [seenLoading, setSeenLoading] = useState(true);
  const [seenError, setSeenError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("SuperAdminAuthToken");
    const userId = localStorage.getItem("SuperAdminUserId");

    if (!token || !userId) {
      setSeenError("Super-admin authentication data is missing.");
      setSeenLoading(false);
      return;
    }

    const controller = new AbortController();
    setSeenLoading(true);
    setSeenError(null);

    const fetchSeenUsers = async () => {
      try {
        const response = await fetch(
          API_MESSAGE_SEEN_USERS(message._id, userId),
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
            cache: "no-store",
          }
        );
        const result: IMessageSeenResponse = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || `Fetch seen users failed: HTTP ${response.status}`
          );
        }

        setSeenUsers(result.data?.seenUsers ?? []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSeenError(
            error instanceof Error ? error.message : "Could not load seen info."
          );
        }
      } finally {
        if (!controller.signal.aborted) setSeenLoading(false);
      }
    };

    void fetchSeenUsers();
    return () => controller.abort();
  }, [message._id]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-info-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] overflow-hidden rounded-xl border border-[#E7EAF0] bg-white shadow-2xl dark:border-[#42464D] dark:bg-[#262A30]"
      >
        <div className="flex items-center justify-between border-b border-[#ECEEF2] px-5 py-4 dark:border-[#3B4048]">
          <div>
            <h3
              id="message-info-title"
              className="mt-0.5 text-[15px] font-semibold text-[#172033] dark:text-white"
            >
              Message info
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close message info"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#7C8492] transition hover:bg-[#F1F3F6] hover:text-[#172033] dark:hover:bg-[#383D45] dark:hover:text-white"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="max-h-[min(70vh,560px)] space-y-5 overflow-y-auto p-5">
          <section>
            <div className="ml-auto max-w-[88%] rounded-xl rounded-br-sm bg-[#576CBC] px-3.5 py-3 text-white shadow-sm">
              <p className="whitespace-pre-wrap break-words text-[13px] leading-5">
                {message.messages || "Attachment"}
              </p>
              <p className="mt-2 text-right text-[10px] text-white/75">
                {message.time}
              </p>
            </div>
          </section>

          <div className="flex items-center justify-between border-t border-[#ECEEF2] pt-4 text-[12px] dark:border-[#3B4048]">
            <span className="text-[#7C8492]">Sent</span>
            <span className="font-medium text-[#172033] dark:text-[#E7EAF0]">
              {message.time || "—"}
            </span>
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between border-b border-[#ECEEF2] pb-2 dark:border-[#3B4048]">
              <div className="flex items-center gap-2">
                <FiCheck className="text-[#2F8F76]" size={14} />
                <h4 className="text-[12px] font-semibold text-[#172033] dark:text-white">
                  Seen by
                </h4>
              </div>
              {!seenLoading && !seenError && (
                <span className="rounded-full bg-[#E5F3EF] px-2 py-0.5 text-[10px] font-semibold text-[#287A66] dark:bg-[#243D37] dark:text-[#83C8B4]">
                  {seenUsers.length}
                </span>
              )}
            </div>

            {seenLoading ? (
              <div className="flex items-center gap-2 py-2 text-[11px] text-[#7C8492]">
                <FiClock size={13} /> Loading seen details…
              </div>
            ) : seenError ? (
              <p role="alert" className="py-2 text-[11px] text-red-500">
                {seenError}
              </p>
            ) : seenUsers.length === 0 ? (
              <p className="py-2 text-[11px] text-[#9299A5]">Not seen yet</p>
            )
            : (
              <div className="divide-y divide-[#ECEEF2] dark:divide-[#3B4048]">
                {seenUsers.map((user) => {
                  const seenAt = new Date(user.seenAt);
                  const seenTime = Number.isNaN(seenAt.getTime())
                    ? user.seenAt
                    : seenAt.toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                  return (
                    <div
                      key={user.userId}
                      className="flex items-center gap-3 py-2.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E9EEF8] text-[11px] font-semibold text-[#4863A8] dark:bg-[#343D50] dark:text-[#B5C5F1]">
                        {user.name.trim().charAt(0).toUpperCase() || "?"}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#263044] dark:text-[#E7EAF0]">
                        {user.name}
                      </span>
                      {/* <span className="shrink-0 text-[10px] text-[#8992A0]">
                        {seenTime}
                      </span> */}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const Message = () => {
  const currentUser = {
    userId: DEFAULT_CREATOR_ID,
    userName: "Will Jonto",
    role: "Super admin",
  };

  const [allRooms, setAllRooms] = useState<IUser[]>([]);
  const [unreadRooms, setUnreadRooms] = useState<IUser[]>([]);
  const [groupRooms, setGroupRooms] = useState<IUser[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({
  all: 0,
  unread: 0,
  group: 0,
});

  const [allMessages, setAllMessages] = useState<IMessageData[]>([]);

  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "GROUP">(
    "ALL"
  );
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastData, setBroadcastData] = useState<BroadcastData>({
    messageTitle: "Today Updates day",
    message: "",
    attachment: null as File | null,
  });

  const [showGroupMenu, setShowGroupMenu] = useState(false);

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [addGroupData, setAddGroupData] = useState<GroupFormData>({
    groupName: "New Group",
    description: "",
    planId: "",
    planName: "",
    profileImage: null as File | null,
    profilePreview: null as string | null,
    selectedPeople: [] as string[],
  });
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [planTenants, setPlanTenants] = useState<IPlanTenant[]>([]);
  const [planTenantsLoading, setPlanTenantsLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [createGroupError, setCreateGroupError] = useState<string | null>(null);

  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [editGroupImagePreview, setEditGroupImagePreview] = useState<
    string | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [replyTo, setReplyTo] = useState<IMessage | null>(null);
  const [infoMessage, setInfoMessage] = useState<IMessage | null>(null);

  // ─────────────────────────────────────────────
  // Map raw room → IUser
  // ✅ Merges API tenantIds + cached snapshot
  // ─────────────────────────────────────────────
  const mapRoomToUser = (r: any): IUser => {
    const id = extractRoomId(r);
    const roomType = normalizeRoomType(r?.type);
    const isGroup = roomType === "SEGMENT" || roomType === "GLOBAL";
    const clearedAt = getChatClearedAt(id);
    const lastRoomMessageAt = new Date(
      r?.lastMessage?.createdAt ?? r?.lastMessageAt ?? ""
    ).getTime();
    const hasMessageAfterClear =
      clearedAt !== null &&
      Number.isFinite(lastRoomMessageAt) &&
      lastRoomMessageAt > clearedAt;
    const isChatCleared = clearedAt !== null && !hasMessageAfterClear;

    if (hasMessageAfterClear) {
      removeChatClearedAt(id);
    }

    const rawTenantIds: string[] = Array.isArray(r?.tenantIds)
      ? r.tenantIds.filter((x: any) => typeof x === "string" && x.trim())
      : [];

    const removedIds = getRemovedTenants(id);
    const cachedMembers = getRoomMembersCache(id);
    const cacheLookup = new Map(
      cachedMembers.map((m) => [m.tenantId, m.tenantName])
    );

    const rawMembers = Array.isArray(r?.members) ? r.members : [];

    const activeMembers = rawTenantIds.map((tid) => {
      const found = rawMembers.find(
        (m: any) => (m.tenantId || m._id || m.id) === tid
      );
      return {
        name:
          found?.tenantName ||
          found?.name ||
          cacheLookup.get(tid) ||
          r?.memberNames?.[tid] ||
          tid,
        plan: r?.planName ?? "",
        tenantId: tid,
        isSelected: !removedIds.includes(tid),
      };
    });

    // ✅ Merge cached members NOT in API response
    const activeIds = new Set(activeMembers.map((m) => m.tenantId));
    const cachedOnlyMembers = cachedMembers
      .filter((cm) => !activeIds.has(cm.tenantId))
      .map((cm) => ({
        name: cm.tenantName,
        plan: r?.planName ?? "",
        tenantId: cm.tenantId,
        isSelected: false,
      }));

    const members = [...activeMembers, ...cachedOnlyMembers];

    return {
      _id: id || `room-${Math.random().toString(36).slice(2)}`,
      userName: r?.name ?? r?.roomCode ?? "Untitled Room",
      email: "room@example.com",
      role: isGroup ? ["Group"] : ["Tenant"],
      status: r?.isEnabled ? "online" : "offline",
      lastSeen: isChatCleared
        ? ""
        : r?.lastMessageAt
          ? formatMessageTime(r.lastMessageAt)
          : "recently",
      isGroup,
      roomType,
      plan: r?.planName ?? "",
      members,
      groupSettings: r?.sendAccess === "ADMINS" ? "admins" : "everyone",
      lastMessage: !isChatCleared && r?.lastMessage
        ? {
          text: r.lastMessage.message ?? "",
          time: formatMessageTime(
            r.lastMessage.createdAt ?? r.lastMessageAt
          ),
          senderName: r.lastMessage.senderName ?? "",
        }
        : undefined,
      profileImage: null,
      roomId: id,
      roomCode: r?.roomCode ?? "",
      unreadCount: r?.unreadCount ?? 0,
      isUnread:r?.isUnread ?? false,
      description: r?.description ?? "",
      planName: r?.planName ?? "",
      planId: r?.planId ?? "",
      sendAccess:
        r?.sendAccess === "ADMIN_ONLY" || r?.sendAccess === "ADMINS"
          ? "ADMIN_ONLY"
          : "EVERYONE",
    };
  };

  // ─────────────────────────────────────────────
  // Fetch rooms
  // ✅ Saves full member snapshot per room
  // ─────────────────────────────────────────────
const fetchRooms = async () => {
  setRoomsLoading(true);

  try {
    const fetchTab = async (tab: "ALL" | "UNREAD" | "GROUP") => {

      const userId = localStorage.getItem("SuperAdminUserId") || "";
      const tenantId = localStorage.getItem("tenantId") || "";
      const res = await fetch(
        `${API_LIST_CHAT_ROOMS}?page=1&limit=${ROOMS_PAGE_LIMIT}&tab=${tab}&userId=${userId}&tenantId=${tenantId}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error(
          `GET /chat-room?tab=${tab} failed: ${res.status}`,
          errText
        );

        return {
          rooms: [],
          counts: {
            all: 0,
            unread: 0,
            group: 0,
          },
        };
      }

      const json = await res.json();

      const data = json?.data ?? {};

      return {
        rooms: Array.isArray(data?.data) ? data.data : [],
        counts: data?.counts ?? {
          all: 0,
          unread: 0,
          group: 0,
        },
      };
    };

    // Fetch all three tabs
    const [allResponse, unreadResponse, groupResponse] =
      await Promise.all([
        fetchTab("ALL"),
        fetchTab("UNREAD"),
        fetchTab("GROUP"),
      ]);

    // --------------------------------------------------
    // ALL
    // --------------------------------------------------

    const mappedAll = allResponse.rooms
      .map(mapRoomToUser)
      .filter((r:any) => r._id);

    // --------------------------------------------------
    // UNREAD
    // --------------------------------------------------

    const mappedUnread = unreadResponse.rooms
      .map(mapRoomToUser)
      .filter((r:any) => r._id);

    // --------------------------------------------------
    // GROUP
    // --------------------------------------------------

    const mappedGroup = groupResponse.rooms
      .map(mapRoomToUser)
      .filter((r:any) => r._id);

    // --------------------------------------------------
    // Save rooms
    // --------------------------------------------------

    setAllRooms(mappedAll);
    setUnreadRooms(mappedUnread);
    setGroupRooms(mappedGroup);

    // --------------------------------------------------
    // Save unread counts
    // --------------------------------------------------

    const counts = allResponse.counts;

    setUnreadCounts({
      all: counts?.all ?? 0,
      unread: counts?.unread ?? 0,
      group: counts?.group ?? 0,
    });

    // --------------------------------------------------
    // Save member snapshot
    // --------------------------------------------------

    const allRoomResponses = [
      ...allResponse.rooms,
      ...unreadResponse.rooms,
      ...groupResponse.rooms,
    ];

    allRoomResponses.forEach((r: any) => {
      const roomId = extractRoomId(r);

      if (!roomId) return;

      const rawTenantIds: string[] = Array.isArray(r?.tenantIds)
        ? r.tenantIds.filter(
            (x: any) =>
              typeof x === "string" && x.trim()
          )
        : [];

      if (rawTenantIds.length === 0) return;

      const rawMembers = Array.isArray(r?.members)
        ? r.members
        : [];

      const snapshot: StoredMember[] = rawTenantIds.map(
        (tid) => {
          const found = rawMembers.find(
            (m: any) =>
              (m.tenantId || m._id || m.id) === tid
          );

          return {
            tenantId: tid,
            tenantName:
              found?.tenantName ||
              found?.name ||
              tid,
          };
        }
      );

      mergeIntoRoomMembersCache(roomId, snapshot);
    });
  } catch (err) {
    console.error("❌ fetchRooms failed:", err);

    setAllRooms([]);
    setUnreadRooms([]);
    setGroupRooms([]);

    setUnreadCounts({
      all: 0,
      unread: 0,
      group: 0,
    });
  } finally {
    setRoomsLoading(false);
  }
};

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // const tabCounts = useMemo(
  //   () => ({
  //     all: allRooms.length,
  //     unread: unreadRooms.length,
  //     groups: groupRooms.length,
  //   }),
  //   [allRooms, unreadRooms, groupRooms]
  // );

  const visibleRooms = useMemo(() => {
    const source: IUser[] =
      activeTab === "ALL"
        ? allRooms
        : activeTab === "UNREAD"
          ? unreadRooms
          : groupRooms;

    let result = [...source];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.plan?.toLowerCase().includes(q) ||
          r.members?.some((m: any) => m.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeTab, allRooms, unreadRooms, groupRooms, searchQuery]);

  const toggleSelectedPerson = (id: string) => {
    if (!id || typeof id !== "string") return;
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

  // Fetch plans when AddGroup opens
  useEffect(() => {
    if (!showAddGroup) return;
    let cancelled = false;

    (async () => {
      setPlansLoading(true);
      try {
        const res = await fetch(API_ACTIVE_PLANS, { cache: "no-store" });
        const json = await res.json();

        if (!cancelled && json?.success && Array.isArray(json.data)) {
          const list: IPlan[] = json.data
            .map((p: any) => ({
              _id: p?._id ?? p?.id ?? "",
              planName: p?.planName ?? p?.name ?? "",
              status: p?.status ?? "Active",
            }))
            .filter((p: IPlan) => p._id && p.planName);

          setPlans(list);

          if (list.length > 0) {
            const first = list[0];
            setAddGroupData((prev) => ({
              ...prev,
              planId: first._id,
              planName: first.planName,
              selectedPeople: [],
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showAddGroup]);

  // Fetch tenants when AddGroup opens
  useEffect(() => {
    if (!showAddGroup) return;
    if (!addGroupData.planId) {
      setPlanTenants([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setPlanTenantsLoading(true);
      try {
        const res = await fetch(API_TENANTS_BY_PLAN(addGroupData.planId), {
          cache: "no-store",
        });
        const json = await res.json();

        const rawList: any[] = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.data?.tenants)
            ? json.data.tenants
            : Array.isArray(json?.tenants)
              ? json.tenants
              : [];

        const normalized: IPlanTenant[] = rawList
          .map((t: any) => ({
            _id: extractTenantId(t),
            tenantName: t?.tenantName ?? t?.name ?? "Unnamed Tenant",
            plan: t?.plan ?? t?.planName ?? addGroupData.planName,
            planName: t?.planName ?? t?.plan,
          }))
          .filter((t) => t._id && t._id.trim().length > 0);

        if (!cancelled) {
          setPlanTenants(normalized);
          setAddGroupData((prev) => ({
            ...prev,
            selectedPeople: normalized.map((t) => t._id),
          }));
        }
      } catch (err) {
        console.error("Failed to fetch plan tenants:", err);
      } finally {
        if (!cancelled) setPlanTenantsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showAddGroup, addGroupData.planId]);

  // ✅ Fetch tenants when Group Details opens AND save snapshot
  useEffect(() => {
    if (!showGroupDetails || !selectedUser) return;

    const planId = selectedUser.planId;
    if (!planId) {
      console.warn("No planId on selectedUser — cannot fetch tenants");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(API_TENANTS_BY_PLAN(planId), {
          cache: "no-store",
        });
        const json = await res.json();

        const rawList: any[] = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.data?.tenants)
            ? json.data.tenants
            : Array.isArray(json?.tenants)
              ? json.tenants
              : [];

        const normalized: IPlanTenant[] = rawList
          .map((t: any) => ({
            _id: extractTenantId(t),
            tenantName: t?.tenantName ?? t?.name ?? "Unnamed Tenant",
            plan: t?.plan ?? t?.planName ?? "",
            planName: t?.planName ?? t?.plan,
          }))
          .filter((t) => t._id && t._id.trim().length > 0);

        if (cancelled) return;

        setPlanTenants(normalized);

        // 🔑 Save plan tenants snapshot for this room
        const roomId = selectedUser.roomId || selectedUser._id;
        mergeIntoRoomMembersCache(
          roomId,
          normalized.map((t) => ({
            tenantId: t._id,
            tenantName: t.tenantName || t.name || "Unnamed Tenant",
          }))
        );

        // Merge missing members into selectedUser
        setSelectedUser((prev) => {
          if (!prev) return prev;
          const existingIds = new Set(
            (prev.members ?? []).map((m: any) => m.tenantId)
          );
          const missingFromPlan = normalized
            .filter((t) => !existingIds.has(t._id))
            .map((t) => ({
              name: t.tenantName || t.name || "Unnamed Tenant",
              plan: prev.planName ?? "",
              tenantId: t._id,
              isSelected: false,
            }));
          if (missingFromPlan.length === 0) return prev;
          return {
            ...prev,
            members: [...(prev.members ?? []), ...missingFromPlan],
          };
        });
      } catch (err) {
        console.error("Failed to fetch plan tenants for modal:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showGroupDetails, selectedUser]);

  const memberOptions = useMemo(
    () =>
      planTenants.map((t) => ({
        id: t._id,
        name: t.tenantName || t.name || "Unnamed Tenant",
        plan: t.plan || t.planName || addGroupData.planName,
      })),
    [planTenants, addGroupData.planName]
  );

  const selectedMessages = useMemo(() => {
    if (!selectedUser) return [];
    return allMessages.find((g) => g._id === selectedUser._id)?.messages || [];
  }, [selectedUser, allMessages]);

  useEffect(() => {
    if (!selectedUser) return;

    const token = localStorage.getItem("SuperAdminAuthToken");
    const userId = localStorage.getItem("SuperAdminUserId");
    if (!token || !userId) {
      console.error("Super-admin authentication data is missing");
      return;
    }

    const controller = new AbortController();
    setMessagesLoading(true);

    const fetchRoomMessages = async () => {
      try {
        const response = await fetch(
          API_ROOM_MESSAGES(selectedUser._id, userId),
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
            cache: "no-store",
          }
        );
        const result: IRoomMessagesResponse = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || `Fetch messages failed: HTTP ${response.status}`
          );
        }

        const messages = (result.data?.messages ?? []).map(
          (message, index): IMessage => {
            const createdDate =
              message.timestamp ?? message.createdAt ?? new Date().toISOString();
            const date = new Date(createdDate);
            const attachment = message.attachments?.[0];

            return {
              _id: message._id ?? `${selectedUser._id}-${index}`,
              messages: message.message ?? "",
              senderId: message.senderId ?? "",
              senderName: message.senderName ?? "",
              receiverId: selectedUser._id,
              receiverName: selectedUser.userName,
              createdDate,
              dateLabel: message.dateLabel,
              time: Number.isNaN(date.getTime())
                ? ""
                : date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              notificationStatus: "Unseen",
              isRead: false,
              status: "Active",
              isDeleted: message.isDeleted ?? false,
              side: message.side,
              replyTo: message.replyTo
                ? {
                    messageId: message.replyTo.messageId ?? "",
                    messages: message.replyTo.message ?? "",
                    senderName: message.replyTo.senderName ?? "",
                    senderId: message.replyTo.senderId ?? "",
                  }
                : undefined,
              attachment: attachment
                ? {
                    name: attachment.name ?? "Attachment",
                    size: attachment.size ?? 0,
                    type: attachment.type ?? "application/octet-stream",
                    url: attachment.url,
                  }
                : undefined,
            };
          }
        );

        const lastMessageId = messages[messages.length - 1]?._id;
        if (lastMessageId) {
          void fetch(API_MARK_CHAT_SEEN, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              roomId: selectedUser._id,
              userId,
              messageId: lastMessageId,
            }),
            signal: controller.signal,
          })
            .then(async (seenResponse) => {
              const seenResult = await seenResponse.json().catch(() => null);
              if (!seenResponse.ok || seenResult?.success === false) {
                throw new Error(
                  seenResult?.message ||
                    `Mark message as seen failed: HTTP ${seenResponse.status}`
                );
              }
            })
            .catch((error) => {
              if (!controller.signal.aborted) {
                console.error("Failed to mark room message as seen:", error);
              }
            });
        }

        setAllMessages((previous) => [
          ...previous.filter((group) => group._id !== selectedUser._id),
          { _id: selectedUser._id, messages },
        ]);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch room messages:", error);
        }
      } finally {
        if (!controller.signal.aborted) setMessagesLoading(false);
      }
    };

    void fetchRoomMessages();
    return () => controller.abort();
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages]);


  
  const handleSendMessage = async (
    text: string,
    pendingAttachment: File | null,
    pendingName: string
  ): Promise<string | null> => {
    if (!selectedUser) return Promise.resolve("Select a tenant or group before sending.");
    if (!text.trim()) return Promise.resolve("Enter a message before sending.");

    const token = localStorage.getItem("SuperAdminAuthToken");
    const senderId = localStorage.getItem("SuperAdminUserId") ?? "";
    const senderName =
      localStorage.getItem("SuperAdminPortalName") || currentUser.userName;

    // if (!token || !senderId) {
    //   const errorMessage = !token
    //     ? "Your session is missing or expired. Sign in again."
    //     : "Your account is missing the room membership user ID. Sign in again or ask the backend to include userId in the login response.";
    //   console.error(errorMessage);
    //   return errorMessage;
    // }

    const payload = {
      roomId: selectedUser._id,
      senderId,
      senderName,
      senderRole: "SUPERADMIN",
      messageType: "TEXT",
      message: text.trim(),
      ...(replyTo
        ? {
            replyTo: {
              messageId: replyTo._id,
              message: replyTo.messages,
              senderId: replyTo.senderId,
              senderName: replyTo.senderName,
            },
          }
        : {}),
    };

      let createdMessageId: string | undefined;

    try {
      console.log("[chat/message] request", {
        url: API_SEND_CHAT_MESSAGE,
        roomId: payload.roomId,
        senderId: payload.senderId,
        senderIdLength: payload.senderId.length,
        senderRole: payload.senderRole,
        messageType: payload.messageType,
        replyToMessageId: replyTo?._id ?? null,
        replyToSenderId: replyTo?.senderId ?? null,
      });

      const response = await fetch(API_SEND_CHAT_MESSAGE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      console.log("[chat/message] response", {
        status: response.status,
        success: result?.success,
        message: result?.message,
        errorCode: result?.errorCode,
      });

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || `Send message failed: HTTP ${response.status}`
        );
      }

      const messageIdCandidates: unknown[] = [
        result?.data?.message?._id,
        result?.data?.messageId,
        result?.data?._id,
        result?.message?._id,
        result?.messageId,
        result?._id,
      ];
      createdMessageId = messageIdCandidates.find(
        (value): value is string =>
          typeof value === "string" && /^[a-f\d]{24}$/i.test(value)
      );

      if (!createdMessageId) {
        try {
          const messagesResponse = await fetch(
            API_ROOM_MESSAGES(selectedUser._id, senderId),
            {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            }
          );
          const messagesResult: IRoomMessagesResponse =
            await messagesResponse.json();
          const matchingMessages = (messagesResult.data?.messages ?? []).filter(
            (message) =>
              message.senderId === senderId && message.message === text.trim()
          );
          const persistedMessage = matchingMessages[matchingMessages.length - 1];
          if (
            typeof persistedMessage?._id === "string" &&
            /^[a-f\d]{24}$/i.test(persistedMessage._id)
          ) {
            createdMessageId = persistedMessage._id;
          }
        } catch (error) {
          console.error("Could not resolve persisted message ID:", error);
        }
      }
    } catch (error) {
      console.error("Send message failed:", error);
      return error instanceof Error ? error.message : "Message could not be sent.";
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage: IMessage = {
      _id: createdMessageId ?? `local-${Date.now()}`,
      messages: text.trim(),
      senderId,
      senderName,
      receiverId: selectedUser._id,
      receiverName: selectedUser.userName,
      createdDate: now.toISOString(),
      time: timeStr,
      notificationStatus: "Unseen",
      isRead: false,
      status: "Active",
      deliveredAt: timeStr,
      isDeleted: false,
      side: "right",
      canReply: Boolean(createdMessageId),
      replyTo: replyTo
        ? {
          messageId : replyTo._id,
          messages: replyTo.messages,
          senderName: replyTo.senderName,
          senderId: replyTo.senderId,
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
          g._id === selectedUser._id ? { ...g, messages: [...g.messages, newMessage] }
            : g
        );
      }
      return [...prev, { _id: selectedUser._id, messages: [newMessage] }];
    });

    setMessageText("");
    setReplyTo(null);
    return null;
  };

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

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const groupedMessages = selectedMessages.reduce((acc, message) => {
    const date = message.dateLabel || formatDate(message.createdDate);
    if (!acc[date]) acc[date] = [];
    acc[date].push(message);
    return acc;
  }, {} as Record<string, IMessage[]>);

  const handleOpenGroupDetails = () => {
    setShowGroupMenu(false);
    setEditGroupImagePreview(selectedUser?.profileImage ?? null);
    setShowGroupDetails(true);
  };

  const handleDeleteGroup = async () => {
    if (!selectedUser) return;
    const deletedId = selectedUser._id;
    const roomId = selectedUser.roomId || deletedId;
    const token = localStorage.getItem("SuperAdminAuthToken");

    try {
      const response = await fetch(API_UPDATE_CHAT_ROOM(roomId), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ deletedBy: "SUPERADMIN" }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || `Delete group failed: HTTP ${response.status}`
        );
      }
    } catch (error) {
      console.error("Delete group failed:", error);
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LS_KEY_REMOVED + roomId);
      window.localStorage.removeItem(LS_KEY_ROOM_MEMBERS + roomId);
    }
    removeChatClearedAt(roomId);

    setAllRooms((prev) => prev.filter((u) => u._id !== deletedId));
    setGroupRooms((prev) => prev.filter((u) => u._id !== deletedId));
    setUnreadRooms((prev) => prev.filter((u) => u._id !== deletedId));
    setAllMessages((prev) => prev.filter((g) => g._id !== deletedId));
    setSelectedUser((prev) => (prev?._id === deletedId ? null : prev));

    setShowDeleteConfirm(false);
    setShowGroupDetails(false);
    setShowGroupMenu(false);
    setEditGroupImagePreview(null);
  };

  const handleClearChat = async () => {
    if (!selectedUser) return;

    const token = localStorage.getItem("SuperAdminAuthToken");
    const userId = localStorage.getItem("SuperAdminUserId");
    if (!token || !userId) {
      console.error("Super-admin authentication data is missing");
      return;
    }

    const roomId = selectedUser.roomId || selectedUser._id;

    try {
      const response = await fetch(API_CLEAR_CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId, userId }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || `Clear chat failed: HTTP ${response.status}`
        );
      }

      const serverClearedAt = Date.parse(result?.data?.clearedAt ?? "");
      setChatClearedAt(
        roomId,
        Number.isFinite(serverClearedAt) ? serverClearedAt : Date.now()
      );
    } catch (error) {
      console.error("Clear chat failed:", error);
      return;
    }

    setAllMessages((prev) =>
      prev.map((g) =>
        g._id === selectedUser._id ? { ...g, messages: [] } : g
      )
    );

    const clearRoomPreview = (rooms: IUser[]) =>
      rooms.map((room) =>
        room._id === selectedUser._id ||
        room._id === roomId ||
        room.roomId === roomId
          ? { ...room, lastMessage: { text: "", time: "" }, lastSeen: "" }
          : room
      );

    setAllRooms(clearRoomPreview);
    setGroupRooms(clearRoomPreview);
    setUnreadRooms(clearRoomPreview);
    setShowGroupMenu(false);
  };

  const handleDeleteChat = () => {
    if (!selectedUser) return;
    setAllMessages((prev) => prev.filter((g) => g._id !== selectedUser._id));
    setShowGroupMenu(false);
    setSelectedUser(null);
  };

 const handleDeleteMessage = async (
  messageId: string
) => {
  try {
    const userId = localStorage.getItem("SuperAdminUserId") || "";
    const res = await fetch(
      `${API_DELETE_MESSAGE_FOR_EVERYONE(messageId, userId)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const json = await res.json();

    if (!res.ok) {
      throw new Error(
        json?.message || "Failed to delete message"
      );
    }

    return json;
  } catch (error: any) {
    console.error(
      "deleteMessageForEveryone failed:",
      error
    );

    throw error;
  }
};

  const handleCreateGroup = async () => {
    if (!addGroupData.groupName.trim()) {
      setCreateGroupError("Group name is required");
      return;
    }
    if (!addGroupData.planId) {
      setCreateGroupError("Please select a plan");
      return;
    }

    const participants = (addGroupData.selectedPeople || []).filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0
    );

    if (participants.length === 0) {
      setCreateGroupError("No valid members selected.");
      return;
    }

    setCreateGroupError(null);
    setIsCreatingGroup(true);

    try {
      const safeStr = (v: unknown, fallback = ""): string =>
        typeof v === "string" && v.trim() ? v : fallback;

      const groupNameSafe = safeStr(addGroupData.groupName, "Untitled Group");
      const planNameSafe = safeStr(addGroupData.planName, "Default");
      const descriptionSafe = safeStr(addGroupData.description, " ");

      const payload = {
        name: groupNameSafe,
        title: groupNameSafe,
        roomName: groupNameSafe,
        groupName: groupNameSafe,
        description: descriptionSafe,
        type: "SEGMENT",
        roomType: "SEGMENT",
        planId: addGroupData.planId,
        planName: planNameSafe,
        participants,
        tenantIds: participants,
        memberIds: participants,
        createdBy: currentUser.userName,
        creatorId: currentUser.userId,
        adminId: currentUser.userId,
        sendAccess: "EVERYONE",
        settings: "everyone",
        status: "ACTIVE",
      };

      const res = await fetch(API_CREATE_CHAT_ROOM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("POST /chat-room →", res.status, text);

      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch { }

      if (!res.ok || json?.success === false) {
        const serverMsg =
          json?.message ||
          json?.error ||
          (json?.errors ? JSON.stringify(json.errors) : "") ||
          text ||
          `HTTP ${res.status}`;
        throw new Error(serverMsg);
      }

      setShowAddGroup(false);
      setAddGroupData({
        groupName: "New Group",
        description: "",
        planId: "",
        planName: "",
        profileImage: null,
        profilePreview: null,
        selectedPeople: [],
      });
      setPlanTenants([]);
      setPlans([]);

      setTimeout(() => {
        fetchRooms();
      }, 500);
    } catch (err: any) {
      console.error("Create group failed:", err);
      setCreateGroupError(err?.message || "Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleSaveGroupDetails = () => {
    if (!selectedUser) return;
    setAllRooms((prev) =>
      prev.map((u) =>
        u._id === selectedUser._id
          ? { ...u, profileImage: editGroupImagePreview ?? u.profileImage }
          : u
      )
    );
    setGroupRooms((prev) =>
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

  return (
    <BaseLayout3>
      <SuperAdminHeader currentSection="Chats" />
      <div className="min-h-screen rounded-2xl bg-[#F5F7FC] dark:bg-[#1F1F1F] p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[16px] font-semibold text-[#010E30] dark:text-white">
            Institute Chats
          </h1>
          <button
            className="bg-[#576CBC] hover:bg-[#4c61aa] text-white text-[13px] font-medium px-4 py-2 rounded-md"
            onClick={() => setShowBroadcast(true)}
          >
            Broadcast Chat
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:h-[calc(100vh-105px)]">
          {/* LEFT PANEL */}
          <div className="w-full md:w-[350px] md:flex-shrink-0 bg-white dark:bg-[#343434] rounded-lg shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] flex flex-col">
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

            <ChatRoomSearch
              query={searchQuery}
              onQueryChange={setSearchQuery}
            />

            <div className="flex items-center px-3 mt-3 border-b border-[#EEEEEE] dark:border-[#3F3F3F] gap-2">
              {(
                [
                  { key: "ALL", label: "All", count: unreadCounts.all },
                  { key: "UNREAD", label: "Unread", count: unreadCounts.unread },
                  { key: "GROUP", label: "Groups", count: unreadCounts.group },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-[12px] px-3 py-2 capitalize transition flex items-center gap-1 ${activeTab === tab.key
                    ? "text-[#576CBC] border-b-2 border-[#576CBC] font-medium"
                    : "text-[#6D7280] dark:text-[#B5B5B5]"
                    }`}
                >
                  {tab.label}
                  <span
                    className={`text-[10px] px-1.5 py-[1px] rounded-full ${activeTab === tab.key
                      ? "bg-[#E6EAF2] text-[#576CBC]"
                      : "bg-gray-100 dark:bg-[#2c2c2c] text-gray-500"
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] md:max-h-none">
              {roomsLoading ? (
                <p className="py-6 text-center text-[11px] text-gray-400">
                  Loading chats…
                </p>
              ) : visibleRooms.length === 0 ? (
                <p className="py-6 text-center text-[11px] text-gray-400">
                  {activeTab === "GROUP"
                    ? "No groups yet — create one"
                    : activeTab === "UNREAD"
                      ? "No unread chats"
                      : "No chats"}
                </p>
              ) : (
                <AnimatePresence>
                  {visibleRooms.map((room) => {
                    const planColor = getPlanColor(room.plan);

                    return (
                     <motion.button
  key={room._id}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className={`w-full flex items-center gap-2 px-3 py-2 border-b border-[#F0F1F4] dark:border-[#3F3F3F] text-left transition-colors
    ${
      selectedUser?._id === room._id
        ? "bg-[#F4F6FB] dark:bg-[#2c2c2c]"
        : room.isUnread
          ? "bg-[#FAFBFF] dark:bg-[#292929] hover:bg-[#F4F6FF] dark:hover:bg-[#303030]"
          : "hover:bg-[#F7F8FC] dark:hover:bg-[#2F2F2F]"
    }`}
  onClick={() => setSelectedUser(room)}
>
  <div className="relative flex-shrink-0">
    <div
      className={`w-8 h-8 rounded-md flex items-center justify-center overflow-hidden
        ${
          room.isUnread
            ? "bg-[#E1E7FF] dark:bg-[#343A55]"
            : "bg-[#E7E8EC] dark:bg-[#242424]"
        }`}
    >
      {room.profileImage ? (
        <img
          src={room.profileImage}
          alt={room.userName}
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          className={`text-[12px] font-medium ${
            room.isUnread
              ? "text-[#4F46E5]"
              : "text-[#9297A2] dark:text-[#B5B5B5]"
          }`}
        >
          {room.userName?.charAt(0)?.toUpperCase() ?? "B"}
        </span>
      )}
    </div>

    <span
      className={`absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-white dark:border-[#343434] ${getStatusColor(
        room.status
      )}`}
    />
  </div>

  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-1">
      <span
        className={`text-[12px] truncate ${
          room.isUnread
            ? "font-bold text-[#171B26] dark:text-white"
            : "font-semibold text-[#252B3A] dark:text-white"
        }`}
      >
        {room.userName}
      </span>

      {room.plan && (
        <span
          className={`text-[10px] px-1.5 py-[1px] rounded flex-shrink-0 ${planColor.bg} ${planColor.text}`}
        >
          {room.plan}
        </span>
      )}
    </div>

    <p
      className={`text-[12px] truncate mt-[2px] ${
        room.isUnread
          ? "text-[#555D70] dark:text-[#C5C7CE] font-medium"
          : "text-[#989DA8] dark:text-[#8a8a8a]"
      }`}
    >
      {room.lastMessage?.text || "No messages yet"}
    </p>
  </div>

  {/* Right side */}
  <div className="flex flex-col items-end gap-1 flex-shrink-0">
    <span
      className={`text-[10px] ${
        room.isUnread
          ? "text-[#4F46E5] dark:text-[#8B93FF] font-semibold"
          : "text-[#A2A6AF] dark:text-[#8a8a8a]"
      }`}
    >
      {room.lastMessage?.time || room.lastSeen}
    </span>

    {/* Unread count */}
    {room.isUnread && (room.unreadCount ?? 0) > 0 && (
      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#4F46E5] text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
        {room.unreadCount > 99 ? "99+" : room.unreadCount}
      </span>
    )}
  </div>
</motion.button>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* RIGHT CHAT PANEL */}
          <div className="flex-1 bg-white dark:bg-[#343434] rounded-lg shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] flex flex-col min-w-0 min-h-[500px] md:min-h-0">
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
                            {selectedUser.members?.filter(
                              (m: any) => m.isSelected !== false
                            ).length ?? 0}
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
                      <div className="absolute right-0 top-10 z-40 w-[100px] bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        {(selectedUser.isGroup ||
                          selectedUser.role.includes("Group")) && (
                          <button
                            className="block w-full text-left px-2 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                            onClick={handleOpenGroupDetails}
                          >
                            Group Details
                          </button>
                        )}
                        <button
                          className="block w-full text-left px-2 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                          onClick={handleClearChat}
                        >
                          Clear chat
                        </button>
                        {(selectedUser.isGroup ||
                          selectedUser.role.includes("Group")) && (
                          <button
                            className="block w-full text-left px-2 py-2 text-[12px] text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]"
                            onClick={handleDeleteChat}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 bg-[#FBFBFB] dark:bg-[#2c2c2c]">
                  {messagesLoading ? (
                    <p className="py-6 text-center text-[11px] text-gray-400">
                      Loading messages…
                    </p>
                  ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="text-center mb-4">
                        <span className="text-[10px] text-[#A3A7B0] dark:text-[#8a8a8a]">
                          {date}
                        </span>
                      </div>
                      {msgs.map((msg) => {
                        const isMine = msg.side
                          ? msg.side === "right"
                          : msg.senderId === currentUser.userId;
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
                                {!msg.isDeleted && (
                                <MessageMenu
                                  showInfo={isMine}
                                  showReply={
                                    msg.canReply !== false &&
                                    /^[a-f\d]{24}$/i.test(msg._id)
                                  }
                                  showDelete={isMine}
                                  onInfo={() => setInfoMessage(msg)}
                                  onReply={() => setReplyTo(msg)}
                                  onDelete={() => handleDeleteMessage(msg._id)}
                                />
                      )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <ChatMessageComposer
                  roomId={selectedUser._id}
                  messageText={messageText}
                  replyTo={replyTo}
                  onMessageTextChange={setMessageText}
                  onClearReply={() => setReplyTo(null)}
                  onSendMessage={handleSendMessage}
                  formatFileSize={formatFileSize}
                />
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

        <AnimatePresence>
          {showBroadcast && (
            <BroadcastModal
              key="broadcast-modal"
              data={broadcastData}
              onChange={(field, value) =>
                setBroadcastData((previous) => ({ ...previous, [field]: value }))
              }
              onClose={() => setShowBroadcast(false)}
              onSend={() => setShowBroadcast(false)}
            />
          )}

          {showAddGroup && (
            <AddGroupModal
              key="add-group-modal"
              data={addGroupData}
              plans={plans}
              plansLoading={plansLoading}
              members={memberOptions}
              membersLoading={planTenantsLoading}
              error={createGroupError}
              isCreating={isCreatingGroup}
              getPlanColor={getPlanColor}
              onChange={(updates) =>
                setAddGroupData((previous) => ({ ...previous, ...updates }))
              }
              onToggleMember={toggleSelectedPerson}
              onClose={() => setShowAddGroup(false)}
              onCreate={handleCreateGroup}
            />
          )}

          {showGroupDetails && selectedUser && (
            <GroupDetailsModal
              key="group-details-modal"
              data={{
                roomId: selectedUser.roomId || selectedUser._id,
                roomCode: selectedUser.roomCode || "",
                groupName: selectedUser.userName || "",
                role: Array.isArray(selectedUser.role)
                  ? selectedUser.role[0] || "SUPERADMIN"
                  : selectedUser.role,
                description: selectedUser.description || "",
                planName:
                  selectedUser.planName ||
                  (typeof selectedUser.plan === "string"
                    ? selectedUser.plan
                    : selectedUser.plan?.name) ||
                  "Basic Plan",
                sendAccess:
                  (selectedUser.sendAccess as "EVERYONE" | "ADMIN_ONLY") ||
                  (selectedUser.groupSettings === "admins"
                    ? "ADMIN_ONLY"
                    : "EVERYONE"),
                members: (selectedUser.members || []).map(
                  (m: any, idx: number) => ({
                    tenantId: m.tenantId || `temp-${idx}`,
                    tenantName: m.name || m.tenantName || "Unknown",
                    isSelected:
                      m.isSelected !== undefined ? m.isSelected : true,
                  })
                ),
                memberCount: (selectedUser.members || []).filter(
                  (m: any) => m.isSelected !== false
                ).length,
              }}
              imagePreview={editGroupImagePreview}
              showDeleteConfirm={showDeleteConfirm}
              availableTenants={planTenants.map((t) => ({
                tenantId: t._id,
                tenantName: t.tenantName || t.name || "Unnamed Tenant",
              }))}
              onImageChange={(file) =>
                setEditGroupImagePreview(
                  file ? URL.createObjectURL(file) : null
                )
              }
              onUpdateMembers={(payload) => {
                const roomId = selectedUser.roomId || selectedUser._id;

                if (payload.removeTenantIds) {
                  payload.removeTenantIds.forEach((id) =>
                    addRemovedTenant(roomId, id)
                  );
                }
                if (payload.addTenantIds) {
                  payload.addTenantIds.forEach((id) =>
                    removeFromRemovedTenant(roomId, id)
                  );
                }

                fetch(API_UPDATE_CHAT_ROOM(roomId), {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                }).catch((err) =>
                  console.error("Update members API failed:", err)
                );

                setSelectedUser((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    members: (prev.members ?? []).map((m: any) => {
                      if (payload.removeTenantIds?.includes(m.tenantId)) {
                        return { ...m, isSelected: false };
                      }
                      if (payload.addTenantIds?.includes(m.tenantId)) {
                        return { ...m, isSelected: true };
                      }
                      return m;
                    }),
                  };
                });

                const updateRoomInList = (list: IUser[]) =>
                  list.map((r) =>
                    r._id === roomId
                      ? {
                        ...r,
                        members: (r.members ?? []).map((m: any) => {
                          if (
                            payload.removeTenantIds?.includes(m.tenantId)
                          ) {
                            return { ...m, isSelected: false };
                          }
                          if (
                            payload.addTenantIds?.includes(m.tenantId)
                          ) {
                            return { ...m, isSelected: true };
                          }
                          return m;
                        }),
                      }
                      : r
                  );

                setAllRooms(updateRoomInList);
                setGroupRooms(updateRoomInList);
                setUnreadRooms(updateRoomInList);
              }}
              onAddMembers={(newMembers) => {
                const roomId = selectedUser.roomId || selectedUser._id;

                newMembers.forEach((nm) =>
                  removeFromRemovedTenant(roomId, nm.tenantId)
                );

                // 🔑 Save new members to snapshot too
                mergeIntoRoomMembersCache(roomId, newMembers);

                setSelectedUser((prev) => {
                  if (!prev) return prev;
                  const existingIds = new Set(
                    (prev.members ?? []).map((m: any) => m.tenantId)
                  );
                  const toAdd = newMembers
                    .filter((nm) => !existingIds.has(nm.tenantId))
                    .map((nm) => ({
                      name: nm.tenantName,
                      plan: prev.planName ?? "",
                      tenantId: nm.tenantId,
                      isSelected: true,
                    }));
                  return {
                    ...prev,
                    members: [...(prev.members ?? []), ...toAdd],
                  };
                });
              }}
              onUpdateAccess={(newAccess) => {
                const roomId = selectedUser.roomId || selectedUser._id;
                fetch(API_UPDATE_CHAT_ROOM(roomId), {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sendAccess: newAccess,
                    updatedBy: "SUPERADMIN",
                  }),
                }).catch((err) =>
                  console.error("Update access API failed:", err)
                );

                setSelectedUser((prev) =>
                  prev ? { ...prev, sendAccess: newAccess } : prev
                );
              }}
              onToggleDeleteConfirm={setShowDeleteConfirm}
              onDelete={handleDeleteGroup}
              onClose={() => setShowGroupDetails(false)}
              onSave={handleSaveGroupDetails}
            />
          )}
        </AnimatePresence>

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