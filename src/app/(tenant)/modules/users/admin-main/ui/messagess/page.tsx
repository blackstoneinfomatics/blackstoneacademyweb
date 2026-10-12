"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheck, FiClock, FiMoreVertical, FiSearch, FiX, FiPlus,
  FiArrowLeft, FiSend,
} from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { GrAttachment } from "react-icons/gr";
import { motion, AnimatePresence } from "framer-motion";

import BaseLayout4 from "../../components/BaseLayout4";
import AdminHeader from "../../components/AdminHeader";
import { GroupDetailsModal } from "./GroupDetailsModal";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

/* ─────────────────────────────────────────────────────────────
   TOGGLE
   ───────────────────────────────────────────────────────────── */
const USE_MOCK = true;
const API_BASE = AppApiEndpoints.API_END_POINT;

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
const API_GET_GROUP_DETAILS = (roomId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.GET_GROUP_DETAILS(roomId)}`;
const API_DELETE_MESSAGE_FOR_EVERYONE = (messageId: string, userId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.DELETE_MESSAGE_FOR_EVERYONE(messageId, userId)}`;

const ROOMS_PAGE_LIMIT = 100;

/* ─────────────────────────────────────────────────────────────
   CATEGORY TYPES
   ───────────────────────────────────────────────────────────── */
type CategoryKey =
  | "ALL"
  | "SUPERADMIN"
  | "TEACHER"
  | "SUPERVISOR"
  | "ACADEMICCOACH"
  | "STUDENT"
  | "GROUP";

const CATEGORIES: { key: CategoryKey; label: string; short: string }[] = [
  { key: "ALL", label: "All", short: "AL" },
  { key: "SUPERADMIN", label: "Super Admin", short: "SA" },
  { key: "TEACHER", label: "Teacher", short: "TE" },
  { key: "SUPERVISOR", label: "Supervisor", short: "SV" },
  { key: "ACADEMICCOACH", label: "Academic Coach", short: "AC" },
  { key: "STUDENT", label: "Student", short: "ST" },
  { key: "GROUP", label: "Group", short: "GR" },
];

/* ─────────────────────────────────────────────────────────────
   DIRECTORY MOCK
   ───────────────────────────────────────────────────────────── */
interface DirectoryMember {
  _id: string;
  name: string;
  role: Exclude<CategoryKey, "ALL">;
  planName: string;
  planId: string;
  avatarLetter: string;
}

const MOCK_DIRECTORY: DirectoryMember[] = [
  { _id: "sa_1", name: "Will Jonto", role: "SUPERADMIN", planName: "Premium", planId: "plan_premium_001", avatarLetter: "W" },
  { _id: "sa_2", name: "Emma Stone", role: "SUPERADMIN", planName: "Premium", planId: "plan_premium_001", avatarLetter: "E" },
  { _id: "sa_3", name: "Daniel Park", role: "SUPERADMIN", planName: "Premium", planId: "plan_premium_001", avatarLetter: "D" },
  { _id: "tch_1", name: "Ms. Kavya", role: "TEACHER", planName: "Standard", planId: "plan_standard_001", avatarLetter: "K" },
  { _id: "tch_2", name: "Mr. Rajan", role: "TEACHER", planName: "Standard", planId: "plan_standard_001", avatarLetter: "R" },
  { _id: "tch_3", name: "Ms. Latha", role: "TEACHER", planName: "Standard", planId: "plan_standard_001", avatarLetter: "L" },
  { _id: "tch_4", name: "Mr. Arvind", role: "TEACHER", planName: "Basic", planId: "plan_basic_001", avatarLetter: "A" },
  { _id: "sup_1", name: "Mr. Vinod", role: "SUPERVISOR", planName: "Standard", planId: "plan_standard_001", avatarLetter: "V" },
  { _id: "sup_2", name: "Ms. Farah", role: "SUPERVISOR", planName: "Premium", planId: "plan_premium_001", avatarLetter: "F" },
  { _id: "sup_3", name: "Mr. Nitin", role: "SUPERVISOR", planName: "Premium", planId: "plan_premium_001", avatarLetter: "N" },
  { _id: "ac_1", name: "Ms. Shruti", role: "ACADEMICCOACH", planName: "Premium", planId: "plan_premium_001", avatarLetter: "S" },
  { _id: "ac_2", name: "Mr. Deepak", role: "ACADEMICCOACH", planName: "Standard", planId: "plan_standard_001", avatarLetter: "D" },
  { _id: "ac_3", name: "Ms. Ritu", role: "ACADEMICCOACH", planName: "Standard", planId: "plan_standard_001", avatarLetter: "R" },
  { _id: "st_1", name: "Aarav", role: "STUDENT", planName: "Basic", planId: "plan_basic_001", avatarLetter: "A" },
  { _id: "st_2", name: "Isha", role: "STUDENT", planName: "Basic", planId: "plan_basic_001", avatarLetter: "I" },
  { _id: "st_3", name: "Rohan", role: "STUDENT", planName: "Standard", planId: "plan_standard_001", avatarLetter: "R" },
  { _id: "st_4", name: "Sneha", role: "STUDENT", planName: "Standard", planId: "plan_standard_001", avatarLetter: "S" },
  { _id: "st_5", name: "Tanvi", role: "STUDENT", planName: "Standard", planId: "plan_standard_001", avatarLetter: "T" },
];

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */
const LS_KEY_REMOVED = "adminChatRoom.removedTenants.";
const LS_KEY_ROOM_MEMBERS = "adminChatRoom.allMembers.";
const LS_KEY_CLEARED_AT = "adminChatRoom.clearedAt.";
const LS_KEY_LOCAL_ROOMS = "adminChatRoom.localRooms";
const LS_KEY_LOCAL_MESSAGES = "adminChatRoom.localMessages";

const readLocalRooms = (): any[] => {
  if (typeof window === "undefined") return [];
  try { const raw = window.localStorage.getItem(LS_KEY_LOCAL_ROOMS); return raw ? JSON.parse(raw) : []; } catch { return []; }
};
const writeLocalRooms = (rooms: any[]) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY_LOCAL_ROOMS, JSON.stringify(rooms)); } catch { }
};
const appendLocalRoom = (room: any) => {
  const current = readLocalRooms();
  if (!current.some((r) => r._id === room._id)) writeLocalRooms([room, ...current]);
};
const removeLocalRoom = (roomId: string) => {
  writeLocalRooms(readLocalRooms().filter((r) => r._id !== roomId));
};
const updateLocalRoomPreview = (roomId: string, text: string, time: string, senderName: string) => {
  const next = readLocalRooms().map((r) =>
    r._id === roomId ? { ...r, lastMessage: { text, time, senderName }, lastMessageAt: new Date().toISOString() } : r
  );
  writeLocalRooms(next);
};

const readLocalMessages = (): Record<string, any[]> => {
  if (typeof window === "undefined") return {};
  try { const raw = window.localStorage.getItem(LS_KEY_LOCAL_MESSAGES); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
};
const writeLocalMessages = (all: Record<string, any[]>) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY_LOCAL_MESSAGES, JSON.stringify(all)); } catch { }
};
const appendLocalMessage = (roomId: string, msg: any) => {
  const all = readLocalMessages();
  const list = all[roomId] ?? [];
  if (!list.some((m) => m._id === msg._id)) list.push(msg);
  all[roomId] = list;
  writeLocalMessages(all);
};
const clearLocalMessages = (roomId: string) => {
  const all = readLocalMessages();
  all[roomId] = [];
  writeLocalMessages(all);
};

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
  isDeleted: boolean;
  seenAt?: string;
  replyTo?: { messageId: string; messages: string; senderName: string; senderId: string; };
  attachment?: { name: string; size: number; type: string; url?: string };
  side?: "left" | "right";
  canReply?: boolean;
}

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

