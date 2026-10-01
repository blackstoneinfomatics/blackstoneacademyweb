"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { FaTelegramPlane } from "react-icons/fa";
import { FiMoreVertical, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronDown } from "react-icons/io5";

import BaseLayout3 from "../../components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";

// ─────────────────────────────────────────────
// API Endpoints
// ─────────────────────────────────────────────
const API_BASE = "http://localhost:5001";

const API_ACTIVE_PLANS = `${API_BASE}/api/plans/active`;
const API_TENANTS_BY_PLAN = (planId: string) =>
  `${API_BASE}/api/tenant-subscriptions/tenantsbyplan/${planId}`;
const API_CREATE_CHAT_ROOM = `${API_BASE}/chat-room`;
const API_LIST_CHAT_ROOMS = `${API_BASE}/chat-room`;

const ROOMS_PAGE_LIMIT = 100;
const DEFAULT_CREATOR_ID = "6aba4e3ee619505595695943";

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
  time: string;
  notificationStatus: "Unseen" | "Seen";
  isRead: boolean;
  status: "Active" | "Inactive";
  deliveredAt?: string;
  seenAt?: string;
  replyTo?: { _id: string; messages: string; senderName: string };
  attachment?: { name: string; size: number; type: string; url?: string };
}

interface IUser {
  _id: string;
  userName: string;
  email: string;
  role: string[];
  status: string;
  lastSeen?: string;
  isGroup?: boolean;
  roomType?: RoomType;
  plan?: string;
  profileImage?: string;
  members?: { name: string; plan: string }[];
  groupSettings?: "everyone" | "admins";
  lastMessage?: { text: string; time: string; senderName: string };
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

// Normalize any backend `type` into one of our three enums
const normalizeRoomType = (raw: any): RoomType => {
  const t = String(raw ?? "").toUpperCase();
  if (t === "SEGMENT") return "SEGMENT";
  if (t === "GLOBAL") return "GLOBAL";
  return "TENANT";
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
// Message time formatter
// ─────────────────────────────────────────────
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
// Sub: Receipt dots
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
// Sub: Message menu
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
// Sub: Message Info modal
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
      ? [{ _id: "u-1", name: "Reader", plan: "", time: message.seenAt }]
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
    userId: DEFAULT_CREATOR_ID,
    userName: "Will Jonto",
    role: "Super admin",
  };

  // ─────────────────────────────────────────────
  // Room stores (one per tab)
  // ─────────────────────────────────────────────
  const [allRooms, setAllRooms] = useState<IUser[]>([]);       // TENANT only
  const [unreadRooms, setUnreadRooms] = useState<IUser[]>([]); // backend unread
  const [groupRooms, setGroupRooms] = useState<IUser[]>([]);   // SEGMENT + GLOBAL
  const [roomsLoading, setRoomsLoading] = useState(false);

  const [allMessages, setAllMessages] = useState<IMessageData[]>([]);

