"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  FiCheck, FiClock, FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import BaseLayout4 from "../../components/BaseLayout4";
import AdminHeader from "../../components/AdminHeader";
import { GroupDetailsModal } from "./GroupDetailsModal";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import ConversationList from "./ConversationList";
import ChatPanel from "./ChatPanel";
import NewChatModal from "./forms/NewChatModal";
import NewGroupModal from "./forms/NewGroupModal";
import type { CategoryDef, CategoryKey, DirectoryMember, IMessage, IUser, RoomType } from "./chat-types";

const API_BASE = AppApiEndpoints.API_END_POINT;

const API_CREATE_CHAT_ROOM = `${API_BASE}/user/chat-room`;
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
const API_GET_GROUP_DETAILS = (roomId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.GET_GROUP_DETAILS(roomId)}`;
const API_DELETE_MESSAGE_FOR_EVERYONE = (messageId: string, userId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.DELETE_MESSAGE_FOR_EVERYONE(messageId, userId)}`;

const API_GET_TENANT_ROLES = (tenantId: string) =>
  `${API_BASE}/tenant-portal/${tenantId}/roles`;

const API_GET_TENANT_USERS_BY_ROLE = (tenantId: string, role: string) =>
  `${API_BASE}/tenant/${tenantId}/users?role=${encodeURIComponent(role)}`;

const ROOMS_PAGE_LIMIT = 100;

const resolveTenantCode = (): string => {
  if (typeof window === "undefined") return "";
  const keys = [
    "tenantId", "tenantCode", "TenantId", "TENANT_ID",
    "selectedTenantId", "TENANT_CODE", "currentTenantId", "tenant",
  ];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (!v || !v.trim()) continue;
    const trimmed = v.trim();
    if (trimmed.startsWith("{")) {
      try {
        const obj = JSON.parse(trimmed);
        const id = obj.tenantId || obj.tenantCode || obj.id || obj._id;
        if (id) return String(id);
      } catch { /* ignore */ }
    }
    return trimmed;
  }
  return "";
};

const resolveAuthToken = (): string => {
  if (typeof window === "undefined") return "";
  const keys = ["AdminAuthToken", "authToken", "token", "accessToken", "jwt"];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v && v.trim()) return v.trim();
  }
  return "";
};

const MANDATORY_CATEGORIES: CategoryDef[] = [
  { key: "ALL", label: "All", short: "AL", rawRole: "" },
  { key: "GROUP", label: "Group", short: "GR", rawRole: "GROUP" },
  { key: "SUPERADMIN", label: "Super Admin", short: "SA", rawRole: "ADMIN" },
];

const FALLBACK_ROLE_CATEGORIES: CategoryDef[] = [
  { key: "TEACHER", label: "Teacher", short: "TE", rawRole: "TEACHER" },
  { key: "SUPERVISOR", label: "Supervisor", short: "SV", rawRole: "SUPERVISOR" },
  { key: "STUDENT", label: "Student", short: "ST", rawRole: "STUDENT" },
];

const ROLE_LABEL_OVERRIDES: Record<string, { label: string; short: string }> = {
  SUPERADMIN: { label: "Super Admin", short: "SA" },
  ACADEMICCOACH: { label: "Academic Coach", short: "AC" },
  TEACHER: { label: "Teacher", short: "TE" },
  SUPERVISOR: { label: "Supervisor", short: "SV" },
  STUDENT: { label: "Student", short: "ST" },
  ADMIN: { label: "Super Admin", short: "SA" },
};

const normalizeRoleKey = (raw: any): string =>
  String(raw ?? "").toUpperCase().replace(/[\s_-]/g, "");

const roleToLabel = (raw: string): string => {
  const key = normalizeRoleKey(raw);
  if (ROLE_LABEL_OVERRIDES[key]) return ROLE_LABEL_OVERRIDES[key].label;
  return raw
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
};

const roleToShort = (raw: string): string => {
  const key = normalizeRoleKey(raw);
  if (ROLE_LABEL_OVERRIDES[key]) return ROLE_LABEL_OVERRIDES[key].short;
  return (
    raw
      .split(/[\s_-]+/)
      .map((w) => (w ? w[0].toUpperCase() : ""))
      .join("")
      .slice(0, 2) || "??"
  );
};

const LS_KEY_REMOVED = "adminChatRoom.removedTenants.";
const LS_KEY_ROOM_MEMBERS = "adminChatRoom.allMembers.";
const LS_KEY_CLEARED_AT = "adminChatRoom.clearedAt.";
const LS_KEY_READ_ROOMS = "adminChatRoom.readRooms";

const getChatClearedAt = (roomId: string): number | null => {
  if (typeof window === "undefined") return null;
  const value = Number(window.localStorage.getItem(LS_KEY_CLEARED_AT + roomId));
  return Number.isFinite(value) && value > 0 ? value : null;
};
const setChatClearedAt = (roomId: string, timestamp: number) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY_CLEARED_AT + roomId, String(timestamp)); } catch { }
};
const removeChatClearedAt = (roomId: string) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(LS_KEY_CLEARED_AT + roomId); } catch { }
};