interface IUser {
  profileImage: string | null;
  _id: string;
  userName: any;
  email: string;
  role: string[];
  roleKey: CategoryKey;
  status: string;
  lastSeen: string;
  isGroup: boolean;
  roomType: RoomType;
  plan: any;
  members: { name: string; plan: any; tenantId?: string; isSelected?: boolean }[];
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
const normalizeRoleKey = (raw: any): Exclude<CategoryKey, "ALL"> => {
  const r = String(raw ?? "").toUpperCase().replace(/[\s_-]/g, "");
  if (r.includes("SUPERADMIN")) return "SUPERADMIN";
  if (r.includes("ACADEMICCOACH")) return "ACADEMICCOACH";
  if (r.includes("TEACHER")) return "TEACHER";
  if (r.includes("SUPERVISOR")) return "SUPERVISOR";
  if (r.includes("STUDENT")) return "STUDENT";
  return "GROUP";
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

const ReceiptDots = ({ delivered, seen }: { delivered: boolean; seen: boolean }) => (
  <span className="ml-1 inline-flex items-center gap-[3px]">
    <span className={`inline-block h-[6px] w-[6px] rounded-full ${delivered ? "bg-white/90" : "bg-white/40"}`} />
    <span className={`inline-block h-[6px] w-[6px] rounded-full ${seen ? "bg-[#22C55E]" : "bg-white/40"}`} />
  </span>
);

/* ─────────────────────────────────────────────────────────────
   Message Menu
   ───────────────────────────────────────────────────────────── */
const MessageMenu = ({
  showInfo, showReply, showDelete, onInfo, onReply, onDelete,
}: {
  showInfo: boolean; showReply: boolean; showDelete: boolean;
  onInfo: () => void; onReply: () => void; onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-sm hover:bg-white dark:bg-[#2C2C2C]/80 dark:text-gray-300"
        aria-label="Message options">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-30 w-24 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-[#454545] dark:bg-[#2C2C2C]">
          {showInfo && <button type="button" onClick={() => { onInfo(); setOpen(false); }} className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]">Info</button>}
          {showReply && <button type="button" onClick={() => { onReply(); setOpen(false); }} className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]">Reply</button>}
          {showDelete && <button type="button" onClick={() => { onDelete(); setOpen(false); }} className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]">Delete</button>}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Message Info Modal
   ───────────────────────────────────────────────────────────── */
const MessageInfoModal = ({ message, onClose }: { message: IMessage; onClose: () => void }) => {
  const [seenUsers, setSeenUsers] = useState<IMessageSeenUser[]>([]);
  const [seenLoading, setSeenLoading] = useState(!USE_MOCK);
  const [seenError, setSeenError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK) {
      setSeenUsers([
        { userId: "u1", name: "Emma Stone", seenAt: new Date(Date.now() - 3 * 60000).toISOString() },
        { userId: "u2", name: "Daniel Park", seenAt: new Date(Date.now() - 2 * 60000).toISOString() },
      ]);
      setSeenLoading(false);
      return;
    }
    const token = localStorage.getItem("AdminAuthToken");
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

/* ═══════════════════════════════════════════════════════════════
   NEW CHAT MODAL
   ═══════════════════════════════════════════════════════════════ */
interface NewChatModalProps {
  category: CategoryKey;
  directory: DirectoryMember[];
  onClose: () => void;
  onSendToMember: (member: DirectoryMember, text: string) => void;
  getPlanColor: (plan?: string) => { bg: string; text: string; dot: string };
}

const NewChatModal = ({ category: initialCategory, directory, onClose, onSendToMember, getPlanColor }: NewChatModalProps) => {
  const startOnCategoryPicker = initialCategory === "ALL";
  const [step, setStep] = useState<"CATEGORY" | "MEMBERS">(startOnCategoryPicker ? "CATEGORY" : "MEMBERS");
  const [category, setCategory] = useState<Exclude<CategoryKey, "ALL" | "GROUP">>(
    startOnCategoryPicker || initialCategory === "GROUP" ? "TEACHER" : (initialCategory as any)
  );
  const [memberSearch, setMemberSearch] = useState("");
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const members = useMemo(() => {
    let list = directory.filter((m) => m.role === category);
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.planName.toLowerCase().includes(q));
    }
    return list;
  }, [directory, category, memberSearch]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-[460px] max-h-[92vh] bg-white dark:bg-[#2c2c2c] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F] flex items-center gap-3">
          {step === "MEMBERS" && startOnCategoryPicker && (
            <button
              onClick={() => { setStep("CATEGORY"); setMemberSearch(""); setExpandedMemberId(null); setDraft(""); }}
              aria-label="Back"
              className="h-8 w-8 flex items-center justify-center rounded-md text-[#576CBC] hover:bg-[#EEF2FB] dark:hover:bg-[#2F2F2F] transition-colors"
            >
              <FiArrowLeft size={16} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-semibold text-[#101B41] dark:text-white truncate">
              {step === "CATEGORY"
                ? "New Chat"
                : `New Chat · ${CATEGORIES.find((c) => c.key === category)?.label}`}
            </h2>
            <p className="text-[11px] text-[#8C919C] dark:text-[#B5B5B5] truncate">
              {step === "CATEGORY"
                ? "Pick a category to see members"
                : `${members.length} member${members.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 flex items-center justify-center rounded-md text-[#7C8492] hover:bg-[#F1F3F6] hover:text-[#252B3A] dark:hover:bg-[#2F2F2F] dark:hover:text-white transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#FBFBFB] dark:bg-[#2c2c2c]">
          {step === "CATEGORY" ? (
            <div className="space-y-2">
              {CATEGORIES.filter((c) => c.key !== "ALL" && c.key !== "GROUP").map((cat) => {
                const count = directory.filter((m) => m.role === cat.key).length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => { setCategory(cat.key as any); setStep("MEMBERS"); }}
                    className="w-full flex items-center gap-3 rounded-xl border border-[#EEEEEE] dark:border-[#3F3F3F] bg-white dark:bg-[#242424] px-4 py-3 text-left hover:border-[#576CBC] hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#EEF2FB] text-[#576CBC]">
                      <span className="text-[14px] font-bold">{cat.short}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#101B41] dark:text-white truncate">{cat.label}</p>
                      <p className="text-[11px] text-[#98A2B3] dark:text-[#8a8a8a] truncate">{count} member{count === 1 ? "" : "s"}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#9EA3AE] flex-shrink-0">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="relative mb-3">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9EA3AE]" size={14} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-md border border-[#E6EAF2] text-[12px] bg-white dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A] outline-none focus:border-[#576CBC]"
                />
              </div>
              {members.length === 0 ? (
                <p className="py-8 text-center text-[11px] text-[#9A9EA8] dark:text-[#8a8a8a]">No members found</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => {
                    const isExpanded = expandedMemberId === member._id;
                    const planColor = getPlanColor(member.planName);
                    return (
                      <div
                        key={member._id}
                        className={`rounded-xl border bg-white dark:bg-[#242424] overflow-hidden transition-all ${isExpanded ? "border-[#576CBC] shadow-sm" : "border-[#EEEEEE] dark:border-[#3F3F3F]"}`}
                      >
                        <button
                          onClick={() => { setExpandedMemberId(isExpanded ? null : member._id); setDraft(""); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F7F8FC] dark:hover:bg-[#2A2A2A] transition-colors"
                        >
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-[#F3E8FF] text-[#8B5CF6]">
                            <span className="text-[13px] font-semibold">{member.avatarLetter}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12.5px] font-semibold text-[#252B3A] dark:text-white truncate">{member.name}</span>
                              {member.planName && (
                                <span className={`text-[10px] px-1.5 py-[1px] rounded flex-shrink-0 ${planColor.bg} ${planColor.text}`}>{member.planName}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#98A2B3] dark:text-[#8a8a8a] truncate mt-[2px]">Tap to send a message</p>
                          </div>
                          <span className="flex-shrink-0 text-[10px] font-semibold text-[#576CBC]">{isExpanded ? "Close" : "Message"}</span>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="border-t border-[#EEEEEE] dark:border-[#3F3F3F] bg-[#F8F9FC] dark:bg-[#2c2c2c] overflow-hidden"
                            >
                              <div className="p-2 flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder={`Message ${member.name}...`}
                                  value={draft}
                                  onChange={(e) => setDraft(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) onSendToMember(member, draft); }}
                                  autoFocus
                                  className="flex-1 h-9 px-3 rounded-md border border-[#E6EAF2] text-[12px] bg-white dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A] outline-none focus:border-[#576CBC]"
                                />
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => draft.trim() && onSendToMember(member, draft)}
                                  disabled={!draft.trim()}
                                  className={`h-9 w-9 flex items-center justify-center rounded-md ${draft.trim() ? "bg-[#576CBC] text-white" : "bg-gray-200 dark:bg-[#505050] text-gray-400 cursor-not-allowed"}`}
                                  aria-label="Send"
                                >
                                  <FiSend size={15} />
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-end gap-2 px-5 py-3 border-t border-[#F0F1F4] dark:border-[#3F3F3F]">
          <button onClick={onClose} className="h-10 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold hover:bg-[#EEF2FB] dark:hover:bg-[#2F2F2F] transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NEW GROUP MODAL — multi-category selection
   ═══════════════════════════════════════════════════════════════ */
interface NewGroupModalProps {
  directory: DirectoryMember[];
  onClose: () => void;
  onCreate: (groupName: string, memberIds: string[]) => void;
  getPlanColor: (plan?: string) => { bg: string; text: string; dot: string };
}

type GroupModalStep = "CATEGORY" | "MEMBERS";

const NewGroupModal = ({ directory, onClose, onCreate, getPlanColor }: NewGroupModalProps) => {
  const [step, setStep] = useState<GroupModalStep>("CATEGORY");
  const [groupName, setGroupName] = useState("New Group");
  const [activeCategory, setActiveCategory] = useState<Exclude<CategoryKey, "ALL" | "GROUP">>("TEACHER");
  const [memberSearch, setMemberSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const members = useMemo(() => {
    let list = directory.filter((m) => m.role === activeCategory);
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.planName.toLowerCase().includes(q));
    }
    return list;
  }, [directory, activeCategory, memberSearch]);

  const toggleMember = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllInCategory = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      members.forEach((m) => next.add(m._id));
      return next;
    });
  };
  const clearAllInCategory = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      members.forEach((m) => next.delete(m._id));
      return next;
    });
  };

  const handleCreate = () => {
    const name = groupName.trim();
    if (!name) { setError("Group name is required"); return; }
    if (selected.size === 0) { setError("Select at least one member"); return; }
    setError(null);
    onCreate(name, Array.from(selected));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-[480px] max-h-[92vh] bg-white dark:bg-[#2c2c2c] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F] flex items-center gap-3">
          {step === "MEMBERS" && (
            <button
              onClick={() => { setStep("CATEGORY"); setMemberSearch(""); }}
              aria-label="Back to categories"
              className="h-8 w-8 flex items-center justify-center rounded-md text-[#576CBC] hover:bg-[#EEF2FB] dark:hover:bg-[#2F2F2F] transition-colors"
            >
              <FiArrowLeft size={16} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-semibold text-[#101B41] dark:text-white truncate">
              {step === "CATEGORY" ? "New Group" : CATEGORIES.find((c) => c.key === activeCategory)?.label}
            </h2>
            <p className="text-[11px] text-[#8C919C] dark:text-[#B5B5B5] truncate">
              {step === "CATEGORY"
                ? `${selected.size} member${selected.size === 1 ? "" : "s"} selected across categories`
                : `${members.length} member${members.length === 1 ? "" : "s"} · ${members.filter((m) => selected.has(m._id)).length} selected here`}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 flex items-center justify-center rounded-md text-[#7C8492] hover:bg-[#F1F3F6] hover:text-[#252B3A] dark:hover:bg-[#2F2F2F] dark:hover:text-white transition-colors">
            <FiX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#FBFBFB] dark:bg-[#2c2c2c]">
          <div className="mb-4">
            <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-white">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full h-10 rounded-md border border-[#E6EAF2] text-[12.5px] bg-white dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A] outline-none focus:border-[#576CBC] px-3"
            />
          </div>

          {selected.size > 0 && (
            <div className="mb-4 rounded-lg border border-[#E6EAF2] dark:border-[#3F3F3F] bg-white dark:bg-[#242424] p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-[#101B41] dark:text-white">Selected ({selected.size})</p>
                <button type="button" onClick={() => setSelected(new Set())} className="text-[10.5px] font-semibold text-[#D14343] hover:underline">Clear all</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {directory.filter((d) => selected.has(d._id)).map((d) => (
                  <span key={d._id} className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FB] dark:bg-[#2F3550] px-2 py-[3px] text-[10.5px] font-medium text-[#576CBC] dark:text-[#A8B7E8]">
                    {d.name}
                    <button type="button" onClick={() => toggleMember(d._id)} aria-label={`Remove ${d.name}`} className="text-[#576CBC] hover:text-[#D14343] dark:text-[#A8B7E8]">
                      <FiX size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {step === "CATEGORY" ? (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-[#6D7280] dark:text-[#B5B5B5] mb-1">Pick categories to add members</p>
              {CATEGORIES.filter((c) => c.key !== "ALL" && c.key !== "GROUP").map((cat) => {
                const countInCat = directory.filter((m) => m.role === cat.key).length;
                const selectedInCat = directory.filter((m) => m.role === cat.key && selected.has(m._id)).length;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => { setActiveCategory(cat.key as any); setStep("MEMBERS"); }}
                    className="w-full flex items-center gap-3 rounded-xl border border-[#EEEEEE] dark:border-[#3F3F3F] bg-white dark:bg-[#242424] px-4 py-3 text-left hover:border-[#576CBC] hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#EEF2FB] text-[#576CBC]">
                      <span className="text-[14px] font-bold">{cat.short}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#101B41] dark:text-white truncate">{cat.label}</p>
                      <p className="text-[11px] text-[#98A2B3] dark:text-[#8a8a8a] truncate">{countInCat} member{countInCat === 1 ? "" : "s"}</p>
                    </div>
                    {selectedInCat > 0 && (
                      <span className="flex-shrink-0 rounded-full bg-[#E6F0EC] text-[#2F7A5C] px-2 py-[3px] text-[10.5px] font-bold">{selectedInCat} selected</span>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#9EA3AE] flex-shrink-0">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="relative mb-2">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9EA3AE]" size={14} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-md border border-[#E6EAF2] text-[12px] bg-white dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A] outline-none focus:border-[#576CBC]"
                />
              </div>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={selectAllInCategory} className="text-[11px] font-semibold text-[#576CBC] hover:underline">Select all ({members.length})</button>
                <button type="button" onClick={clearAllInCategory} className="text-[11px] font-semibold text-[#8C919C] hover:text-[#D14343]">Clear</button>
              </div>
              {members.length === 0 ? (
                <p className="py-8 text-center text-[11px] text-[#9A9EA8] dark:text-[#8a8a8a]">No members found</p>
              ) : (
                <div className="space-y-1.5">
                  {members.map((member) => {
                    const isChecked = selected.has(member._id);
                    const planColor = getPlanColor(member.planName);
                    return (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() => toggleMember(member._id)}
                        className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all
                          ${isChecked ? "border-[#576CBC] bg-[#F4F6FB] dark:bg-[#2A3050]" : "border-[#EEEEEE] dark:border-[#3F3F3F] bg-white dark:bg-[#242424] hover:bg-[#F7F8FC] dark:hover:bg-[#2A2A2A]"}`}
                      >
                        <div className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border
                          ${isChecked ? "bg-[#576CBC] border-[#576CBC]" : "bg-white border-[#D0D5DD] dark:bg-[#343434] dark:border-[#4A4A4A]"}`}>
                          {isChecked && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-[#F3E8FF] text-[#8B5CF6]">
                          <span className="text-[13px] font-semibold">{member.avatarLetter}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12.5px] font-semibold text-[#252B3A] dark:text-white truncate">{member.name}</span>
                            {member.planName && (
                              <span className={`text-[10px] px-1.5 py-[1px] rounded flex-shrink-0 ${planColor.bg} ${planColor.text}`}>{member.planName}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#98A2B3] dark:text-[#8a8a8a] truncate mt-[2px]">
                            {CATEGORIES.find((c) => c.key === member.role)?.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-5 py-3 border-t border-[#F0F1F4] dark:border-[#3F3F3F]">
          <div className="min-w-0 flex-1">
            {error ? <span className="text-[11px] text-red-500">{error}</span> : (
              <span className="text-[11px] text-[#8C919C] dark:text-[#B5B5B5]">{selected.size} member{selected.size === 1 ? "" : "s"} selected</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="h-10 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold hover:bg-[#EEF2FB] dark:hover:bg-[#2F2F2F] transition-colors">Cancel</button>
            <button onClick={handleCreate} className="h-10 rounded-md bg-[#576CBC] text-white px-4 text-[12px] font-semibold hover:bg-[#4659a3] transition-colors">Create Group</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN
   ───────────────────────────────────────────────────────────── */
const Message = () => {
  const currentUser = {
    userId: typeof window !== "undefined" ? localStorage.getItem("AdminPortalId") ?? "ADMIN_PORTAL_ID" : "ADMIN_PORTAL_ID",
    userName: typeof window !== "undefined" ? localStorage.getItem("AdminPortalName") ?? "Admin" : "Admin",
    role: "Admin",
  };

  const [allRooms, setAllRooms] = useState<IUser[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

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

  const [directory] = useState<DirectoryMember[]>(USE_MOCK ? MOCK_DIRECTORY : []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const mapRoomToUser = (r: any): IUser => {
    const id = extractRoomId(r);
    const roomType = normalizeRoomType(r?.type);
    const isGroup = roomType === "SEGMENT" || roomType === "GLOBAL";
    const clearedAt = getChatClearedAt(id);
    const lastRoomMessageAt = new Date(r?.lastMessage?.createdAt ?? r?.lastMessageAt ?? "").getTime();
    const hasMessageAfterClear = clearedAt !== null && Number.isFinite(lastRoomMessageAt) && lastRoomMessageAt > clearedAt;
    const isChatCleared = clearedAt !== null && !hasMessageAfterClear;
    if (hasMessageAfterClear) removeChatClearedAt(id);

    const rawTenantIds: string[] = Array.isArray(r?.tenantIds)
      ? r.tenantIds.filter((x: any) => typeof x === "string" && x.trim()) : [];
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

    const roleKey: CategoryKey = isGroup ? "GROUP" : normalizeRoleKey(r?.role);

    return {
      _id: id || `room-${Math.random().toString(36).slice(2)}`,
      userName: r?.name ?? r?.roomCode ?? "Untitled Room",
      email: "room@example.com",
      role: isGroup ? ["Group"] : ["Tenant"],
      roleKey,
      status: r?.isEnabled ? "online" : "offline",
      lastSeen: isChatCleared ? "" : r?.lastMessageAt ? formatMessageTime(r.lastMessageAt) : "recently",
      isGroup, roomType, plan: r?.planName ?? "",
      members: [...activeMembers, ...cachedOnlyMembers],
      groupSettings: r?.sendAccess === "ADMINS" ? "admins" : "everyone",
      lastMessage: !isChatCleared && r?.lastMessage
        ? { text: r.lastMessage.message ?? "", time: formatMessageTime(r.lastMessage.createdAt ?? r.lastMessageAt), senderName: r.lastMessage.senderName ?? "" }
        : undefined,
      profileImage: null,
      roomId: id,
      roomCode: r?.roomCode ?? "",
      unreadCount: r?.unreadCount ?? 0,
      isUnread: r?.isUnread ?? false,
      description: r?.description ?? "",
      planName: r?.planName ?? "",
      planId: r?.planId ?? "",
      sendAccess: r?.sendAccess === "ADMIN_ONLY" || r?.sendAccess === "ADMINS" ? "ADMIN_ONLY" : "EVERYONE",
    };
  };

  const fetchRooms = async () => {
    setRoomsLoading(true);

    const localRaw = readLocalRooms();
    const mappedLocal = localRaw.map(mapRoomToUser).filter((r: any) => r._id);

    if (USE_MOCK) {
      setAllRooms(mappedLocal);
      setRoomsLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem("AdminPortalId") || "";
      const tenantId = localStorage.getItem("tenantId") || "";
      const token = localStorage.getItem("AdminAuthToken");
      const res = await fetch(
        `${API_LIST_CHAT_ROOMS}?page=1&limit=${ROOMS_PAGE_LIMIT}&userId=${userId}&tenantId=${tenantId}`,
        { cache: "no-store", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
      );
      const json = res.ok ? await res.json() : {};
      const data = json?.data ?? {};
      const apiRooms: any[] = Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : [];
      const mappedApi = apiRooms.map(mapRoomToUser).filter((r: any) => r._id);

      const seen = new Set(mappedLocal.map((r) => r._id));
      const merged = [...mappedLocal, ...mappedApi.filter((r) => !seen.has(r._id))];
      setAllRooms(merged);
    } catch (err) {
      console.error("fetchRooms failed:", err);
      setAllRooms(mappedLocal);
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const categoryRooms = useMemo(() => {
    let result = allRooms.filter(hasAnyMessage);

    if (activeCategory === "GROUP") {
      result = result.filter((r) => r.roomType === "SEGMENT" || r.roomType === "GLOBAL" || r.isGroup);
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

  useEffect(() => {
    if (!selectedUser) return;
    if (!selectedUser.isGroup && !selectedUser.role.includes("Group")) return;
    if (USE_MOCK) return;
    const roomId = selectedUser.roomId || selectedUser._id;
    const token = localStorage.getItem("AdminAuthToken");
    const currentSelectedId = selectedUser._id;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(API_GET_GROUP_DETAILS(roomId), {
          cache: "no-store",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
          isSelected: removedIds.includes(m.tenantId || m._id) ? false : (m.isSelected !== undefined ? m.isSelected : true),
        }));
        mergeIntoRoomMembersCache(roomId, freshMembers.map((m) => ({ tenantId: m.tenantId, tenantName: m.name })));
        setSelectedUser((prev) => (prev && prev._id === currentSelectedId ? { ...prev, members: freshMembers } : prev));
      } catch (err) { if (!controller.signal.aborted) console.error(err); }
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?._id, selectedUser?.isGroup]);

  useEffect(() => {
    if (!selectedUser) return;
    setMessagesLoading(true);

    const localAll = readLocalMessages();
    const localRaw = localAll[selectedUser._id] ?? [];
    const localAdminId = currentUser.userId || "ADMIN_PORTAL_ID";
    const localMessages: IMessage[] = localRaw.map((m) => ({
      _id: m._id,
      messages: m.message,
      senderId: m.senderId === "ADMIN_PORTAL_ID" ? localAdminId : m.senderId,
      senderName: m.senderName,
      receiverId: selectedUser._id,
      receiverName: selectedUser.userName,
      createdDate: m.createdAt,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      notificationStatus: "Unseen",
      isRead: false,
      status: "Active",
      deliveredAt: m.createdAt,
      seenAt: m.side === "right" ? m.createdAt : undefined,
      isDeleted: m.isDeleted,
      side: m.side,
      canReply: true,
      replyTo: m.replyTo,
    }));

    if (localMessages.length > 0 || USE_MOCK) {
      setAllMessages((prev) => [
        ...prev.filter((g) => g._id !== selectedUser._id),
        { _id: selectedUser._id, messages: localMessages },
      ]);
      setTimeout(() => setMessagesLoading(false), 100);
      return;
    }

    const token = localStorage.getItem("AdminAuthToken");
    const userId = localStorage.getItem("AdminPortalId");
    if (!token || !userId) { setMessagesLoading(false); return; }
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(API_ROOM_MESSAGES(selectedUser._id, userId), {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, cache: "no-store",
        });
        const result: IRoomMessagesResponse = await response.json();
        if (!response.ok || result.success === false) throw new Error(result.message || `Fetch messages failed`);
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
            time: Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            notificationStatus: "Unseen", isRead: false, status: "Active",
            isDeleted: message.isDeleted ?? false, side: message.side,
            replyTo: message.replyTo ? {
              messageId: message.replyTo.messageId ?? "",
              messages: message.replyTo.message ?? "",
              senderName: message.replyTo.senderName ?? "",
              senderId: message.replyTo.senderId ?? "",
            } : undefined,
            attachment: attachment ? {
              name: attachment.name ?? "Attachment",
              size: attachment.size ?? 0,
              type: attachment.type ?? "application/octet-stream",
              url: attachment.url,
            } : undefined,
          };
        });
        const lastMessageId = messages[messages.length - 1]?._id;
        if (lastMessageId) {
          void fetch(API_MARK_CHAT_SEEN, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ roomId: selectedUser._id, userId, messageId: lastMessageId }),
            signal: controller.signal,
          }).catch((e) => { if (!controller.signal.aborted) console.error(e); });
        }
        setAllMessages((prev) => [...prev.filter((g) => g._id !== selectedUser._id), { _id: selectedUser._id, messages }]);
      } catch (error) {
        if (!controller.signal.aborted) console.error("Failed to fetch room messages:", error);
      } finally { if (!controller.signal.aborted) setMessagesLoading(false); }
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

    let createdMessageId: string | undefined;

    if (!USE_MOCK) {
      const token = localStorage.getItem("AdminAuthToken");
      try {
        const response = await fetch(API_SEND_CHAT_MESSAGE, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            roomId: selectedUser._id,
            senderId, senderName,
            senderRole: "ADMIN",
            messageType: "TEXT",
            message: text,
          }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.success === false) throw new Error(result?.message || "Send failed");
        const candidates: unknown[] = [result?.data?.message?._id, result?.data?.messageId, result?.data?._id, result?.message?._id, result?.messageId, result?._id];
        createdMessageId = candidates.find((v): v is string => typeof v === "string" && /^[a-f\d]{24}$/i.test(v));
      } catch (error) {
        console.error("Send message failed:", error);
        return error instanceof Error ? error.message : "Message could not be sent.";
      }
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMessage: IMessage = {
      _id: createdMessageId ?? `local-${Date.now()}`,
      messages: text,
      senderId, senderName,
      receiverId: selectedUser._id,
      receiverName: selectedUser.userName,
      createdDate: now.toISOString(),
      time: timeStr,
      notificationStatus: "Unseen", isRead: false, status: "Active",
      deliveredAt: timeStr, isDeleted: false, side: "right",
      canReply: true,
    };

    appendLocalMessage(selectedUser._id, {
      _id: newMessage._id,
      senderId,
      senderName,
      message: text,
      createdAt: now.toISOString(),
      side: "right",
      isDeleted: false,
    });
    updateLocalRoomPreview(selectedUser._id, text, timeStr, senderName);

    setAllMessages((prev) => {
      const existing = prev.find((g) => g._id === selectedUser._id);
      if (existing) return prev.map((g) => (g._id === selectedUser._id ? { ...g, messages: [...g.messages, newMessage] } : g));
      return [...prev, { _id: selectedUser._id, messages: [newMessage] }];
    });
    setSelectedUser((prev) => prev ? { ...prev, lastMessage: { text, time: timeStr, senderName } } : prev);
    setAllRooms((prev) => prev.map((r) => (r._id === selectedUser._id ? { ...r, lastMessage: { text, time: timeStr, senderName } } : r)));
    setMessageText("");
    return null;
  };

  const startChatWithMemberAndSend = async (member: DirectoryMember, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const roomId = `room_direct_${member._id}`;
    const roleKey = member.role;

    const rawRoom = {
      _id: roomId,
      name: member.name,
      type: "TENANT" as const,
      role: roleKey,
      planName: member.planName,
      planId: member.planId,
      sendAccess: "EVERYONE" as const,
      roomCode: "",
      description: "",
      isEnabled: true,
      unreadCount: 0,
      isUnread: false,
      tenantIds: [member._id],
      members: [{ tenantId: member._id, tenantName: member.name }],
      lastMessage: { message: trimmed, createdAt: new Date().toISOString(), senderName: currentUser.userName },
      lastMessageAt: new Date().toISOString(),
    };

    appendLocalRoom(rawRoom);
    appendLocalMessage(roomId, {
      _id: `local-${Date.now()}`,
      senderId: currentUser.userId,
      senderName: currentUser.userName,
      message: trimmed,
      createdAt: new Date().toISOString(),
      side: "right",
      isDeleted: false,
    });
    mergeIntoRoomMembersCache(roomId, [{ tenantId: member._id, tenantName: member.name }]);

    const mapped = mapRoomToUser(rawRoom);
    setAllRooms((prev) => (prev.some((r) => r._id === roomId) ? prev : [{ ...mapped, lastMessage: { text: trimmed, time: formatMessageTime(rawRoom.lastMessage.createdAt), senderName: currentUser.userName } }, ...prev]));

    if (!USE_MOCK) {
      try {
        const token = localStorage.getItem("AdminAuthToken");
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
      } catch (err) { console.error("Send first message failed:", err); }
    }

    setSelectedUser({ ...mapped, lastMessage: { text: trimmed, time: formatMessageTime(rawRoom.lastMessage.createdAt), senderName: currentUser.userName } });
    setShowNewChatModal(false);
  };

  const handleCreateGroupFromDirectory = async (groupName: string, memberIds: string[]) => {
    const selectedMembers = directory.filter((d) => memberIds.includes(d._id));
    const roomId = `room_group_${Date.now()}`;
    const roomCode = `GR-${Math.floor(Math.random() * 9000 + 1000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const rawRoom = {
      _id: roomId,
      name: groupName,
      type: "SEGMENT" as const,
      role: "GROUP",
      planName: "",
      planId: "",
      sendAccess: "EVERYONE" as const,
      roomCode,
      description: "",
      isEnabled: true,
      unreadCount: 0,
      isUnread: false,
      tenantIds: memberIds,
      members: selectedMembers.map((m) => ({ tenantId: m._id, tenantName: m.name })),
      lastMessage: { message: "Group created", createdAt: now.toISOString(), senderName: currentUser.userName },
      lastMessageAt: now.toISOString(),
    };

    appendLocalRoom(rawRoom);
    appendLocalMessage(roomId, {
      _id: `local-${Date.now()}`,
      senderId: currentUser.userId,
      senderName: currentUser.userName,
      message: "Group created",
      createdAt: now.toISOString(),
      side: "right",
      isDeleted: false,
    });
    mergeIntoRoomMembersCache(roomId, selectedMembers.map((m) => ({ tenantId: m._id, tenantName: m.name })));

    const mapped = mapRoomToUser(rawRoom);
    setAllRooms((prev) => [{ ...mapped, lastMessage: { text: "Group created", time: timeStr, senderName: currentUser.userName } }, ...prev]);

    if (!USE_MOCK) {
      try {
        const token = localStorage.getItem("AdminAuthToken");
        await fetch(API_CREATE_CHAT_ROOM, {
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
          }),
        });
      } catch (err) { console.error("Create group API failed:", err); }
    }

    setActiveCategory("GROUP");
    setSelectedUser({ ...mapped, lastMessage: { text: "Group created", time: timeStr, senderName: currentUser.userName } });
    setShowNewGroupModal(false);
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
    if (!USE_MOCK) {
      const token = localStorage.getItem("AdminAuthToken");
      try {
        await fetch(API_UPDATE_CHAT_ROOM(roomId), {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ deletedBy: "ADMIN" }),
        });
      } catch (error) { console.error(error); return; }
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LS_KEY_REMOVED + roomId);
      window.localStorage.removeItem(LS_KEY_ROOM_MEMBERS + roomId);
    }
    removeChatClearedAt(roomId);
    removeLocalRoom(roomId);
    setAllRooms((prev) => prev.filter((u) => u._id !== deletedId));
    setAllMessages((prev) => prev.filter((g) => g._id !== deletedId));
    setSelectedUser((prev) => (prev?._id === deletedId ? null : prev));
    setShowDeleteConfirm(false); setShowGroupDetails(false); setShowGroupMenu(false); setEditGroupImagePreview(null);
  };
  const handleClearChat = async () => {
    if (!selectedUser) return;
    const roomId = selectedUser.roomId || selectedUser._id;
    if (!USE_MOCK) {
      const token = localStorage.getItem("AdminAuthToken");
      const userId = localStorage.getItem("AdminPortalId");
      if (!token || !userId) return;
      try {
        await fetch(API_CLEAR_CHAT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ roomId, userId }),
        });
      } catch (error) { console.error("Clear chat failed:", error); return; }
    }
    setChatClearedAt(roomId, Date.now());
    clearLocalMessages(roomId);
    updateLocalRoomPreview(roomId, "", "", "");
    setAllMessages((prev) => prev.map((g) => (g._id === selectedUser._id ? { ...g, messages: [] } : g)));
    const clearRoomPreview = (rooms: IUser[]) =>
      rooms.map((room) => (room._id === selectedUser._id ? { ...room, lastMessage: { text: "", time: "" }, lastSeen: "" } : room));
    setAllRooms(clearRoomPreview);
    setSelectedUser((prev) => prev ? { ...prev, lastMessage: { text: "", time: "" } } : prev);
    setShowGroupMenu(false);
  };
  const handleDeleteChat = () => {
    if (!selectedUser) return;
    removeLocalRoom(selectedUser._id);
    setAllMessages((prev) => prev.filter((g) => g._id !== selectedUser._id));
    setAllRooms((prev) => prev.filter((r) => r._id !== selectedUser._id));
    setShowGroupMenu(false);
    setSelectedUser(null);
  };
  const handleDeleteMessage = async (messageId: string) => {
    if (!USE_MOCK) {
      try {
        const userId = localStorage.getItem("AdminPortalId") || "";
        await fetch(API_DELETE_MESSAGE_FOR_EVERYONE(messageId, userId), {
          method: "DELETE", headers: { "Content-Type": "application/json" }, cache: "no-store",
        });
      } catch (error) { console.error("deleteMessageForEveryone failed:", error); return; }
    }
    setAllMessages((prev) =>
      prev.map((g) => ({
        ...g,
        messages: g.messages.map((m) => (m._id === messageId ? { ...m, isDeleted: true, messages: "" } : m)),
      }))
    );
  };
  const handleSaveGroupDetails = () => {
    if (!selectedUser) return;
    setAllRooms((prev) => prev.map((u) => (u._id === selectedUser._id ? { ...u, profileImage: editGroupImagePreview ?? u.profileImage } : u)));
    setSelectedUser((prev) => (prev ? { ...prev, profileImage: editGroupImagePreview ?? prev.profileImage } : prev));
    setShowGroupDetails(false);
  };

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
          {/* ───────── LEFT PANEL ───────── */}
          <div className="w-full md:w-[340px] md:flex-none h-full bg-white dark:bg-[#343434] rounded-lg shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] flex flex-col overflow-hidden">
            {/* User header */}
            <div className="p-3 border-b border-[#EEEEEE] dark:border-[#3F3F3F] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#E7EAF2] dark:bg-[#2c2c2c] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src="/assets/images/account.png" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-[#010E30] dark:text-white truncate">
                    {currentUser.userName}
                  </h3>
                  <p className="text-[11px] text-[#7B8190] dark:text-[#B5B5B5] truncate">
                    {currentUser.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="px-3 py-2 flex-shrink-0">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9EA3AE]" size={14} />
                <input
                  type="text"
                  placeholder="Search by keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-md border border-[#E6EAF2] text-[12px] bg-white dark:bg-[#2c2c2c] dark:text-white dark:border-[#4A4A4A] outline-none focus:border-[#576CBC]"
                />
              </div>
            </div>

            {/* Category dropdown — starts on "All" */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-[#EEEEEE] dark:border-[#3F3F3F] flex-shrink-0">
              <span className="text-[13px] font-medium text-[#101B41] dark:text-white">
                Ongoing Conversation
              </span>
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  onClick={() => setCategoryDropdownOpen((o) => !o)}
                  className="min-w-[110px] flex items-center justify-between gap-2 text-[12px] font-medium text-[#101B41] dark:text-white px-3 py-[6px] rounded-md border border-[#E6EAF2] bg-white dark:bg-[#2c2c2c] dark:border-[#4A4A4A]"
                >
                  <span className="truncate">
                    {CATEGORIES.find((c) => c.key === activeCategory)?.label ?? "All"}
                  </span>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="text-[#101B41] dark:text-white flex-shrink-0"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute right-0 top-9 z-40 w-[210px] rounded-md border border-gray-200 bg-white shadow-lg dark:bg-[#2c2c2c] dark:border-[#4A4A4A]">
                    {CATEGORIES.map((cat) => {
                      const count = allRooms.filter((r) => {
                        if (!hasAnyMessage(r)) return false;
                        if (cat.key === "GROUP")
                          return r.isGroup || r.roomType === "SEGMENT" || r.roomType === "GLOBAL";
                        if (cat.key === "ALL") return true;
                        return !r.isGroup && r.roleKey === cat.key;
                      }).length;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => {
                            setActiveCategory(cat.key);
                            setCategoryDropdownOpen(false);
                            setSelectedUser(null);
                          }}
                          className={`flex items-center justify-between gap-2 w-full text-left px-3 py-2 text-[12px] hover:bg-gray-100 dark:hover:bg-[#3A3A3A] ${activeCategory === cat.key
                            ? "text-[#576CBC] font-semibold"
                            : "text-[#101B41] dark:text-white"
                            }`}
                        >
                          <span className="truncate">{cat.label}</span>
                          {count > 0 && (
                            <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-[#EEF2FB] dark:bg-[#3A4570] text-[#576CBC] dark:text-[#A8B7E8] text-[9px] font-bold flex items-center justify-center leading-none">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Action button */}
            <div className="px-3 py-2 flex-shrink-0 border-b border-[#EEEEEE] dark:border-[#3F3F3F]">
              {activeCategory === "GROUP" ? (
                /* Group → New Group */
                <button
                  onClick={() => setShowNewGroupModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-md border border-[#576CBC] text-[#576CBC] bg-white dark:bg-transparent dark:text-[#A8B7E8] dark:border-[#3A4570] px-2.5 py-2 text-[12px] font-semibold hover:bg-[#EEF2FB] dark:hover:bg-[#2F3550] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  New Group
                </button>
              ) : activeCategory === "SUPERADMIN" ? (
                /* Super Admin → no New Chat (only one super admin exists) */
                <div className="w-full flex items-center justify-center gap-1.5 rounded-md border border-dashed border-[#E6EAF2] dark:border-[#3A4570] px-2.5 py-2 text-[11px] font-medium text-[#8C919C] dark:text-[#8a8a8a]">
                  Only one Super Admin — no new chat needed
                </div>
              ) : (
                /* Any other role category → New Chat */
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-md bg-[#576CBC] text-white px-2.5 py-2 text-[12px] font-semibold hover:bg-[#4659a3] transition-colors"
                >
                  <FiPlus size={14} />
                  {activeCategory === "ALL"
                    ? "New Chat"
                    : `New Chat · ${CATEGORIES.find((c) => c.key === activeCategory)?.label}`}
                </button>
              )}
            </div>

            {/* Room list */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {roomsLoading ? (
                <p className="py-6 text-center text-[11px] text-gray-400">Loading chats…</p>
              ) : categoryRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center px-6 py-10 h-full">
                  <div className="w-16 h-16 rounded-full bg-[#EEF2FB] dark:bg-[#2c2c2c] flex items-center justify-center mb-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#576CBC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-semibold text-[#252B3A] dark:text-white mb-1">No chats yet</p>
                  <p className="text-[11px] text-[#9A9EA8] dark:text-[#8a8a8a] mb-4 max-w-[200px]">
                    {activeCategory === "GROUP"
                      ? "Create a group to get going."
                      : activeCategory === "ALL"
                        ? "Start a new chat or create a group."
                        : `Start a new chat with a ${CATEGORIES.find((c) => c.key === activeCategory)?.label.toLowerCase()}.`}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {categoryRooms.map((room) => {
                    const planColor = getPlanColor(room.plan);
                    const isActive = selectedUser?._id === room._id;
                    return (
                      <motion.button
                        key={room._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`w-full h-[64px] flex items-center gap-3 px-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F] text-left transition-colors
                          ${isActive ? "bg-[#F4F6FB] dark:bg-[#2c2c2c]" : "hover:bg-[#F7F8FC] dark:hover:bg-[#2F2F2F]"}`}
                        onClick={() => setSelectedUser(room)}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-md flex items-center justify-center overflow-hidden bg-[#E7E8EC] dark:bg-[#242424]">
                            {room.profileImage ? (
                              <img src={room.profileImage} alt={room.userName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[13px] font-semibold text-[#9297A2] dark:text-[#B5B5B5]">
                                {room.userName?.charAt(0)?.toUpperCase() ?? "B"}
                              </span>
                            )}
                          </div>
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#343434] ${getStatusColor(room.status)}`} />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[12.5px] font-semibold text-[#252B3A] dark:text-white truncate">
                              {room.userName}
                            </span>
                            {(room.roomType === "SEGMENT" || room.roomType === "GLOBAL" || room.isGroup) && (
                              <span className="text-[10px] px-1.5 py-[1px] rounded bg-[#EEF2FB] text-[#576CBC] dark:bg-[#3A4570] dark:text-[#A8B7E8] flex-shrink-0">
                                Group
                              </span>
                            )}
                            {room.plan && (
                              <span className={`text-[10px] px-1.5 py-[1px] rounded flex-shrink-0 ${planColor.bg} ${planColor.text}`}>
                                {room.plan}
                              </span>
                            )}
                          </div>
                          <p className="text-[11.5px] truncate leading-tight text-[#989DA8] dark:text-[#8a8a8a]">
                            {room.lastMessage?.text || "No messages yet"}
                          </p>
                        </div>

                        <div className="flex-shrink-0 flex flex-col items-end justify-center gap-1 min-w-[52px]">
                          <span className="text-[10.5px] leading-none text-[#A2A6AF] dark:text-[#8a8a8a]">
                            {room.lastMessage?.time || room.lastSeen}
                          </span>
                          <span className="h-[18px]" aria-hidden="true" />
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* ───────── RIGHT PANEL ───────── */}
          <div className="flex-1 min-w-0 h-full bg-white dark:bg-[#343434] rounded-lg shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                <div className="flex-shrink-0 h-[58px] px-4 border-b border-[#EEEEEE] dark:border-[#3F3F3F] flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-md bg-[#E7E8EC] dark:bg-[#242424] flex items-center justify-center overflow-hidden">
                        {selectedUser.profileImage ? (
                          <img src={selectedUser.profileImage} alt={selectedUser.userName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[13px] font-semibold text-[#9297A2] dark:text-[#B5B5B5]">
                            {selectedUser.userName?.charAt(0)?.toUpperCase() ?? "B"}
                          </span>
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#343434] ${getStatusColor(selectedUser.status)}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-semibold text-[#252B3A] dark:text-white truncate">{selectedUser.userName}</h3>
                      {selectedUser.role.includes("Group") ? (
                        <p className="text-[10px] text-[#8C919C] dark:text-[#B5B5B5] flex items-center gap-1">
                          Members
                          <span className="rounded bg-[#E6EAF2] px-1.5 py-[1px] text-[9px] font-medium text-[#576CBC] dark:bg-[#3A4570] dark:text-[#A8B7E8]">
                            {selectedUser.members?.filter((m: any) => m.isSelected !== false).length ?? 0}
                          </span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#8C919C] dark:text-[#B5B5B5] truncate">{selectedUser.role[0]}</p>
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
                      <div className="absolute right-0 top-10 z-40 w-[130px] bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        {(selectedUser.isGroup || selectedUser.role.includes("Group")) && (
                          <button className="block w-full text-left px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200" onClick={handleOpenGroupDetails}>
                            Group Details
                          </button>
                        )}
                        <button className="block w-full text-left px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200" onClick={handleClearChat}>
                          Clear chat
                        </button>
                        <button className="block w-full text-left px-3 py-2 text-[11px] text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]" onClick={handleDeleteChat}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 bg-[#FBFBFB] dark:bg-[#2c2c2c]">
                  {messagesLoading ? (
                    <p className="py-6 text-center text-[11px] text-gray-400">Loading messages…</p>
                  ) : selectedMessages.length === 0 ? (
                    <p className="py-6 text-center text-[11px] text-gray-400">No messages yet</p>
                  ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                      <div key={date} className="mb-2">
                        <div className="flex items-center justify-center my-4">
                          <span className="text-[10px] font-medium text-[#A3A7B0] dark:text-[#8a8a8a] bg-white dark:bg-[#2c2c2c] px-3 py-1 rounded-full border border-[#EEEEEE] dark:border-[#3F3F3F]">
                            {date}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {msgs.map((msg) => {
                            const isMine = msg.side ? msg.side === "right" : msg.senderId === currentUser.userId;
                            return (
                              <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <div className="group relative max-w-[65%]">
                                  <div className={`px-3 py-2 rounded-2xl inline-block
                                    ${isMine
                                      ? msg.isDeleted
                                        ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-br-md"
                                        : "bg-[#576CBC] text-white rounded-br-md"
                                      : msg.isDeleted
                                        ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-bl-md"
                                        : "bg-white dark:bg-[#242424] text-[#252B3A] dark:text-[#E2E2E2] border border-[#EEEEEE] dark:border-[#333] rounded-bl-md"}`}>
                                    {msg.messages && (
                                      <p className="text-[12px] leading-[18px] break-words whitespace-pre-wrap">{msg.messages}</p>
                                    )}
                                    <div className={`mt-1 flex items-center justify-end gap-1 text-[10px]
                                      ${isMine ? "text-white/70" : "text-[#9B9FA8] dark:text-[#8a8a8a]"}`}>
                                      <span className="leading-none">{msg.time}</span>
                                      {isMine && <ReceiptDots delivered={!!msg.deliveredAt} seen={!!msg.seenAt} />}
                                    </div>
                                  </div>
                                  {!msg.isDeleted && (
                                    <MessageMenu
                                      showInfo={isMine}
                                      showReply={msg.canReply !== false}
                                      showDelete={isMine}
                                      onInfo={() => setInfoMessage(msg)}
                                      onReply={() => setReplyTo(msg)}
                                      onDelete={() => handleDeleteMessage(msg._id)}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex-shrink-0 border-t border-[#EEEEEE] dark:border-[#3F3F3F] p-3 bg-white dark:bg-[#343434]">
                  {replyTo && (
                    <div className="mb-2 flex items-start justify-between gap-2 rounded-md border-l-2 border-[#576CBC] bg-[#F4F6FB] dark:bg-[#2c2c2c] px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-[#576CBC]">{replyTo.senderName}</p>
                        <p className="truncate text-[11px] text-[#555D70] dark:text-[#C5C7CE]">{replyTo.messages}</p>
                      </div>
                      <button onClick={() => setReplyTo(null)} className="text-[#7C8492] hover:text-[#252B3A] dark:hover:text-white">
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                  {canSend ? (
                    <div className="flex items-center rounded-lg bg-gray-50 dark:bg-[#2c2c2c] p-1">
                      <button className="p-1.5 text-[#010E30] dark:text-[#FFFFFF] ml-1">
                        <GrAttachment size={14} />
                      </button>
                      <input
                        type="text"
                        placeholder="Type a message"
                        className="flex-1 px-2 py-1.5 text-xs bg-transparent outline-none text-[#010E30] dark:text-[#FFFFFF]"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && messageText.trim()) handleSendMessage(); }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSendMessage()}
                        disabled={!messageText.trim()}
                        className={`p-1.5 rounded-lg flex items-center ${messageText.trim() ? "bg-[#576CBC] text-white" : "bg-gray-200 dark:bg-[#505050] text-gray-400 cursor-not-allowed"}`}
                      >
                        <FaTelegramPlane size={14} />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-[#F5F6FA] dark:bg-[#2c2c2c] px-4 py-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#7C8492]">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      <span className="text-[11px] text-[#7C8492] dark:text-[#B5B5B5]">Only admins can send messages in this chat</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#EEF2FB] dark:bg-[#2c2c2c] flex items-center justify-center">
                  <FiPlus size={22} className="text-[#576CBC]" />
                </div>
                <p className="text-[13px] font-medium text-[#252B3A] dark:text-white">No conversation selected</p>
                <p className="text-[11px] text-[#9A9EA8] dark:text-[#8a8a8a] text-center max-w-[240px]">
                  Pick a category, then start a new chat or create a group.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MODALS */}
        <AnimatePresence>
          {showNewChatModal && (
            <NewChatModal
              key="new-chat-modal"
              category={activeCategory}
              directory={directory}
              onClose={() => setShowNewChatModal(false)}
              onSendToMember={(member, text) => startChatWithMemberAndSend(member, text)}
              getPlanColor={getPlanColor}
            />
          )}

          {showNewGroupModal && (
            <NewGroupModal
              key="new-group-modal"
              directory={directory}
              onClose={() => setShowNewGroupModal(false)}
              onCreate={handleCreateGroupFromDirectory}
              getPlanColor={getPlanColor}
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
              availableTenants={directory.map((d) => ({ tenantId: d._id, tenantName: d.name }))}
              onImageChange={(file) => setEditGroupImagePreview(file ? URL.createObjectURL(file) : null)}
              onUpdateMembers={(payload) => {
                const roomId = selectedUser.roomId || selectedUser._id;
                if (payload.removeTenantIds) payload.removeTenantIds.forEach((id) => addRemovedTenant(roomId, id));
                if (payload.addTenantIds) payload.addTenantIds.forEach((id) => removeFromRemovedTenant(roomId, id));
                if (!USE_MOCK) {
                  fetch(API_UPDATE_CHAT_ROOM(roomId), {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  }).catch((err) => console.error("Update members API failed:", err));
                }
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
                if (!USE_MOCK) {
                  fetch(API_UPDATE_CHAT_ROOM(roomId), {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sendAccess: newAccess, updatedBy: "ADMIN" }),
                  }).catch((err) => console.error("Update access API failed:", err));
                }
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