  // ─────────────────────────────────────────────
  // UI state
  // ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "groups">(
    "all"
  );
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    messageTitle: "Today Updates day",
    message: "",
    attachment: null as File | null,
  });

  const [showGroupMenu, setShowGroupMenu] = useState(false);

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [addGroupData, setAddGroupData] = useState({
    groupName: "New Group",
    description: "",
    planId: "",
    planName: "",
    profileImage: null as File | null,
    profilePreview: null as string | null,
    selectedPeople: [] as string[],
  });
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

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
  //   TENANT  → individual chat  → All tab
  //   SEGMENT → tenant group     → Groups tab
  //   GLOBAL  → system broadcast → Groups tab
  // ─────────────────────────────────────────────
  const mapRoomToUser = (r: any): IUser => {
    const id = extractRoomId(r);
    const roomType = normalizeRoomType(r?.type);
    const isGroup = roomType === "SEGMENT" || roomType === "GLOBAL";

    const rawTenantIds: string[] = Array.isArray(r?.tenantIds)
      ? r.tenantIds.filter((x: any) => typeof x === "string" && x.trim())
      : [];

    const members = rawTenantIds.map((tid) => ({
      name: tid,
      plan: r?.planName ?? "",
    }));

    return {
      _id: id || `room-${Math.random().toString(36).slice(2)}`,
      userName: r?.name ?? r?.roomCode ?? "Untitled Room",
      email: "room@example.com",
      role: isGroup ? ["Group"] : ["Tenant"],
      status: r?.isEnabled ? "online" : "offline",
      lastSeen: r?.lastMessageAt
        ? formatMessageTime(r.lastMessageAt)
        : "recently",
      isGroup,
      roomType,
      plan: r?.planName ?? "",
      members,
      groupSettings: r?.sendAccess === "ADMINS" ? "admins" : "everyone",
      lastMessage: r?.lastMessage
        ? {
          text: r.lastMessage.message ?? "",
          time: formatMessageTime(
            r.lastMessage.createdAt ?? r.lastMessageAt
          ),
          senderName: r.lastMessage.senderName ?? "",
        }
        : undefined,
    };
  };

  // ─────────────────────────────────────────────
  // Fetch rooms
  //   Master list = data.all.rooms
  //   Split by roomType into the three tabs
  // ─────────────────────────────────────────────
  const fetchRooms = async () => {
    setRoomsLoading(true);
    try {
      const res = await fetch(
        `${API_LIST_CHAT_ROOMS}?page=1&limit=${ROOMS_PAGE_LIMIT}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error(`GET /chat-room failed: ${res.status}`, errText);
        setAllRooms([]);
        setUnreadRooms([]);
        setGroupRooms([]);
        return;
      }

      const json = await res.json();
      const d = json?.data ?? {};

      const allRaw: any[] = Array.isArray(d?.all?.rooms) ? d.all.rooms : [];
      const unreadRaw: any[] = Array.isArray(d?.unread?.rooms)
        ? d.unread.rooms
        : [];

      const mappedAll = allRaw.map(mapRoomToUser).filter((r) => r._id);
      const mappedUnread = unreadRaw.map(mapRoomToUser).filter((r) => r._id);

      // ── Strict split ──
      // Groups tab → SEGMENT and GLOBAL
      const groupList = mappedAll.filter(
        (r) => r.roomType === "SEGMENT" || r.roomType === "GLOBAL"
      );

      // All tab → ONLY TENANT (individuals)
      const individualList = mappedAll.filter((r) => r.roomType === "TENANT");

      console.log("✅ rooms loaded:", {
        all: individualList.length,
        unread: mappedUnread.length,
        groups: groupList.length,
      });

      setAllRooms(individualList);
      setUnreadRooms(mappedUnread);
      setGroupRooms(groupList);
    } catch (err) {
      console.error("❌ fetchRooms failed:", err);
      setAllRooms([]);
      setUnreadRooms([]);
      setGroupRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────
  // Tab counts
  // ─────────────────────────────────────────────
  const tabCounts = useMemo(
    () => ({
      all: allRooms.length,
      unread: unreadRooms.length,
      groups: groupRooms.length,
    }),
    [allRooms, unreadRooms, groupRooms]
  );

  // ─────────────────────────────────────────────
  // Visible rooms per tab
  // ─────────────────────────────────────────────
  const visibleRooms = useMemo(() => {
    const source: IUser[] =
      activeTab === "all"
        ? allRooms
        : activeTab === "unread"
          ? unreadRooms
          : groupRooms;

    let result = [...source];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.plan?.toLowerCase().includes(q) ||
          r.members?.some((m) => m.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeTab, allRooms, unreadRooms, groupRooms, searchQuery]);

  // ─────────────────────────────────────────────
  // People options
  // ─────────────────────────────────────────────
  const peopleOptions = useMemo(
    () => [...allRooms, ...groupRooms].filter((u) => !u.role.includes("Group")),
    [allRooms, groupRooms]
  );

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

  // ─────────────────────────────────────────────
  // Fetch plans when Add Group modal opens
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // Fetch tenants per plan
  // ─────────────────────────────────────────────
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
              : Array.isArray(json?.data?.records)
                ? json.data.records
                : [];

        const normalized: IPlanTenant[] = rawList
          .map((t: any) => {
            const id = extractTenantId(t);
            return {
              _id: id,
              tenantName:
                t?.tenantName ??
                t?.name ??
                t?.tenant?.tenantName ??
                t?.tenant?.name ??
                "Unnamed Tenant",
              plan:
                t?.plan ??
                t?.planName ??
                t?.tenant?.plan ??
                t?.tenant?.planName ??
                addGroupData.planName,
              planName: t?.planName ?? t?.plan,
            } as IPlanTenant;
          })
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
        if (!cancelled) {
          setPlanTenants([]);
          setAddGroupData((prev) => ({ ...prev, selectedPeople: [] }));
        }
      } finally {
        if (!cancelled) setPlanTenantsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showAddGroup, addGroupData.planId]);

  const memberOptions = useMemo(
    () =>
      planTenants.map((t) => ({
        id: t._id,
        name: t.tenantName || t.name || "Unnamed Tenant",
        plan: t.plan || t.planName || addGroupData.planName,
      })),
    [planTenants, addGroupData.planName]
  );

  const selectedMembers = useMemo(
    () =>
      memberOptions.filter((m) =>
        addGroupData.selectedPeople.includes(m.id)
      ),
    [memberOptions, addGroupData.selectedPeople]
  );

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

  const handleOpenGroupDetails = () => {
    setShowGroupMenu(false);
    setEditGroupImagePreview(selectedUser?.profileImage ?? null);
    setShowGroupDetails(true);
  };

  const handleDeleteGroup = async () => {
    if (!selectedUser) return;
    const deletedId = selectedUser._id;

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
        createdBy: currentUser.userId,
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

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <BaseLayout3>
      <SuperAdminHeader currentSection="Chats" />
      <div className="min-h-screen rounded-2xl bg-[#F5F7FC] dark:bg-[#1F1F1F] p-4 md:p-6">
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

            {/* TABS */}
            <div className="flex items-center px-3 mt-3 border-b border-[#EEEEEE] dark:border-[#3F3F3F] gap-2">
              {(
                [
                  { key: "all", label: "All", count: tabCounts.all },
                  { key: "unread", label: "Unread", count: tabCounts.unread },
                  { key: "groups", label: "Groups", count: tabCounts.groups },
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

            {/* ROOM LIST */}
            <div className="flex-1 overflow-y-auto max-h-[400px] md:max-h-none">
              {roomsLoading ? (
                <p className="py-6 text-center text-[11px] text-gray-400">
                  Loading chats…
                </p>
              ) : visibleRooms.length === 0 ? (
                <p className="py-6 text-center text-[11px] text-gray-400">
                  {activeTab === "groups"
                    ? "No groups yet — create one"
                    : activeTab === "unread"
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
                        className={`w-full flex items-center gap-2 px-3 py-2 border-b border-[#F0F1F4] dark:border-[#3F3F3F] text-left hover:bg-[#F7F8FC] dark:hover:bg-[#2F2F2F] ${selectedUser?._id === room._id
                          ? "bg-[#F4F6FB] dark:bg-[#2c2c2c]"
                          : ""
                          }`}
                        onClick={() => setSelectedUser(room)}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-md bg-[#E7E8EC] dark:bg-[#242424] flex items-center justify-center overflow-hidden">
                            {room.profileImage ? (
                              <img
                                src={room.profileImage}
                                alt={room.userName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[12px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">
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
                            <span className="text-[12px] font-semibold text-[#252B3A] dark:text-white truncate">
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
                          <p className="text-[12px] text-[#989DA8] dark:text-[#8a8a8a] truncate mt-[2px]">
                            {room.lastMessage?.text || "No messages yet"}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] text-[#A2A6AF] dark:text-[#8a8a8a]">
                            {room.lastMessage?.time || room.lastSeen}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              )}
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
                        className="ml-2 text-gray-400"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {pendingAttachment && (
                    <div className="mb-2 flex items-center gap-2 rounded-md border border-[#E6EAF2] bg-[#F8F9FC] px-2 py-1.5 dark:border-[#4A4A4A] dark:bg-[#2c2c2c]">
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
                            className="w-full rounded border border-[#576CBC] bg-white px-1 py-[1px] text-[11px] dark:bg-[#343434] dark:text-white"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingName(true)}
                            className="block max-w-full truncate text-left text-[11px] font-medium text-[#252B3A] hover:text-[#576CBC] dark:text-white"
                          >
                            {pendingName || pendingAttachment.name}
                          </button>
                        )}
                        <p className="text-[10px] text-[#8C919C]">
                          {formatFileSize(pendingAttachment.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPendingAttachment(null);
                          setPendingName("");
                          setEditingName(false);
                        }}
                        className="ml-1 text-gray-400"
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
                            className="block w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-100 dark:text-gray-200"
                          >
                            Document
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAttachmentMenuOpen(false);
                              fileInputRef.current?.click();
                            }}
                            className="block w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-100 dark:text-gray-200"
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

        {/* Broadcast modal */}
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
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h2 className="text-[16px] font-semibold text-[#010E30] dark:text-white">
                    Broadcast Chat
                  </h2>
                  <button
                    onClick={() => setShowBroadcast(false)}
                    className="text-[#777D89] text-xl"
                  >
                    ×
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    value={broadcastData.messageTitle}
                    onChange={(e) =>
                      setBroadcastData({
                        ...broadcastData,
                        messageTitle: e.target.value,
                      })
                    }
                    placeholder="Message Title"
                    className="w-full h-9 border border-[#D9DBE2] rounded-md px-3 text-[12px] dark:bg-[#2c2c2c] dark:text-white dark:border-[#4A4A4A]"
                  />
                  <textarea
                    value={broadcastData.message}
                    onChange={(e) =>
                      setBroadcastData({
                        ...broadcastData,
                        message: e.target.value,
                      })
                    }
                    placeholder="Type your message..."
                    className="w-full h-[100px] border border-[#D9DBE2] rounded-md p-2 text-[12px] dark:bg-[#2c2c2c] dark:text-white dark:border-[#4A4A4A]"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowBroadcast(false)}
                      className="h-9 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowBroadcast(false)}
                      className="h-9 rounded-md bg-[#576CBC] text-white px-4 text-[12px] font-semibold"
                    >
                      Send All Tenant
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Group modal */}
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
                className="w-full sm:max-w-[460px] max-h-[92vh] bg-white dark:bg-[#2c2c2c] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="px-5 pt-4 pb-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F]">
                  <h2 className="text-[16px] font-semibold text-[#101B41] dark:text-white">
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
                        className="w-full h-10 sm:h-9 rounded-md border border-[#D5D9E2] bg-white px-3 text-[12px] dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A]"
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
                        disabled={plansLoading || plans.length === 0}
                        onClick={() => setShowPlanDropdown((o) => !o)}
                        className="w-full h-10 sm:h-9 rounded-md border border-[#D5D9E2] bg-white px-3 text-[12px] text-left flex items-center justify-between disabled:opacity-60 dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A]"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: getPlanColor(
                                addGroupData.planName
                              ).dot,
                            }}
                          />
                          {plansLoading
                            ? "Loading plans…"
                            : addGroupData.planName || "Select Plan"}
                        </span>
                        <IoChevronDown className="text-[#777D89]" />
                      </button>

                      {showPlanDropdown && plans.length > 0 && (
                        <div className="absolute left-0 right-0 top-11 z-20 max-h-[220px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:bg-[#3A3A3A] dark:border-gray-700">
                          {plans.map((plan) => {
                            const c = getPlanColor(plan.planName);
                            return (
                              <button
                                key={plan._id}
                                onClick={() => {
                                  setAddGroupData((prev) => ({
                                    ...prev,
                                    planId: plan._id,
                                    planName: plan.planName,
                                    selectedPeople: [],
                                  }));
                                  setShowPlanDropdown(false);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] hover:bg-gray-100 dark:text-gray-200"
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: c.dot }}
                                />
                                {plan.planName}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-white">
                      Description
                    </label>
                    <textarea
                      value={addGroupData.description}
                      onChange={(e) =>
                        setAddGroupData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Short description..."
                      rows={2}
                      className="w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2 text-[12px] resize-none dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A]"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between rounded-t-md border border-b-0 border-[#E6EAF2] bg-[#F8F9FC] px-3 py-2 dark:bg-[#2c2c2c] dark:border-[#4A4A4A]">
                      <span className="text-[12px] font-medium text-[#101B41] dark:text-white">
                        Select Members
                      </span>
                      <span className="rounded-md bg-[#E6F0EC] text-[#2F7A5C] px-2 py-0.5 text-[11px] font-semibold">
                        {String(selectedMembers.length).padStart(2, "0")} selected
                      </span>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto rounded-b-md border border-[#E6EAF2] bg-white p-2 space-y-1 dark:bg-[#343434] dark:border-[#4A4A4A]">
                      {planTenantsLoading ? (
                        <p className="py-4 text-center text-[11px] text-gray-400">
                          Loading members…
                        </p>
                      ) : memberOptions.length === 0 ? (
                        <p className="py-4 text-center text-[11px] text-gray-400">
                          No members found for this plan
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
                                className="h-3.5 w-3.5 accent-[#576CBC]"
                              />
                              <span className="flex-1 truncate text-[#101B41] dark:text-white">
                                {member.name}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-[1px] rounded ${c.bg} ${c.text}`}
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

                <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-[#F0F1F4] dark:border-[#3F3F3F]">
                  {createGroupError ? (
                    <span className="text-[11px] text-red-500">
                      {createGroupError}
                    </span>
                  ) : (
                    <span />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddGroup(false)}
                      className="h-10 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateGroup}
                      disabled={isCreatingGroup}
                      className="h-10 rounded-md bg-[#576CBC] text-white px-4 text-[12px] font-semibold disabled:opacity-60"
                    >
                      {isCreatingGroup ? "Creating…" : "Done"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Group Details modal */}
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
                className="w-full sm:max-w-[460px] max-h-[92vh] bg-white dark:bg-[#2c2c2c] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="px-5 pt-4 pb-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F]">
                  <h2 className="text-[16px] font-semibold text-[#101B41] dark:text-white">
                    Group Details
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  <div className="flex gap-4">
                    <label className="cursor-pointer block relative">
                      <div className="w-[66px] h-[66px] rounded-2xl bg-[#E7E8EC] dark:bg-[#3A3A3A] flex items-center justify-center overflow-hidden">
                        {editGroupImagePreview ||
                          selectedUser.profileImage ? (
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
                          <span className="text-[28px] font-medium text-[#9297A2]">
                            {selectedUser.userName
                              ?.charAt(0)
                              ?.toUpperCase() ?? "G"}
                          </span>
                        )}
                      </div>
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
                    <div className="flex-1">
                      <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-white">
                        Group Name
                      </label>
                      <input
                        type="text"
                        value={selectedUser.userName || ""}
                        readOnly
                        className="w-full h-10 rounded-md border border-[#D5D9E2] bg-white px-3 text-[12px] dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A]"
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-[#E6EAF2] dark:border-[#4A4A4A] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#E6EAF2] bg-[#F8F9FC] px-3 py-2 dark:bg-[#2c2c2c] dark:border-[#4A4A4A]">
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
                    <div className="max-h-[200px] overflow-y-auto bg-white p-2 space-y-1 dark:bg-[#343434]">
                      {(selectedUser.members ?? []).map((member, i) => {
                        const memberIndex = i;
                        const c = getPlanColor(member.plan);
                        return (
                          <div
                            key={`${member.name}-${i}`}
                            className="flex items-center gap-2 rounded px-2 py-1.5"
                          >
                            <span className="flex-1 text-[12px] text-[#101B41] dark:text-white truncate">
                              {member.name}
                            </span>
                            <span className={`text-[11px] ${c.text}`}>
                              {member.plan}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
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
                              className="flex h-6 w-6 items-center justify-center rounded-md text-[#9EA3AE] hover:text-[#D14343]"
                            >
                              🗑
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-md border border-[#F5D0D0] bg-[#FFF8F8] p-3 dark:bg-[#3A2525] dark:border-[#5A2A2A]">
                    <p className="mb-1 text-[13px] font-medium text-[#D14343]">
                      Delete Group
                    </p>
                    <p className="mb-3 text-[11px] text-[#8C919C]">
                      Once deleted, this group and all messages will be
                      permanently removed.
                    </p>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="h-9 rounded-md border border-[#D14343] text-[#D14343] px-4 text-[12px] font-semibold"
                      >
                        Delete Group
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 h-9 rounded-md border border-[#D5D9E2] px-3 text-[12px] font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteGroup}
                          className="flex-1 h-9 rounded-md bg-[#D14343] text-white px-3 text-[12px] font-semibold"
                        >
                          Yes, Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 px-5 py-3 border-t border-[#F0F1F4] dark:border-[#3F3F3F]">
                  <button
                    onClick={() => setShowGroupDetails(false)}
                    className="h-10 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGroupDetails}
                    className="h-10 rounded-md bg-[#576CBC] text-white px-4 text-[12px] font-semibold"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
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