const getRemovedTenants = (roomId: string): string[] => {
  if (typeof window === "undefined") return [];
  try { const raw = window.localStorage.getItem(LS_KEY_REMOVED + roomId); return raw ? JSON.parse(raw) : []; } catch { return []; }
};
const setRemovedTenants = (roomId: string, ids: string[]) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY_REMOVED + roomId, JSON.stringify(ids)); } catch { }
};
const addRemovedTenant = (roomId: string, tenantId: string) => {
  const current = getRemovedTenants(roomId);
  if (!current.includes(tenantId)) setRemovedTenants(roomId, [...current, tenantId]);
};
const removeFromRemovedTenant = (roomId: string, tenantId: string) => {
  const current = getRemovedTenants(roomId);
  setRemovedTenants(roomId, current.filter((id) => id !== tenantId));
};

interface StoredMember { tenantId: string; tenantName: string; }
const getRoomMembersCache = (roomId: string): StoredMember[] => {
  if (typeof window === "undefined") return [];
  try { const raw = window.localStorage.getItem(LS_KEY_ROOM_MEMBERS + roomId); return raw ? JSON.parse(raw) : []; } catch { return []; }
};
const setRoomMembersCache = (roomId: string, members: StoredMember[]) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY_ROOM_MEMBERS + roomId, JSON.stringify(members)); } catch { }
};
const mergeIntoRoomMembersCache = (roomId: string, newMembers: StoredMember[]) => {
  const current = getRoomMembersCache(roomId);
  const map = new Map(current.map((m) => [m.tenantId, m]));
  newMembers.forEach((m) => { if (!map.has(m.tenantId)) map.set(m.tenantId, m); });
  setRoomMembersCache(roomId, Array.from(map.values()));
};

const getReadRooms = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY_READ_ROOMS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
const setReadRooms = (ids: string[]) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY_READ_ROOMS, JSON.stringify(ids)); } catch { }
};
const markRoomAsRead = (roomId: string) => {
  const current = getReadRooms();
  if (!current.includes(roomId)) setReadRooms([...current, roomId]);
};

interface IRoomMessageResponse {
  _id?: string; senderId?: string; senderName?: string; message?: string;
  createdAt?: string; timestamp?: string; isDeleted?: boolean; dateLabel?: string;
  side?: "left" | "right";
  replyTo?: { messageId?: string; message?: string; senderName?: string; senderId?: string } | null;
  attachments?: { name?: string; size?: number; type?: string; url?: string }[];
}
interface IRoomMessagesResponse {
  success?: boolean; statusCode?: number; message?: string;
  data?: { messages?: IRoomMessageResponse[] };
}
interface IMessageSeenUser { userId: string; name: string; seenAt: string; }
interface IMessageSeenResponse { success?: boolean; message?: string; data?: { totalSeen?: number; seenUsers?: IMessageSeenUser[] }; }

interface IMessageData { _id: string; messages: IMessage[]; }

const PLAN_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Premium: { bg: "bg-[#F3E8FF] dark:bg-[#3A2F58]", text: "text-[#8B5CF6] dark:text-[#C4A8FF]", dot: "#8B5CF6" },
  Standard: { bg: "bg-[#E0F2FE] dark:bg-[#22375A]", text: "text-[#3B82F6] dark:text-[#7EB0FF]", dot: "#3B82F6" },
  Basic: { bg: "bg-[#E6F7EC] dark:bg-[#1F3A2B]", text: "text-[#22C55E] dark:text-[#68D391]", dot: "#22C55E" },
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
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
};
const getPlanColor = (plan?: string) => {
  if (!plan) return { bg: "bg-gray-100 dark:bg-[#3A3A3A]", text: "text-gray-600 dark:text-gray-300", dot: "#9CA3AF" };
  if (PLAN_COLORS[plan]) return PLAN_COLORS[plan];
  const lower = plan.toLowerCase();
  if (lower.includes("premium") || lower.includes("pro") || lower.includes("ultra")) return PLAN_COLORS.Premium;
  if (lower.includes("standard")) return PLAN_COLORS.Standard;
  if (lower.includes("basic")) return PLAN_COLORS.Basic;
  return FALLBACK_COLORS[hashString(plan) % FALLBACK_COLORS.length];
};

const extractRoomId = (r: any): string => {
  const raw = r?._id ?? r?.roomId ?? r?.chatRoomId ?? r?.id ?? "";
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && typeof raw.$oid === "string") return raw.$oid;
  return raw ? String(raw) : "";
};
const normalizeRoomType = (raw: any): RoomType => {
  const t = String(raw ?? "").toUpperCase();
  if (t === "SEGMENT") return "SEGMENT";
  if (t === "GLOBAL") return "GLOBAL";
  return "TENANT";
};
const formatMessageTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const hasAnyMessage = (room: IUser): boolean => {
  const preview = room.lastMessage?.text?.trim();
  return Boolean(preview && preview.length > 0);
};

const normalizeUsersResponse = (json: any, fallbackRole: string): DirectoryMember[] => {
  const usersRaw: any[] =
    (json?.data && Array.isArray(json.data.users) && json.data.users) ||
    (Array.isArray(json?.data) && json.data) ||
    (Array.isArray(json?.users) && json.users) ||
    [];

  return usersRaw
    .map((u: any) => {
      const name = u?.name ?? u?.userName ?? "Unnamed";
      return {
        _id: String(u?.userId ?? u?._id ?? u?.id ?? ""),
        name,
        role: normalizeRoleKey(u?.role ?? fallbackRole),
        planName: u?.planName ?? u?.plan ?? u?.course ?? "",
        planId: u?.planId ?? "",
        avatarLetter: name.charAt(0).toUpperCase(),
      };
    })
    .filter((u) => Boolean(u._id));
};

