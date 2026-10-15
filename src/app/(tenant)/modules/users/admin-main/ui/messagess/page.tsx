"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { FiCheck, FiClock, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import BaseLayout4 from "../../components/BaseLayout4";
import AdminHeader from "../../components/AdminHeader";
import { GroupDetailsModal } from "./GroupDetailsModal";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import ConversationList from "./ConversationList";
import ChatPanel from "./ChatPanel";
import NewChatModal from "./forms/NewChatModal";
import NewGroupModal from "./forms/NewGroupModal";
import type {
  CategoryDef,
  CategoryKey,
  DirectoryMember,
  IMessage,
  IUser,
  RoomType,
} from "./chat-types";

const API_BASE = AppApiEndpoints.API_END_POINT;

const resolveChatSource = (): "TENANT" | "SUPER_ADMIN" => {
  if (typeof window === "undefined") return "SUPER_ADMIN";
  const explicit = (localStorage.getItem("chatSource") || "").trim().toUpperCase();
  if (explicit === "SUPER_ADMIN" || explicit === "TENANT") {
    return explicit as "TENANT" | "SUPER_ADMIN";
  }
  return window.location.pathname.toLowerCase().startsWith("/super-admin")
    ? "SUPER_ADMIN"
    : "TENANT";
};

const API_CREATE_CHAT_ROOM = `${API_BASE}/user/chat-room`;
const API_CLEAR_CHAT = `${API_BASE}${AppApiEndpoints.CHAT.CLEAR}`;
const API_MARK_CHAT_SEEN = `${API_BASE}${AppApiEndpoints.CHAT.SEEN}`;
const API_MESSAGE_SEEN_USERS = (messageId: string, userId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.MESSAGE_SEEN_USERS(messageId, userId)}`;

const ROOM_MESSAGES_PAGE_LIMIT = 10;

const API_ROOM_MESSAGES = (
  source: "TENANT" | "SUPER_ADMIN",
  roomId: string,
  userId: string,
) =>
  `${API_BASE}/user/chat/${source}/${roomId}/messages?userId=${encodeURIComponent(userId)}&page=1&limit=${ROOM_MESSAGES_PAGE_LIMIT}`;

const API_UPDATE_CHAT_ROOM = (roomId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.ROOM_BY_ID(roomId)}`;
const API_GET_GROUP_DETAILS = (roomId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.GET_GROUP_DETAILS(roomId)}`;
const API_DELETE_MESSAGE_FOR_EVERYONE = (messageId: string, userId: string) =>
  `${API_BASE}${AppApiEndpoints.CHAT.DELETE_MESSAGE_FOR_EVERYONE(messageId, userId)}`;

const postChatRoom = (tenantId: string, request: RequestInit) => {
  const headers = new Headers(request.headers);
  headers.set("tenantId", tenantId);
  return fetch(API_CREATE_CHAT_ROOM, { ...request, headers });
};

const API_GET_TENANT_ROLES = (tenantId: string) =>
  `${API_BASE}/tenant-portal/${tenantId}/roles`;

const API_GET_TENANT_USERS_BY_ROLE = (tenantId: string, role: string) =>
  `${API_BASE}/tenant/${tenantId}/users?role=${encodeURIComponent(role)}`;

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

const resolveAdminUserId = (): string => {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("AdminPortalUserId") ||
    window.localStorage.getItem("AdminPortalId") ||
    ""
  );
};

const MANDATORY_CATEGORIES: CategoryDef[] = [
  { key: "ALL", label: "All", short: "AL", rawRole: "" },
  { key: "GROUP", label: "Group", short: "GR", rawRole: "GROUP" },
  { key: "ADMIN", label: "Admin", short: "AD", rawRole: "ADMIN" },
  { key: "SUPERADMIN", label: "Super Admin", short: "SA", rawRole: "ADMIN" },
];

const ROLE_LABEL_OVERRIDES: Record<string, { label: string; short: string }> = {
  SUPERADMIN: { label: "Admin", short: "AD" },
  ACADEMICCOACH: { label: "Academic Coach", short: "AC" },
  TEACHER: { label: "Teacher", short: "TE" },
  SUPERVISOR: { label: "Supervisor", short: "SV" },
  STUDENT: { label: "Student", short: "ST" },
  ADMIN: { label: "Admin", short: "AD" },
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

const extractRoleNames = (json: unknown): string[] => {
  const roleArrays: unknown[][] = [];
  const visited = new Set<object>();
  const findRoleArrays = (value: unknown, key = "") => {
    if (!value || typeof value !== "object" || visited.has(value)) return;
    visited.add(value);
    if (Array.isArray(value)) {
      if (/roles?|rolelist|tenantroles|userroles|employeeroles|roletypes|designations/i.test(key)) {
        roleArrays.push(value);
      }
      value.forEach((item) => findRoleArrays(item));
      return;
    }
    Object.entries(value as Record<string, unknown>).forEach(([childKey, child]) => {
      if (/^(role|roleName|designation|designationName)$/i.test(childKey) && child) {
        const nestedRole = child && typeof child === "object"
          ? child as Record<string, unknown>
          : null;
        if (
          typeof child === "string" ||
          (nestedRole && ["name", "roleName", "designation", "value", "key"].some(
            (nameKey) => typeof nestedRole[nameKey] === "string"
          ))
        ) {
          roleArrays.push([child]);
        }
      }
      findRoleArrays(child, childKey);
    });
  };
  const response = json && typeof json === "object"
    ? json as Record<string, unknown>
    : {};
  if (Array.isArray(response.data)) roleArrays.push(response.data);
  findRoleArrays(json);
  const extractRoleName = (value: unknown): string => {
    if (typeof value === "string") return value.trim();
    if (!value || typeof value !== "object" || Array.isArray(value)) return "";
    const role = value as Record<string, unknown>;
    for (const key of [
      "roleName",
      "designationName",
      "designation",
      "displayName",
      "name",
      "value",
      "key",
      "roleType",
      "role",
      "title",
    ]) {
      const candidate = role[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
      if (candidate && typeof candidate === "object") {
        const nestedName = extractRoleName(candidate);
        if (nestedName) return nestedName;
      }
    }
    return "";
  };
  return Array.from(new Set(roleArrays.flatMap((roles) =>
    roles.map(extractRoleName).filter(Boolean)
  )));
};

const LS_KEY_REMOVED = "adminChatRoom.removedTenants.";
const LS_KEY_ROOM_MEMBERS = "adminChatRoom.allMembers.";
const LS_KEY_CLEARED_AT = "adminChatRoom.clearedAt.";
const LS_KEY_READ_ROOMS = "adminChatRoom.readRooms";
const LS_KEY_CREATED_ROOMS = "adminChatRoom.createdRooms.";
const LS_KEY_LAST_MSG = "adminChatRoom.lastMessage.";

const getCachedLastMessage = (
  roomId: string,
): { text: string; time: string; senderName?: string } | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(LS_KEY_LAST_MSG + roomId);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};
const setCachedLastMessage = (
  roomId: string,
  preview: { text: string; time: string; senderName?: string },
) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY_LAST_MSG + roomId, JSON.stringify(preview));
  } catch { /* ignore */ }
};

const getCreatedRoomsCache = (tenantId: string): IUser[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY_CREATED_ROOMS + tenantId);
    const rooms: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(rooms)
      ? rooms.filter((room): room is IUser =>
        Boolean(room && typeof room === "object" && typeof (room as IUser)._id === "string"),
      )
      : [];
  } catch (error) {
    console.error("Could not read cached chat rooms:", error);
    return [];
  }
};

const setCreatedRoomsCache = (tenantId: string, rooms: IUser[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY_CREATED_ROOMS + tenantId, JSON.stringify(rooms));
  } catch (error) {
    console.error("Could not save created chat rooms:", error);
  }
};

const cacheCreatedRoom = (tenantId: string, room: IUser) => {
  const rooms = getCreatedRoomsCache(tenantId);
  setCreatedRoomsCache(tenantId, [room, ...rooms.filter((existing) => existing._id !== room._id)]);
};

const removeCachedRoom = (tenantId: string, roomId: string) => {
  setCreatedRoomsCache(
    tenantId,
    getCreatedRoomsCache(tenantId).filter((room) => room._id !== roomId),
  );
};

const getChatClearedAt = (roomId: string): number | null => {
  if (typeof window === "undefined") return null;
  const value = Number(window.localStorage.getItem(LS_KEY_CLEARED_AT + roomId));
  return Number.isFinite(value) && value > 0 ? value : null;
};
const setChatClearedAt = (roomId: string, timestamp: number) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY_CLEARED_AT + roomId, String(timestamp)); } catch { /* ignore */ }
};
const removeChatClearedAt = (roomId: string) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(LS_KEY_CLEARED_AT + roomId); } catch { /* ignore */ }
};

const getRemovedTenants = (roomId: string): string[] => {
  if (typeof window === "undefined") return [];
  try { const raw = window.localStorage.getItem(LS_KEY_REMOVED + roomId); return raw ? JSON.parse(raw) : []; } catch { return []; }
};
const setRemovedTenants = (roomId: string, ids: string[]) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY_REMOVED + roomId, JSON.stringify(ids)); } catch { /* ignore */ }
};
const addRemovedTenant = (roomId: string, tenantId: string) => {
  const current = getRemovedTenants(roomId);
  if (!current.includes(tenantId)) setRemovedTenants(roomId, [...current, tenantId]);
};
const removeFromRemovedTenant = (roomId: string, tenantId: string) => {
  const current = getRemovedTenants(roomId);
  setRemovedTenants(roomId, current.filter((id) => id !== tenantId));
};

interface StoredMember { tenantId: string; tenantName: string; role?: string; isSelected?: boolean; }
const getRoomMembersCache = (roomId: string): StoredMember[] => {
  if (typeof window === "undefined") return [];
  try { const raw = window.localStorage.getItem(LS_KEY_ROOM_MEMBERS + roomId); return raw ? JSON.parse(raw) : []; } catch { return []; }
};
const setRoomMembersCache = (roomId: string, members: StoredMember[]) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY_ROOM_MEMBERS + roomId, JSON.stringify(members)); } catch { /* ignore */ }
};
const mergeIntoRoomMembersCache = (roomId: string, newMembers: StoredMember[]) => {
  const current = getRoomMembersCache(roomId);
  const map = new Map(current.map((m) => [m.tenantId, m]));
  newMembers.forEach((member) => {
    const existing = map.get(member.tenantId);
    map.set(member.tenantId, { ...existing, ...member });
  });
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
  try { window.localStorage.setItem(LS_KEY_READ_ROOMS, JSON.stringify(ids)); } catch { /* ignore */ }
};
const markRoomAsRead = (roomId: string) => {
  const current = getReadRooms();
  if (!current.includes(roomId)) setReadRooms([...current, roomId]);
};

interface IRoomMessageResponse {
  _id?: string;
  roomId?: string;
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  message?: string;
  messageType?: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: string;
  isDeleted?: boolean;
  deletedForEveryone?: boolean;
  dateLabel?: string;
  side?: "left" | "right";
  replyTo?: { messageId?: string; message?: string; senderName?: string; senderId?: string } | null;
  attachments?: { name?: string; size?: number; type?: string; url?: string }[];
}
interface IRoomMessageGroup {
  date: string;
  dateLabel: string;
  messages: IRoomMessageResponse[];
}
interface IRoomMessagesResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    source?: string;
    room?: any;
    messagesByDate?: IRoomMessageGroup[];
    messages?: IRoomMessageResponse[];
    pagination?: any;
  };
}

interface IMessageSeenUser { userId: string; name: string; seenAt: string; }
interface IMessageSeenResponse { success?: boolean; message?: string; data?: { totalSeen?: number; seenUsers?: IMessageSeenUser[] }; }

interface IMessageData { _id: string; messages: IMessage[]; }

const flattenMessageGroups = (
  groups: IRoomMessageGroup[] | undefined,
): IRoomMessageResponse[] => {
  if (!Array.isArray(groups)) return [];
  const out: IRoomMessageResponse[] = [];
  groups.forEach((group) => {
    if (Array.isArray(group?.messages)) {
      group.messages.forEach((m) => out.push({ ...m, dateLabel: m.dateLabel ?? group.dateLabel }));
    }
  });
  return out;
};

const apiMessageToLocal = (
  message: IRoomMessageResponse,
  index: number,
  roomId: string,
  receiverName: string,
): IMessage => {
  const createdDate = message.timestamp ?? message.createdAt ?? new Date().toISOString();
  const date = new Date(createdDate);
  const attachment = message.attachments?.[0];
  return {
    _id: message._id ?? `${roomId}-${index}`,
    messages: message.message ?? "",
    senderId: message.senderId ?? "",
    senderName: message.senderName ?? "",
    receiverId: roomId,
    receiverName,
    createdDate,
    dateLabel: message.dateLabel,
    time: Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    notificationStatus: "Unseen",
    isRead: false,
    status: "Active",
    isDeleted: message.isDeleted ?? message.deletedForEveryone ?? false,
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
};

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
  const raw = r?.roomId ?? r?.chatRoomId ?? r?._id ?? r?.id ?? "";
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && typeof raw.$oid === "string") return raw.$oid;
  return raw ? String(raw) : "";
};
const normalizeRoomType = (raw: any): RoomType => {
  const t = String(raw ?? "").toUpperCase();
  if (t === "SEGMENT" || t === "GROUP") return "SEGMENT";
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
        userId: String(u?.userId ?? u?._id ?? u?.id ?? ""),
        name,
        role: normalizeRoleKey(u?.role ?? fallbackRole),
        planName: u?.planName ?? u?.plan ?? u?.course ?? "",
        planId: u?.planId ?? "",
        avatarLetter: name.charAt(0).toUpperCase(),
      };
    })
    .filter((u) => Boolean(u.userId));
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
    const userId = resolveAdminUserId();
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
    userId: resolveAdminUserId() || "ADMIN_PORTAL_ID",
    userName: typeof window !== "undefined" ? localStorage.getItem("AdminPortalName") ?? "Admin" : "Admin",
    role: "Admin",
  };

  const [chatSource] = useState<"TENANT" | "SUPER_ADMIN">(() => resolveChatSource());

  const [allRooms, setAllRooms] = useState<IUser[]>([]);
  const [roomsRefreshKey, setRoomsRefreshKey] = useState(0);

  const [categories, setCategories] = useState<CategoryDef[]>(MANDATORY_CATEGORIES);
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
  const [previewsLoaded, setPreviewsLoaded] = useState(false);

  /* ⭐ Keep latest selectedUser in a ref so the fetch effect doesn't re-run
     when setSelectedUser creates a new object reference with the same _id */
  const selectedUserRef = useRef<IUser | null>(null);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);

    try {
      const tenantId = resolveTenantCode();
      const token = resolveAuthToken();

      if (!tenantId) {
        setCategories(MANDATORY_CATEGORIES);
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
      const rawRoles= extractRoleNames(json);

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
        next.some((c) => c.key === prev) ? prev : "ALL",
      );
    } catch (err: any) {
      setCategoriesError(err?.message ?? "Failed to load roles");
      setCategories(MANDATORY_CATEGORIES);
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

    const apiLast = r?.lastMessage
      ? {
        text: r.lastMessage.message ?? "",
        time: formatMessageTime(r.lastMessage.createdAt ?? r.lastMessageAt),
        senderName: r.lastMessage.senderName ?? "",
      }
      : undefined;
    const cachedLast = getCachedLastMessage(id);
    const lastMessage = !isChatCleared ? apiLast ?? cachedLast : undefined;

    const rawTenantIds: string[] = Array.isArray(r?.tenantIds)
      ? r.tenantIds.filter((x: any) => typeof x === "string" && x.trim())
      : [];
    const removedIds = getRemovedTenants(id);
    const cachedMembers = getRoomMembersCache(id);
    const cacheLookup = new Map(cachedMembers.map((member) => [member.tenantId, member]));
    const rawMembers = Array.isArray(r?.members) ? r.members : [];

    const activeMembers = rawTenantIds.map((tid) => {
      const found = rawMembers.find((m: any) => (m.tenantId || m._id || m.id) === tid);
      const cached = cacheLookup.get(tid);
      return {
        name: found?.tenantName || found?.name || cached?.tenantName || tid,
        plan: r?.planName ?? r?.course ?? "",
        tenantId: tid,
        isSelected: !removedIds.includes(tid),
        role: found?.role ?? cached?.role,
      };
    });
    const activeIds = new Set(activeMembers.map((m) => m.tenantId));
    const cachedOnlyMembers = cachedMembers
      .filter((cm) => !activeIds.has(cm.tenantId))
      .map((member) => ({
        name: member.tenantName,
        plan: r?.planName ?? "",
        tenantId: member.tenantId,
        isSelected: member.isSelected ?? false,
        role: member.role,
      }));

    const isSuperAdminSource = String(r?.source ?? "").toUpperCase() === "SUPER_ADMIN";
    let roleKey: string = isSuperAdminSource
      ? "SUPERADMIN"
      : isGroup
        ? "GROUP"
        : normalizeRoleKey(r?.role);
    if (!isSuperAdminSource && roleKey === "ADMIN") roleKey = "SUPERADMIN";

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
      plan: r?.planName ?? r?.course ?? "",
      members: [...activeMembers, ...cachedOnlyMembers],
      groupSettings: r?.sendAccess === "ADMINS" ? "admins" : "everyone",
      lastMessage,
      profileImage: null,
      roomId: id,
      roomCode: r?.roomCode ?? "",
      unreadCount: isUnread ? Math.max(rawUnread, 1) : 0,
      isUnread,
      description: r?.description ?? "",
      planName: r?.planName ?? r?.course ?? "",
      planId: r?.planId ?? "",
      roomRole: r?.role ?? (isGroup ? "GROUP" : "TENANT"),
      roomCourse: r?.course ?? r?.planName ?? "",
      sendAccess: r?.sendAccess === "ADMIN_ONLY" || r?.sendAccess === "ADMINS" ? "ADMIN_ONLY" : "EVERYONE",
    };
  }, []);

  const handleRoomsLoaded = useCallback(
    (apiRooms: unknown[], filter: string) => {
      const mapped = apiRooms
        .map((room) => mapRoomToUser(room))
        .filter((room) => Boolean(room._id));
      const tenantId = resolveTenantCode();
      const cachedRooms = tenantId ? getCreatedRoomsCache(tenantId) : [];
      const serverRoomIds = new Set(mapped.map((room) => room._id));
const fixedRoleFilter = filter === "SUPERADMIN" || filter === "ADMIN";
    const pendingCachedRooms = fixedRoleFilter
      ? []
      : cachedRooms.filter((room) =>
          !serverRoomIds.has(room._id) &&
          (filter === "GROUP"
            ? room.isGroup
            : filter === "ALL"
              ? !room.isGroup
              : !room.isGroup && room.roleKey === normalizeRoleKey(filter))
        );

      if (tenantId) setCreatedRoomsCache(tenantId, pendingCachedRooms);

      setAllRooms((prev) => {
        const prevById = new Map(prev.map((r) => [r._id, r]));
        const merged = [...pendingCachedRooms, ...mapped].map((room) => {
          const existing = prevById.get(room._id);
          if (!room.lastMessage && existing?.lastMessage) {
            return { ...room, lastMessage: existing.lastMessage };
          }
          return room;
        });
        const mergedById = new Map(merged.map((r) => [r._id, r]));
        return Array.from(mergedById.values());
      });
    },
    [mapRoomToUser],
  );

  /* ⭐ Prefetch last-message previews */
  useEffect(() => {
    if (previewsLoaded) return;
    if (allRooms.length === 0) return;

    const missing = allRooms.filter((r) => !r.lastMessage);
    if (missing.length === 0) {
      setPreviewsLoaded(true);
      return;
    }

    const token = resolveAuthToken();
    const userId = resolveAdminUserId();
    if (!token || !userId) {
      setPreviewsLoaded(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const CONCURRENCY = 6;
      const updates: Record<string, { text: string; time: string; senderName?: string }> = {};

      for (let i = 0; i < missing.length; i += CONCURRENCY) {
        const batch = missing.slice(i, i + CONCURRENCY);
        await Promise.all(
          batch.map(async (room) => {
            try {
              const roomId = room.roomId || room._id;
              const url = API_ROOM_MESSAGES(chatSource, roomId, userId);
              const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
              });
              if (!res.ok) return;
              const json: IRoomMessagesResponse = await res.json();
              const flat = flattenMessageGroups(json?.data?.messagesByDate);
              const fallback = Array.isArray(json?.data?.messages) ? json.data.messages : [];
              const list = flat.length > 0 ? flat : fallback;
              if (list.length === 0) return;
              const last = list[list.length - 1];
              const preview = {
                text: last.message ?? "",
                time: formatMessageTime(last.createdAt ?? last.timestamp),
                senderName: last.senderName ?? "",
              };
              updates[room._id] = preview;
              setCachedLastMessage(room._id, preview);
            } catch { /* silent */ }
          }),
        );
      }

      if (cancelled) return;

      if (Object.keys(updates).length > 0) {
        setAllRooms((prev) =>
          prev.map((r) => (updates[r._id] ? { ...r, lastMessage: updates[r._id] } : r)),
        );
      }
      setPreviewsLoaded(true);
    })();

    return () => { cancelled = true; };
  }, [allRooms, previewsLoaded, chatSource]);

  const addCreatedRoomToList = (
    serverRoom: any,
    defaults: {
      type: "DIRECT" | "GROUP";
      name: string;
      role: string;
      members: DirectoryMember[];
    },
  ): IUser => {
    const roomId = extractRoomId(serverRoom);
    if (!roomId) throw new Error("Chat room was created, but the response did not include a room ID.");

    const room = mapRoomToUser({
      ...serverRoom,
      _id: roomId,
      type: defaults.type,
      name: defaults.type === "DIRECT" ? defaults.name : serverRoom?.name ?? defaults.name,
      role: defaults.type === "DIRECT" ? defaults.role : serverRoom?.role ?? defaults.role,
      tenantIds: Array.isArray(serverRoom?.tenantIds)
        ? serverRoom.tenantIds
        : defaults.members.map((member) => member.userId),
      members: (Array.isArray(serverRoom?.members) ? serverRoom.members : [])
        .map((member: any) => {
          const memberId = String(member?.tenantId ?? member?.userId ?? member?._id ?? member?.id ?? "");
          const directoryMember = defaults.members.find((candidate) => candidate.userId === memberId);
          return {
            ...member,
            tenantId: memberId,
            tenantName: member?.tenantName ?? member?.name ?? directoryMember?.name ?? memberId,
            role: member?.role ?? directoryMember?.role,
          };
        })
        .concat(
          defaults.members
            .filter((member) => !serverRoom?.members?.some((existing: any) =>
              String(existing?.tenantId ?? existing?.userId ?? existing?._id ?? existing?.id ?? "") === member.userId,
            ))
            .map((member) => ({
              tenantId: member.userId,
              tenantName: member.name,
              role: member.role,
            })),
        ),
    });

    const tenantId = resolveTenantCode();
    mergeIntoRoomMembersCache(
      roomId,
      room.members
        .filter((member) => Boolean(member.tenantId))
        .map((member) => ({
          tenantId: member.tenantId!,
          tenantName: member.name,
          role: member.role,
          isSelected: member.isSelected ?? true,
        })),
    );
    if (tenantId) cacheCreatedRoom(tenantId, room);
    setAllRooms((previous) => [room, ...previous.filter((existing) => existing._id !== roomId)]);
    return room;
  };

  const categoryRooms = useMemo(() => {
    let result = allRooms;

    if (activeCategory === "GROUP") {
      result = result.filter(
        (r) => r.roomType === "SEGMENT" || r.roomType === "GLOBAL" || r.isGroup,
      );
    } else if (activeCategory === "SUPERADMIN") {
      result = result.filter((r) => r.roleKey === "SUPERADMIN");
    } else if (activeCategory !== "ALL") {
      result = result.filter((r) => !r.isGroup && r.roleKey === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.plan?.toLowerCase().includes(q) ||
          r.members?.some((m: any) => m.name.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [allRooms, activeCategory, searchQuery]);

  const tabCounts = useMemo(() => {
    void readStateVersion;
    return {
      total: categoryRooms.length,
      unread: categoryRooms.filter((r) => r.isUnread).length,
    };
  }, [categoryRooms, readStateVersion]);

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

  /* ⭐ Fetch messages only when the room _id changes. Uses selectedUserRef
     so setSelectedUser({...prev}) inside the effect doesn't re-trigger it. */
  useEffect(() => {
    const user = selectedUserRef.current;
    if (!user) return;
    setMessagesLoading(true);

    setAllMessages((prev) =>
      prev.map((g) => (g._id === user._id ? { ...g, messages: [] } : g)),
    );

    markRoomAsRead(user._id);
    setReadStateVersion((v) => v + 1);
    setAllRooms((prev) =>
      prev.map((r) => (r._id === user._id ? { ...r, isUnread: false, unreadCount: 0 } : r)),
    );

    const token = resolveAuthToken();
    const userId = resolveAdminUserId();
    if (!token || !userId) { setMessagesLoading(false); return; }

    const controller = new AbortController();
    const roomId = user.roomId || user._id;

    (async () => {
      try {
        const url = API_ROOM_MESSAGES(chatSource, roomId, userId);

        if (process.env.NODE_ENV !== "production") {
          console.log("🚨 MESSAGES-FETCH", { url });
        }

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: "no-store",
        });

        const result: IRoomMessagesResponse = await response.json();

        if (!response.ok || result.statusCode === 404) {
          throw new Error(result.message || `Fetch messages failed`);
        }

        const flat = flattenMessageGroups(result.data?.messagesByDate);
        const fallback = Array.isArray(result.data?.messages) ? result.data.messages : [];
        const rawMessages = flat.length > 0 ? flat : fallback;

        const messages = rawMessages.map((message, index) =>
          apiMessageToLocal(message, index, roomId, user.userName),
        );

        const lastMessageId = messages[messages.length - 1]?._id;
        if (lastMessageId) {
          void fetch(API_MARK_CHAT_SEEN, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ roomId, userId, messageId: lastMessageId }),
            signal: controller.signal,
          }).catch(() => { /* silent */ });
        }

        setAllMessages((prev) => {
          const others = prev.filter((g) => g._id !== user._id);
          return [...others, { _id: user._id, messages }];
        });

        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          const preview = {
            text: lastMsg.messages,
            time: lastMsg.time,
            senderName: lastMsg.senderName,
          };
          setCachedLastMessage(user._id, preview);
          setAllRooms((prev) =>
            prev.map((r) => (r._id === user._id ? { ...r, lastMessage: preview } : r)),
          );
          setSelectedUser((prev) =>
            prev && prev._id === user._id ? { ...prev, lastMessage: preview } : prev,
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch room messages:", error);
        }
      } finally {
        if (!controller.signal.aborted) setMessagesLoading(false);
      }
    })();

    return () => controller.abort();
  }, [selectedUser?._id, chatSource]);

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

  const handleMessageSent = useCallback((message: IMessage) => {
    if (!selectedUser) return;

    setAllMessages((prev) => {
      const existing = prev.find((g) => g._id === selectedUser._id);
      if (existing) {
        return prev.map((g) =>
          g._id === selectedUser._id
            ? { ...g, messages: [...g.messages, message] }
            : g,
        );
      }
      return [...prev, { _id: selectedUser._id, messages: [message] }];
    });

    const preview = {
      text: message.messages,
      time: message.time,
      senderName: message.senderName,
    };

    setCachedLastMessage(selectedUser._id, preview);

    setSelectedUser((prev) =>
      prev ? { ...prev, lastMessage: preview } : prev,
    );

    setAllRooms((prev) => {
      const target = prev.find((r) => r._id === selectedUser._id);
      if (!target) return prev;
      const updated = { ...target, lastMessage: preview };
      const rest = prev.filter((r) => r._id !== selectedUser._id);
      return [updated, ...rest];
    });
  }, [selectedUser]);

  const createDirectChat = async (member: DirectoryMember) => {
    if (member.userId === currentUser.userId) {
      throw new Error("You cannot start a chat with yourself.");
    }
    const token = resolveAuthToken();
    const tenantId = resolveTenantCode();
    if (!tenantId) throw new Error("Tenant ID not found in session.");

    try {
      const response = await postChatRoom(tenantId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: "DIRECT",
          sender: {
            userId: currentUser.userId,
            name: currentUser.userName,
            role: "ADMIN",
          },
          receivers: [{
            userId: member.userId,
            name: member.name,
            role: member.role,
          }],
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || `Create direct chat failed: HTTP ${response.status}`);
      }

      const serverRoom =
        result?.data?.room ?? result?.data?.chatRoom ?? result?.data?.data ??
        result?.data ?? result?.room ?? result;
      const room = addCreatedRoomToList(serverRoom, {
        type: "DIRECT",
        name: member.name,
        role: member.role,
        members: [member],
      });
      setSelectedUser(room);
      setRoomsRefreshKey((previous) => previous + 1);
      setShowNewChatModal(false);
    } catch (error) {
      console.error("[create direct chat] failed:", error);
      throw error;
    }
  };

  const handleCreateGroupFromDirectory = async (groupName: string, members: DirectoryMember[]) => {
    const token = resolveAuthToken();
    const tenantId = resolveTenantCode();
    if (!tenantId) throw new Error("Tenant ID not found in session.");
    const receivers = members.filter((member) => member.userId !== currentUser.userId);
    if (receivers.length === 0) throw new Error("Select at least one member other than yourself.");

    try {
      const response = await postChatRoom(tenantId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: "GROUP",
          name: groupName,
          description: "",
          sender: {
            userId: currentUser.userId,
            name: currentUser.userName,
            role: "ADMIN",
          },
          receivers: receivers.map((member) => ({
            userId: member.userId,
            name: member.name,
            role: member.role,
          })),
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || `Create group failed: HTTP ${response.status}`);
      }

      const serverRoom =
        result?.data?.room ?? result?.data?.chatRoom ?? result?.data?.data ??
        result?.data ?? result?.room ?? result;
      addCreatedRoomToList(serverRoom, {
        type: "GROUP",
        name: groupName,
        role: "GROUP",
        members: receivers,
      });
      setRoomsRefreshKey((previous) => previous + 1);
      setShowNewGroupModal(false);
      setActiveCategory("GROUP");
    } catch (error) {
      console.error("[create group] failed:", error);
      throw error;
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
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
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
      window.localStorage.removeItem(LS_KEY_LAST_MSG + roomId);
    }
    const tenantId = resolveTenantCode();
    if (tenantId) removeCachedRoom(tenantId, roomId);
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
    const userId = resolveAdminUserId();
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
        room._id === selectedUser._id ? { ...room, lastMessage: { text: "", time: "" }, lastSeen: "" } : room,
      ),
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
      const userId = resolveAdminUserId();
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
          m._id === messageId ? { ...m, isDeleted: true, messages: "" } : m,
        ),
      })),
    );
  };

  const handleSaveGroupDetails = () => {
    if (!selectedUser) return;
    setAllRooms((prev) =>
      prev.map((u) =>
        u._id === selectedUser._id ? { ...u, profileImage: editGroupImagePreview ?? u.profileImage } : u,
      ),
    );
    setSelectedUser((prev) =>
      prev ? { ...prev, profileImage: editGroupImagePreview ?? prev.profileImage } : prev,
    );
    setShowGroupDetails(false);
  };

  const handleSelectRoom = (room: IUser) => {
    setSelectedUser(room);
    markRoomAsRead(room._id);
    setReadStateVersion((v) => v + 1);
    setAllRooms((prev) =>
      prev.map((r) => (r._id === room._id ? { ...r, isUnread: false, unreadCount: 0 } : r)),
    );
  };

  const categoryHeading = useMemo(() => {
    if (activeCategory === "ALL") return "All Chats";
    const label = categories.find((c) => c.key === activeCategory)?.label ?? activeCategory;
    return `${label} Chats`;
  }, [activeCategory, categories]);

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
            onRefreshCategories={() => void fetchCategories()}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            setSelectedUser={setSelectedUser}
            categoryHeading={categoryHeading}
            tabCounts={tabCounts}
            setShowNewGroupModal={setShowNewGroupModal}
            setShowNewChatModal={setShowNewChatModal}
            roomsRefreshKey={roomsRefreshKey}
            onRoomsLoaded={handleRoomsLoaded}
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
            onMessageSent={handleMessageSent}
          />
        </div>

        <AnimatePresence>
          {showNewChatModal && (
            <NewChatModal
              key="new-chat-modal"
              category={activeCategory}
              categories={categories}
              currentUserId={currentUser.userId}
              onClose={() => setShowNewChatModal(false)}
              onCreateChat={createDirectChat}
              getPlanColor={getPlanColor}
              fetchMembersForCategory={fetchMembersForCategory}
            />
          )}

          {showNewGroupModal && (
            <NewGroupModal
              key="new-group-modal"
              categories={categories}
              currentUserId={currentUser.userId}
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
                setSelectedUser((prev) =>
                  prev
                    ? {
                      ...prev,
                      members: (prev.members ?? []).map((m: any) => {
                        if (payload.removeTenantIds?.includes(m.tenantId)) return { ...m, isSelected: false };
                        if (payload.addTenantIds?.includes(m.tenantId)) return { ...m, isSelected: true };
                        return m;
                      }),
                    }
                    : prev,
                );
              }}
              onAddMembers={(newMembers) => {
                const roomId = selectedUser.roomId || selectedUser._id;
                newMembers.forEach((nm) => removeFromRemovedTenant(roomId, nm.tenantId));
                mergeIntoRoomMembersCache(roomId, newMembers);
                setSelectedUser((prev) => {
                  if (!prev) return prev;
                  const existingIds = new Set((prev.members ?? []).map((m: any) => m.tenantId));
                  const toAdd = newMembers
                    .filter((nm) => !existingIds.has(nm.tenantId))
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