const fetchMembersForCategory = async (category: CategoryDef): Promise<DirectoryMember[]> => {
  const tenantId = resolveTenantCode();
  if (!tenantId) throw new Error("Tenant ID not found in session.");

  const token = resolveAuthToken();
  const rawRole = category.rawRole || category.key;
  const response = await fetch(API_GET_TENANT_USERS_BY_ROLE(tenantId, rawRole), {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) throw new Error(`Failed to load members (HTTP ${response.status})`);

  return normalizeUsersResponse(await response.json(), rawRole);
};

const MessageInfoModal = ({ message, onClose }: { message: IMessage; onClose: () => void }) => {
  const [seenUsers, setSeenUsers] = useState<IMessageSeenUser[]>([]);
  const [seenLoading, setSeenLoading] = useState(true);
  const [seenError, setSeenError] = useState<string | null>(null);

  useEffect(() => {
    const token = resolveAuthToken();
    const userId = localStorage.getItem("AdminPortalId");
    if (!token || !userId) { setSeenError("Admin authentication data is missing."); setSeenLoading(false); return; }
    const controller = new AbortController();
    setSeenLoading(true);
    setSeenError(null);
    (async () => {
      try {
        const response = await fetch(API_MESSAGE_SEEN_USERS(message._id, userId), {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, cache: "no-store",
        });
        const result: IMessageSeenResponse = await response.json();
        if (!response.ok || result.success === false) throw new Error(result.message || `Fetch seen users failed`);
        setSeenUsers(result.data?.seenUsers ?? []);
      } catch (error) {
        if (!controller.signal.aborted) setSeenError(error instanceof Error ? error.message : "Could not load seen info.");
      } finally { if (!controller.signal.aborted) setSeenLoading(false); }
    })();
    return () => controller.abort();
  }, [message._id]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] overflow-hidden rounded-xl border border-[#E7EAF0] bg-white shadow-2xl dark:border-[#42464D] dark:bg-[#262A30]">
        <div className="flex items-center justify-between border-b border-[#ECEEF2] px-5 py-4 dark:border-[#3B4048]">
          <h3 className="mt-0.5 text-[15px] font-semibold text-[#172033] dark:text-white">Message info</h3>
          <button type="button" onClick={onClose} aria-label="Close message info"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#7C8492] transition hover:bg-[#F1F3F6] hover:text-[#172033] dark:hover:bg-[#383D45] dark:hover:text-white">
            <FiX size={16} />
          </button>
        </div>
        <div className="max-h-[min(70vh,560px)] space-y-5 overflow-y-auto p-5">
          <section>
            <div className="ml-auto max-w-[88%] rounded-xl rounded-br-sm bg-[#576CBC] px-3.5 py-3 text-white shadow-sm">
              <p className="whitespace-pre-wrap break-words text-[13px] leading-5">{message.messages || "Attachment"}</p>
              <p className="mt-2 text-right text-[10px] text-white/75">{message.time}</p>
            </div>
          </section>
          <div className="flex items-center justify-between border-t border-[#ECEEF2] pt-4 text-[12px] dark:border-[#3B4048]">
            <span className="text-[#7C8492]">Sent</span>
            <span className="font-medium text-[#172033] dark:text-[#E7EAF0]">{message.time || "—"}</span>
          </div>
          <section>
            <div className="mb-3 flex items-center justify-between border-b border-[#ECEEF2] pb-2 dark:border-[#3B4048]">
              <div className="flex items-center gap-2">
                <FiCheck className="text-[#2F8F76]" size={14} />
                <h4 className="text-[12px] font-semibold text-[#172033] dark:text-white">Seen by</h4>
              </div>
              {!seenLoading && !seenError && (
                <span className="rounded-full bg-[#E5F3EF] px-2 py-0.5 text-[10px] font-semibold text-[#287A66] dark:bg-[#243D37] dark:text-[#83C8B4]">{seenUsers.length}</span>
              )}
            </div>
            {seenLoading ? (
              <div className="flex items-center gap-2 py-2 text-[11px] text-[#7C8492]"><FiClock size={13} /> Loading seen details…</div>
            ) : seenError ? (
              <p role="alert" className="py-2 text-[11px] text-red-500">{seenError}</p>
            ) : seenUsers.length === 0 ? (
              <p className="py-2 text-[11px] text-[#9299A5]">Not seen yet</p>
            ) : (
              <div className="divide-y divide-[#ECEEF2] dark:divide-[#3B4048]">
                {seenUsers.map((user) => (
                  <div key={user.userId} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E9EEF8] text-[11px] font-semibold text-[#4863A8] dark:bg-[#343D50] dark:text-[#B5C5F1]">
                      {user.name.trim().charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#263044] dark:text-[#E7EAF0]">{user.name}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const Message = () => {
  const currentUser = {
    userId: typeof window !== "undefined" ? localStorage.getItem("AdminPortalId") ?? "ADMIN_PORTAL_ID" : "ADMIN_PORTAL_ID",
    userName: typeof window !== "undefined" ? localStorage.getItem("AdminPortalName") ?? "Admin" : "Admin",
    role: "Admin",
  };

  const [allRooms, setAllRooms] = useState<IUser[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const [categories, setCategories] = useState<CategoryDef[]>([
    ...MANDATORY_CATEGORIES,
    ...FALLBACK_ROLE_CATEGORIES,
  ]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("ALL");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

  const [allMessages, setAllMessages] = useState<IMessageData[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [editGroupImagePreview, setEditGroupImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  const [replyTo, setReplyTo] = useState<IMessage | null>(null);
  const [infoMessage, setInfoMessage] = useState<IMessage | null>(null);

  const [readStateVersion, setReadStateVersion] = useState(0);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);

    try {
      const tenantId = resolveTenantCode();
      const token = resolveAuthToken();

      if (!tenantId) {
        setCategories([...MANDATORY_CATEGORIES, ...FALLBACK_ROLE_CATEGORIES]);
        setCategoriesLoading(false);
        return;
      }

      const res = await fetch(API_GET_TENANT_ROLES(tenantId), {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`Failed to load roles (HTTP ${res.status})`);

      const json = await res.json();
      const rawRoles: string[] = Array.isArray(json?.data) ? json.data : [];

      const seen = new Set<string>(["ALL", "GROUP", "SUPERADMIN"]);
      const dynamicRoles: CategoryDef[] = [];

      rawRoles.forEach((raw) => {
        const key = normalizeRoleKey(raw);
        if (key === "ADMIN" || key === "SUPERADMIN") return;
        if (key === "GROUP") return;
        if (seen.has(key)) return;
        seen.add(key);
        dynamicRoles.push({
          key,
          label: roleToLabel(raw),
          short: roleToShort(raw),
          rawRole: raw,
        });
      });

      const next: CategoryDef[] = [...MANDATORY_CATEGORIES, ...dynamicRoles];
      setCategories(next);
      setActiveCategory((prev) =>
        next.some((c) => c.key === prev) ? prev : "ALL"
      );
    } catch (err: any) {
      setCategoriesError(err?.message ?? "Failed to load roles");
      setCategories([...MANDATORY_CATEGORIES, ...FALLBACK_ROLE_CATEGORIES]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => { void fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const mapRoomToUser = useCallback((r: any): IUser => {
    const id = extractRoomId(r);
    const roomType = normalizeRoomType(r?.type);
    const isGroup = roomType === "SEGMENT" || roomType === "GLOBAL";

    const clearedAt = getChatClearedAt(id);
    const lastRoomMessageAt = new Date(r?.lastMessage?.createdAt ?? r?.lastMessageAt ?? "").getTime();
    const hasMessageAfterClear = clearedAt !== null && Number.isFinite(lastRoomMessageAt) && lastRoomMessageAt > clearedAt;
    const isChatCleared = clearedAt !== null && !hasMessageAfterClear;
    if (hasMessageAfterClear) removeChatClearedAt(id);

    const rawTenantIds: string[] = Array.isArray(r?.tenantIds)
      ? r.tenantIds.filter((x: any) => typeof x === "string" && x.trim())
      : [];
    const removedIds = getRemovedTenants(id);
    const cachedMembers = getRoomMembersCache(id);
    const cacheLookup = new Map(cachedMembers.map((m) => [m.tenantId, m.tenantName]));
    const rawMembers = Array.isArray(r?.members) ? r.members : [];

    const activeMembers = rawTenantIds.map((tid) => {
      const found = rawMembers.find((m: any) => (m.tenantId || m._id || m.id) === tid);
      return {
        name: found?.tenantName || found?.name || cacheLookup.get(tid) || tid,
        plan: r?.planName ?? "",
        tenantId: tid,
        isSelected: !removedIds.includes(tid),
      };
    });
    const activeIds = new Set(activeMembers.map((m) => m.tenantId));
    const cachedOnlyMembers = cachedMembers
      .filter((cm) => !activeIds.has(cm.tenantId))
      .map((cm) => ({ name: cm.tenantName, plan: r?.planName ?? "", tenantId: cm.tenantId, isSelected: false }));

    let roleKey: string = isGroup ? "GROUP" : normalizeRoleKey(r?.role);
    if (roleKey === "ADMIN") roleKey = "SUPERADMIN";

    const readIds = getReadRooms();
    const isReadLocally = readIds.includes(id);
    const rawUnread = r?.unreadCount ?? 0;
    const isUnread = !isReadLocally && (r?.isUnread ?? rawUnread > 0);

    return {
      _id: id || `room-${Math.random().toString(36).slice(2)}`,
      userName: r?.name ?? r?.roomCode ?? "Untitled Room",
      email: "room@example.com",
      role: isGroup ? ["Group"] : ["Tenant"],
      roleKey,
      status: r?.isEnabled ? "online" : "offline",
      lastSeen: isChatCleared ? "" : r?.lastMessageAt ? formatMessageTime(r.lastMessageAt) : "recently",
      isGroup,
      roomType,
      plan: r?.planName ?? "",
      members: [...activeMembers, ...cachedOnlyMembers],
      groupSettings: r?.sendAccess === "ADMINS" ? "admins" : "everyone",
      lastMessage: !isChatCleared && r?.lastMessage
        ? {
          text: r.lastMessage.message ?? "",
          time: formatMessageTime(r.lastMessage.createdAt ?? r.lastMessageAt),
          senderName: r.lastMessage.senderName ?? "",
        }
        : undefined,
      profileImage: null,
      roomId: id,
      roomCode: r?.roomCode ?? "",
      unreadCount: isUnread ? Math.max(rawUnread, 1) : 0,
      isUnread,
      description: r?.description ?? "",
      planName: r?.planName ?? "",
      planId: r?.planId ?? "",
      sendAccess: r?.sendAccess === "ADMIN_ONLY" || r?.sendAccess === "ADMINS" ? "ADMIN_ONLY" : "EVERYONE",
    };
  }, []);

  const fetchRooms = useCallback(async () => {
    setRoomsLoading(true);

    try {
      const userId = localStorage.getItem("AdminPortalId") || "";
      const tenantId = resolveTenantCode();
      const token = resolveAuthToken();

      const res = await fetch(
        `${API_LIST_CHAT_ROOMS}?page=1&limit=${ROOMS_PAGE_LIMIT}&userId=${userId}&tenantId=${tenantId}`,
        {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const json = res.ok ? await res.json() : {};
      const data = json?.data ?? {};
      const apiRooms: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
          ? data.items
          : [];

      const mapped = apiRooms.map(mapRoomToUser).filter((r) => r._id);
      setAllRooms(mapped);
    } catch (err) {
      console.error("fetchRooms failed:", err);
      setAllRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  }, [mapRoomToUser]);

  useEffect(() => { void fetchRooms(); }, [fetchRooms]);

  const categoryRooms = useMemo(() => {
    let result = allRooms.filter(hasAnyMessage);

    if (activeCategory === "GROUP") {
      result = result.filter(
        (r) => r.roomType === "SEGMENT" || r.roomType === "GLOBAL" || r.isGroup
      );
    } else if (activeCategory !== "ALL") {
      result = result.filter((r) => !r.isGroup && r.roleKey === activeCategory);
    }

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
  }, [allRooms, activeCategory, searchQuery]);

  const tabCounts = useMemo(() => {
    void readStateVersion;
    const sources = allRooms.filter(hasAnyMessage);
    return {
      total: sources.length,
      unread: sources.filter((r) => r.isUnread).length,
    };
  }, [allRooms, readStateVersion]);

  useEffect(() => {
    if (!selectedUser) return;
    if (!selectedUser.isGroup && !selectedUser.role.includes("Group")) return;
    const roomId = selectedUser.roomId || selectedUser._id;
    const token = resolveAuthToken();
    const currentSelectedId = selectedUser._id;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(API_GET_GROUP_DETAILS(roomId), {
          cache: "no-store",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = await res.json();
        const groupData = json?.data ?? json;
        const rawMembers: any[] = Array.isArray(groupData?.members) ? groupData.members : [];
        if (controller.signal.aborted || rawMembers.length === 0) return;
        const removedIds = getRemovedTenants(roomId);
        const freshMembers = rawMembers.map((m: any) => ({
          name: m.tenantName || m.name || m.tenantId || "Unknown",
          plan: groupData?.planName ?? selectedUser.planName ?? "",
          tenantId: m.tenantId || m._id || "",
          isSelected: removedIds.includes(m.tenantId || m._id)
            ? false
            : (m.isSelected !== undefined ? m.isSelected : true),
        }));
        mergeIntoRoomMembersCache(roomId, freshMembers.map((m) => ({ tenantId: m.tenantId, tenantName: m.name })));
        setSelectedUser((prev) => (prev && prev._id === currentSelectedId ? { ...prev, members: freshMembers } : prev));
      } catch { /* silent */ }
    })();

    return () => controller.abort();

  }, [selectedUser?._id, selectedUser?.isGroup]);

  useEffect(() => {
    if (!selectedUser) return;
    setMessagesLoading(true);

    markRoomAsRead(selectedUser._id);
    setReadStateVersion((v) => v + 1);
    setAllRooms((prev) =>
      prev.map((r) => (r._id === selectedUser._id ? { ...r, isUnread: false, unreadCount: 0 } : r))
    );

    const token = resolveAuthToken();
    const userId = localStorage.getItem("AdminPortalId");
    if (!token || !userId) { setMessagesLoading(false); return; }

    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(API_ROOM_MESSAGES(selectedUser._id, userId), {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: "no-store",
        });
        const result: IRoomMessagesResponse = await response.json();
        if (!response.ok || result.success === false) {
          throw new Error(result.message || `Fetch messages failed`);
        }
        const messages = (result.data?.messages ?? []).map((message, index): IMessage => {
          const createdDate = message.timestamp ?? message.createdAt ?? new Date().toISOString();
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
              : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        });

        const lastMessageId = messages[messages.length - 1]?._id;
        if (lastMessageId) {
          void fetch(API_MARK_CHAT_SEEN, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ roomId: selectedUser._id, userId, messageId: lastMessageId }),
            signal: controller.signal,
          }).catch(() => { /* silent */ });
        }

        setAllMessages((prev) => [
          ...prev.filter((g) => g._id !== selectedUser._id),
          { _id: selectedUser._id, messages },
        ]);
      } catch (error) {
        if (!controller.signal.aborted) console.error("Failed to fetch room messages:", error);
      } finally {
        if (!controller.signal.aborted) setMessagesLoading(false);
      }
    })();

    return () => controller.abort();
  }, [selectedUser]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [allMessages, selectedUser?._id]);

  const selectedMessages = useMemo(() => {
    if (!selectedUser) return [];
    return allMessages.find((g) => g._id === selectedUser._id)?.messages || [];
  }, [selectedUser, allMessages]);

  const canSend = useMemo(() => {
    if (!selectedUser) return false;
    const access = selectedUser.sendAccess ?? (selectedUser.groupSettings === "admins" ? "ADMIN_ONLY" : "EVERYONE");
    if (access === "EVERYONE") return true;
    const role = String(currentUser.role || "").toUpperCase();
    return role.includes("ADMIN") || role.includes("SUPERADMIN");
  }, [selectedUser, currentUser.role]);

  const handleSendMessage = async (): Promise<string | null> => {
    if (!selectedUser) return "Select a conversation before sending.";
    if (!canSend) return "Only admins can send messages in this chat.";
    if (!messageText.trim()) return "Enter a message before sending.";

    const senderName = currentUser.userName;
    const senderId = currentUser.userId;
    const text = messageText.trim();
    const token = resolveAuthToken();

    try {
      const response = await fetch(API_SEND_CHAT_MESSAGE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          roomId: selectedUser._id,
          senderId,
          senderName,
          senderRole: "ADMIN",
          messageType: "TEXT",
          message: text,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Send failed");
      }

      const candidates: unknown[] = [
        result?.data?.message?._id,
        result?.data?.messageId,
        result?.data?._id,
        result?.message?._id,
        result?.messageId,
        result?._id,
      ];
      const createdMessageId = candidates.find(
        (v): v is string => typeof v === "string" && /^[a-f\d]{24}$/i.test(v)
      );

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const newMessage: IMessage = {
        _id: createdMessageId ?? `local-${Date.now()}`,
        messages: text,
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
        canReply: true,
      };

      setAllMessages((prev) => {
        const existing = prev.find((g) => g._id === selectedUser._id);
        if (existing) {
          return prev.map((g) =>
            g._id === selectedUser._id ? { ...g, messages: [...g.messages, newMessage] } : g
          );
        }
        return [...prev, { _id: selectedUser._id, messages: [newMessage] }];
      });
      setSelectedUser((prev) =>
        prev ? { ...prev, lastMessage: { text, time: timeStr, senderName } } : prev
      );
      setAllRooms((prev) =>
        prev.map((r) =>
          r._id === selectedUser._id ? { ...r, lastMessage: { text, time: timeStr, senderName } } : r
        )
      );
      setMessageText("");
      return null;
    } catch (error) {
      console.error("Send message failed:", error);
      return error instanceof Error ? error.message : "Message could not be sent.";
    }
  };

  const startChatWithMemberAndSend = async (member: DirectoryMember, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const token = resolveAuthToken();
    const tenantId = resolveTenantCode();

    let createdRoomId: string | undefined;
    let serverRoom: any = null;

    try {
      const createRes = await fetch(API_CREATE_CHAT_ROOM, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: "TENANT",
          roomType: "TENANT",
          tenantIds: [member._id],
          participants: [member._id],
          memberIds: [member._id],
          name: member.name,
          title: member.name,
          createdBy: currentUser.userName,
          creatorId: currentUser.userId,
          adminId: currentUser.userId,
          sendAccess: "EVERYONE",
          settings: "everyone",
          status: "ACTIVE",
          tenantId,
        }),
      });

      const createJson = await createRes.json().catch(() => null);
      if (createRes.ok && createJson?.success !== false) {
        serverRoom = createJson?.data?.room ?? createJson?.data ?? null;
        createdRoomId =
          serverRoom?._id ?? serverRoom?.roomId ?? createJson?.data?._id ?? createJson?.roomId ?? undefined;
      }
    } catch (err) {
      console.error("[create room] failed:", err);
    }

    const roomId = createdRoomId;
    if (!roomId) {
      console.error("[create room] no room id returned — cannot send message");
      return;
    }

    try {
      await fetch(API_SEND_CHAT_MESSAGE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          roomId,
          senderId: currentUser.userId,
          senderName: currentUser.userName,
          senderRole: "ADMIN",
          messageType: "TEXT",
          message: trimmed,
        }),
      });
    } catch (err) {
      console.error("[send first message] failed:", err);
    }

    setShowNewChatModal(false);
    setTimeout(() => { void fetchRooms(); }, 400);
  };

  const handleCreateGroupFromDirectory = async (groupName: string, memberIds: string[]) => {
    const token = resolveAuthToken();
    const tenantId = resolveTenantCode();

    try {
      const res = await fetch(API_CREATE_CHAT_ROOM, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: groupName,
          title: groupName,
          roomName: groupName,
          groupName,
          description: " ",
          type: "SEGMENT",
          roomType: "SEGMENT",
          participants: memberIds,
          tenantIds: memberIds,
          memberIds,
          createdBy: currentUser.userName,
          creatorId: currentUser.userId,
          adminId: currentUser.userId,
          sendAccess: "EVERYONE",
          settings: "everyone",
          status: "ACTIVE",
          tenantId,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Create group failed: HTTP ${res.status}`);
      }

      setShowNewGroupModal(false);
      setActiveCategory("GROUP");
      setTimeout(() => { void fetchRooms(); }, 400);
    } catch (err) {
      console.error("[create group] failed:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "online": return "bg-green-400";
      case "busy": return "bg-yellow-400";
      default: return "bg-gray-300";
    }
  };
  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
    const token = resolveAuthToken();

    try {
      await fetch(API_UPDATE_CHAT_ROOM(roomId), {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ deletedBy: "ADMIN" }),
      });
    } catch (error) { console.error(error); return; }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LS_KEY_REMOVED + roomId);
      window.localStorage.removeItem(LS_KEY_ROOM_MEMBERS + roomId);
    }
    removeChatClearedAt(roomId);
    setAllRooms((prev) => prev.filter((u) => u._id !== deletedId));
    setAllMessages((prev) => prev.filter((g) => g._id !== deletedId));
    setSelectedUser((prev) => (prev?._id === deletedId ? null : prev));
    setShowDeleteConfirm(false);
    setShowGroupDetails(false);
    setShowGroupMenu(false);
    setEditGroupImagePreview(null);
  };

  const handleClearChat = async () => {
    if (!selectedUser) return;
    const roomId = selectedUser.roomId || selectedUser._id;
    const token = resolveAuthToken();
    const userId = localStorage.getItem("AdminPortalId");
    if (!token || !userId) return;

    try {
      await fetch(API_CLEAR_CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roomId, userId }),
      });
    } catch (error) { console.error("Clear chat failed:", error); return; }

    setChatClearedAt(roomId, Date.now());
    setAllMessages((prev) => prev.map((g) => (g._id === selectedUser._id ? { ...g, messages: [] } : g)));
    setAllRooms((prev) =>
      prev.map((room) =>
        room._id === selectedUser._id ? { ...room, lastMessage: { text: "", time: "" }, lastSeen: "" } : room
      )
    );
    setSelectedUser((prev) => (prev ? { ...prev, lastMessage: { text: "", time: "" } } : prev));
    setShowGroupMenu(false);
  };

  const handleDeleteChat = () => {
    if (!selectedUser) return;
    setAllMessages((prev) => prev.filter((g) => g._id !== selectedUser._id));
    setAllRooms((prev) => prev.filter((r) => r._id !== selectedUser._id));
    setShowGroupMenu(false);
    setSelectedUser(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const userId = localStorage.getItem("AdminPortalId") || "";
      await fetch(API_DELETE_MESSAGE_FOR_EVERYONE(messageId, userId), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
    } catch (error) { console.error("deleteMessageForEveryone failed:", error); return; }

    setAllMessages((prev) =>
      prev.map((g) => ({
        ...g,
        messages: g.messages.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, messages: "" } : m
        ),
      }))
    );
  };

  const handleSaveGroupDetails = () => {
    if (!selectedUser) return;
    setAllRooms((prev) =>
      prev.map((u) =>
        u._id === selectedUser._id ? { ...u, profileImage: editGroupImagePreview ?? u.profileImage } : u
      )
    );
    setSelectedUser((prev) =>
      prev ? { ...prev, profileImage: editGroupImagePreview ?? prev.profileImage } : prev
    );
    setShowGroupDetails(false);
  };

  const handleSelectRoom = (room: IUser) => {
    setSelectedUser(room);
    markRoomAsRead(room._id);
    setReadStateVersion((v) => v + 1);
    setAllRooms((prev) =>
      prev.map((r) => (r._id === room._id ? { ...r, isUnread: false, unreadCount: 0 } : r))
    );
  };

  const categoryHeading = useMemo(() => {
    if (activeCategory === "ALL") return "All Chats";
    const label = categories.find((c) => c.key === activeCategory)?.label ?? activeCategory;
    return `${label} Chats`;
  }, [activeCategory, categories]);

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <BaseLayout4>
      <AdminHeader currentSection="Messages" />

      <div className="h-[calc(100vh-80px)] flex flex-col rounded-2xl bg-[#F5F7FC] dark:bg-[#1F1F1F] p-3 md:p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h1 className="text-[16px] font-semibold text-[#010E30] dark:text-white">Messages</h1>
        </div>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 w-full overflow-hidden">
          <ConversationList
            currentUser={currentUser}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryDropdownRef={categoryDropdownRef}
            categories={categories}
            categoriesLoading={categoriesLoading}
            categoryDropdownOpen={categoryDropdownOpen}
            setCategoryDropdownOpen={setCategoryDropdownOpen}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            setSelectedUser={setSelectedUser}
            categoryHeading={categoryHeading}
            tabCounts={tabCounts}
            setShowNewGroupModal={setShowNewGroupModal}
            setShowNewChatModal={setShowNewChatModal}
            roomsLoading={roomsLoading}
            categoryRooms={categoryRooms}
            selectedUser={selectedUser}
            getPlanColor={getPlanColor}
            getStatusColor={getStatusColor}
            handleSelectRoom={handleSelectRoom}
          />

          <ChatPanel
            selectedUser={selectedUser}
            getStatusColor={getStatusColor}
            currentUser={currentUser}
            showGroupMenu={showGroupMenu}
            setShowGroupMenu={setShowGroupMenu}
            handleOpenGroupDetails={handleOpenGroupDetails}
            handleClearChat={handleClearChat}
            handleDeleteChat={handleDeleteChat}
            messagesContainerRef={messagesContainerRef}
            messagesLoading={messagesLoading}
            selectedMessages={selectedMessages}
            groupedMessages={groupedMessages}
            messagesEndRef={messagesEndRef}
            setInfoMessage={setInfoMessage}
            setReplyTo={setReplyTo}
            handleDeleteMessage={handleDeleteMessage}
            replyTo={replyTo}
            canSend={canSend}
            messageText={messageText}
            setMessageText={setMessageText}
            handleSendMessage={handleSendMessage}
          />
        </div>

        {/* MODALS */}
        <AnimatePresence>
          {showNewChatModal && (
            <NewChatModal
              key="new-chat-modal"
              category={activeCategory}
              categories={categories}
              onClose={() => setShowNewChatModal(false)}
              onSendToMember={(member, text) => startChatWithMemberAndSend(member, text)}
              getPlanColor={getPlanColor}
              fetchMembersForCategory={fetchMembersForCategory}
            />
          )}

          {showNewGroupModal && (
            <NewGroupModal
              key="new-group-modal"
              categories={categories}
              onClose={() => setShowNewGroupModal(false)}
              onCreate={handleCreateGroupFromDirectory}
              getPlanColor={getPlanColor}
              fetchMembersForCategory={fetchMembersForCategory}
            />
          )}

          {showGroupDetails && selectedUser && (
            <GroupDetailsModal
              key="group-details-modal"
              data={{
                roomId: selectedUser.roomId || selectedUser._id,
                roomCode: selectedUser.roomCode || "",
                groupName: selectedUser.userName || "",
                role: Array.isArray(selectedUser.role) ? selectedUser.role[0] || "ADMIN" : selectedUser.role,
                description: selectedUser.description || "",
                planName: selectedUser.planName || "Group",
                sendAccess: (selectedUser.sendAccess as "EVERYONE" | "ADMIN_ONLY") || (selectedUser.groupSettings === "admins" ? "ADMIN_ONLY" : "EVERYONE"),
                members: (selectedUser.members || []).map((m: any, idx: number) => ({
                  tenantId: m.tenantId || `temp-${idx}`,
                  tenantName: m.name || m.tenantName || "Unknown",
                  isSelected: m.isSelected !== undefined ? m.isSelected : true,
                })),
                memberCount: (selectedUser.members || []).filter((m: any) => m.isSelected !== false).length,
              }}
              imagePreview={editGroupImagePreview}
              showDeleteConfirm={showDeleteConfirm}
              availableTenants={[]}
              onImageChange={(file) => setEditGroupImagePreview(file ? URL.createObjectURL(file) : null)}
              onUpdateMembers={(payload) => {
                const roomId = selectedUser.roomId || selectedUser._id;
                if (payload.removeTenantIds) payload.removeTenantIds.forEach((id) => addRemovedTenant(roomId, id));
                if (payload.addTenantIds) payload.addTenantIds.forEach((id) => removeFromRemovedTenant(roomId, id));
                fetch(API_UPDATE_CHAT_ROOM(roomId), {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                }).catch((err) => console.error("Update members API failed:", err));
                setSelectedUser((prev) => prev ? {
                  ...prev,
                  members: (prev.members ?? []).map((m: any) => {
                    if (payload.removeTenantIds?.includes(m.tenantId)) return { ...m, isSelected: false };
                    if (payload.addTenantIds?.includes(m.tenantId)) return { ...m, isSelected: true };
                    return m;
                  }),
                } : prev);
              }}
              onAddMembers={(newMembers) => {
                const roomId = selectedUser.roomId || selectedUser._id;
                newMembers.forEach((nm) => removeFromRemovedTenant(roomId, nm.tenantId));
                mergeIntoRoomMembersCache(roomId, newMembers);
                setSelectedUser((prev) => {
                  if (!prev) return prev;
                  const existingIds = new Set((prev.members ?? []).map((m: any) => m.tenantId));
                  const toAdd = newMembers.filter((nm) => !existingIds.has(nm.tenantId))
                    .map((nm) => ({ name: nm.tenantName, plan: prev.planName ?? "", tenantId: nm.tenantId, isSelected: true }));
                  return { ...prev, members: [...(prev.members ?? []), ...toAdd] };
                });
              }}
              onUpdateAccess={(newAccess) => {
                const roomId = selectedUser.roomId || selectedUser._id;
                fetch(API_UPDATE_CHAT_ROOM(roomId), {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sendAccess: newAccess, updatedBy: "ADMIN" }),
                }).catch((err) => console.error("Update access API failed:", err));
                setSelectedUser((prev) => (prev ? { ...prev, sendAccess: newAccess } : prev));
              }}
              onToggleDeleteConfirm={setShowDeleteConfirm}
              onDelete={handleDeleteGroup}
              onClose={() => setShowGroupDetails(false)}
              onSave={handleSaveGroupDetails}
            />
          )}
        </AnimatePresence>

        {infoMessage && <MessageInfoModal message={infoMessage} onClose={() => setInfoMessage(null)} />}
      </div>
    </BaseLayout4>
  );
};

export default Message;