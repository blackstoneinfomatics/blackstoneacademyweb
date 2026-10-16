"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiMoreVertical, FiPlus, FiX, FiCheck, FiClock } from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { GrAttachment } from "react-icons/gr";
import { motion } from "framer-motion";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import type {
  ChatSource,
  IMessage,
  IUser,
  SendMessagePayload,
  SendMessageResponse,
} from "./chat-types";
import { onNewMessage, joinChatRoom, leaveChatRoom } from "@/app/utils/chat-socket";

/* ═══════════════════════════════════════════════════════════════════
   Base
   ═══════════════════════════════════════════════════════════════════ */
const API_BASE = AppApiEndpoints.API_END_POINT;

const resolveChatSource = (): ChatSource => {
  if (typeof window === "undefined") return "SUPER_ADMIN";
  const explicit = (localStorage.getItem("chatSource") || "").trim().toUpperCase();
  if (explicit === "SUPER_ADMIN" || explicit === "TENANT") return explicit as ChatSource;
  return window.location.pathname.toLowerCase().startsWith("/super-admin")
    ? "SUPER_ADMIN"
    : "TENANT";
};

const resolveAuthToken = (): string => {
  if (typeof window === "undefined") return "";
  for (const k of ["AdminAuthToken", "authToken", "token", "accessToken", "jwt"]) {
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


const resolveTenantId = (): string => {
  if (typeof window === "undefined") return "";
  for (const key of [
    "tenantId",
    "tenantCode",
    "TenantId",
    "TENANT_ID",
    "selectedTenantId",
    "TENANT_CODE",
    "currentTenantId",
    "tenant",
  ]) {
    const value = window.localStorage.getItem(key)?.trim();
    if (!value) continue;
    if (value.startsWith("{")) {
      try {
        const tenant = JSON.parse(value) as Record<string, unknown>;
        const tenantId = tenant.tenantId ?? tenant.tenantCode ?? tenant.id ?? tenant._id;
        if (tenantId) return String(tenantId);
      } catch (error) {
        console.error("[ChatPanel] Could not parse tenant ID", error);
      }
    } else {
      return value;
    }
  }
  return "";
};


/* ═══════════════════════════════════════════════════════════════════
   Local persistence helpers
   ═══════════════════════════════════════════════════════════════════ */
const LS_KEY_CLEARED_AT = "adminChatRoom.clearedAt.";
const LS_KEY_DELETED_BY = "adminChatRoom.deletedBy.";

const getClearedAt = (roomId: string): number | null => {
  if (typeof window === "undefined") return null;
  const value = Number(window.localStorage.getItem(LS_KEY_CLEARED_AT + roomId));
  return Number.isFinite(value) && value > 0 ? value : null;
};

const setClearedAt = (roomId: string, timestamp: number) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY_CLEARED_AT + roomId, String(timestamp));
  } catch { /* ignore */ }
};

const filterAfterClear = (
  messages: IMessage[],
  clearedAt: number | null,
): IMessage[] => {
  if (!clearedAt) return messages;
  return messages.filter((m) => {
    const t = new Date(m.createdDate).getTime();
    return Number.isFinite(t) && t > clearedAt;
  });
};

/* ⭐ Track who deleted each message locally */
const setDeletedBy = (
  messageId: string,
  info: { userId: string; userName: string },
) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY_DELETED_BY + messageId, JSON.stringify(info));
  } catch { /* ignore */ }
};

const getDeletedBy = (
  messageId: string,
): { userId: string; userName: string } | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY_DELETED_BY + messageId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/* ═══════════════════════════════════════════════════════════════════
   Endpoints owned by ChatPanel
   ═══════════════════════════════════════════════════════════════════ */
const API_SEND_CHAT_MESSAGE = (source: ChatSource) =>
  `${API_BASE}/user/chat/${source}/message`;

const API_MARK_CHAT_SEEN = (source: ChatSource) =>
  `${API_BASE}/user/chat/${source}/seen`;

const API_CLEAR_CHAT = (source: ChatSource) =>
  `${API_BASE}/user/chat/${source}/clear`;

const API_MESSAGE_SEEN_USERS = (
  source: ChatSource,
  messageId: string,
  currentUserId: string,
) =>
  `${API_BASE}/user/chat/${source}/message/${encodeURIComponent(messageId)}/seen/${encodeURIComponent(currentUserId)}`;

/* ⭐ DELETE /user/chat/{source}/message/{messageId}/everyone/{userId} */
const API_DELETE_MESSAGE_FOR_EVERYONE = (
  source: ChatSource,
  messageId: string,
  userId: string,
) =>
  `${API_BASE}/user/chat/${source}/message/${encodeURIComponent(messageId)}/everyone/${encodeURIComponent(userId)}`;

const API_ROOM_MESSAGES = (
  source: ChatSource,
  roomId: string,
  userId: string,
  limit = 10,
) =>
  `${API_BASE}/user/chat/${source}/${roomId}/messages?userId=${encodeURIComponent(userId)}&page=1&limit=${limit}`;

/* ═══════════════════════════════════════════════════════════════════
   Response shapes
   ═══════════════════════════════════════════════════════════════════ */
interface IRoomMessageResponse {
  _id?: string;
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: string;
  isDeleted?: boolean;
  deletedForEveryone?: boolean;
  deletedBy?: string;
  deletedByName?: string;
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
    messagesByDate?: IRoomMessageGroup[];
    messages?: IRoomMessageResponse[];
  };
}
interface IMarkSeenResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    message?: IRoomMessageResponse;
    lastMessage?: IRoomMessageResponse;
    room?: { lastMessage?: IRoomMessageResponse; lastMessageAt?: string };
    unreadCount?: number;
    [key: string]: any;
  };
}
interface ISeenUser {
  userId?: string;
  tenantId?: string;
  name?: string;
  userName?: string;
  tenantName?: string;
  seenAt?: string;
  timestamp?: string;
  [key: string]: any;
}
interface IMessageSeenResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?:
  | ISeenUser[]
  | {
    seenUsers?: ISeenUser[];
    users?: ISeenUser[];
    items?: ISeenUser[];
    list?: ISeenUser[];
    seen?: ISeenUser[];
    [key: string]: any;
  };
}

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */
const flattenMessageGroups = (
  groups: IRoomMessageGroup[] | undefined,
): IRoomMessageResponse[] => {
  if (!Array.isArray(groups)) return [];
  const out: IRoomMessageResponse[] = [];
  groups.forEach((group) => {
    if (Array.isArray(group?.messages)) {
      group.messages.forEach((m) =>
        out.push({ ...m, dateLabel: m.dateLabel ?? group.dateLabel }),
      );
    }
  });
  return out;
};

const apiMessageToLocal = (
  message: IRoomMessageResponse,
  index: number,
  roomId: string,
  receiverName: string,
  userId:string,
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
    deletedBy: message.deletedBy || "",
    deletedByName: message.deletedByName,
    side: message.senderId === userId ? 'right' : 'left',
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

const extractLastMessagePreview = (
  response: IMarkSeenResponse,
): { text: string; time: string; senderName?: string } | null => {
  const data = response?.data;
  if (!data) return null;

  const candidate =
    data.message ?? data.lastMessage ?? data.room?.lastMessage ?? undefined;

  if (candidate) {
    const createdDate = candidate.timestamp ?? candidate.createdAt ?? "";
    const date = createdDate ? new Date(createdDate) : null;
    return {
      text: candidate.message ?? "",
      time:
        date && !Number.isNaN(date.getTime())
          ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
      senderName: candidate.senderName ?? "",
    };
  }
  return null;
};

/* ═══════════════════════════════════════════════════════════════════
   UI atoms
   ═══════════════════════════════════════════════════════════════════ */
const ReceiptDots = ({ delivered, seen }: { delivered: boolean; seen: boolean }) => (
  <span className="ml-1 inline-flex items-center gap-[3px]">
    <span className={`inline-block h-[6px] w-[6px] rounded-full ${delivered ? "bg-white/90" : "bg-white/40"}`} />
    <span className={`inline-block h-[6px] w-[6px] rounded-full ${seen ? "bg-[#22C55E]" : "bg-white/40"}`} />
  </span>
);

const MessageMenu = ({
  showInfo, showReply, showDelete, onInfo, onReply, onDelete,
}: {
  showInfo: boolean; showReply: boolean; showDelete: boolean;
  onInfo: () => void; onReply: () => void; onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-sm hover:bg-white dark:bg-[#2C2C2C]/80 dark:text-gray-300"
        aria-label="Message options"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-30 w-24 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-[#454545] dark:bg-[#2C2C2C]">
          {showInfo && (
            <button type="button" onClick={() => { onInfo(); setOpen(false); }}
              className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]">
              Info
            </button>
          )}
          {showReply && (
            <button type="button" onClick={() => { onReply(); setOpen(false); }}
              className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]">
              Reply
            </button>
          )}
          {showDelete && (
            <button type="button" onClick={() => { onDelete(); setOpen(false); }}
              className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   Seen-by modal
   ═══════════════════════════════════════════════════════════════════ */
const SeenByModal = ({
  message,
  chatSource,
  onClose,
}: {
  message: IMessage;
  chatSource: ChatSource;
  onClose: () => void;
}) => {
  const [seenUsers, setSeenUsers] = useState<ISeenUser[]>([]);
  const [seenLoading, setSeenLoading] = useState(true);
  const [seenError, setSeenError] = useState<string | null>(null);

  useEffect(() => {
    const token = resolveAuthToken();
    const userId = resolveAdminUserId();
    if (!token || !userId) {
      setSeenError("Admin authentication data is missing.");
      setSeenLoading(false);
      return;
    }

    const controller = new AbortController();
    setSeenLoading(true);
    setSeenError(null);

    (async () => {
      try {
        const url = API_MESSAGE_SEEN_USERS(chatSource, message._id, userId);
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
          cache: "no-store",
        });

        const result: IMessageSeenResponse = await response.json().catch(() => ({}));
        if (!response.ok || result.success === false) {
          throw new Error(result.message || `Fetch seen users failed: HTTP ${response.status}`);
        }

        let users: ISeenUser[] = [];
        const data = result.data;
        if (Array.isArray(data)) users = data;
        else if (data && typeof data === "object") {
          const d = data as any;
          if (Array.isArray(d.seenUsers)) users = d.seenUsers;
          else if (Array.isArray(d.users)) users = d.users;
          else if (Array.isArray(d.items)) users = d.items;
          else if (Array.isArray(d.list)) users = d.list;
          else if (Array.isArray(d.seen)) users = d.seen;
        }
        setSeenUsers(users);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSeenError(error instanceof Error ? error.message : "Could not load seen info.");
        }
      } finally {
        if (!controller.signal.aborted) setSeenLoading(false);
      }
    })();

    return () => controller.abort();
  }, [message._id, chatSource]);

  const displayName = (u: ISeenUser): string =>
    u.name || u.userName || u.tenantName || u.userId || u.tenantId || "Unknown";

  const displaySeenAt = (u: ISeenUser): string => {
    const raw = u.seenAt || u.timestamp;
    if (!raw) return "";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] overflow-hidden rounded-xl border border-[#E7EAF0] bg-white shadow-2xl dark:border-[#42464D] dark:bg-[#262A30]"
      >
        <div className="flex items-center justify-between border-b border-[#ECEEF2] px-5 py-4 dark:border-[#3B4048]">
          <h3 className="mt-0.5 text-[15px] font-semibold text-[#172033] dark:text-white">Message info</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close message info"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#7C8492] transition hover:bg-[#F1F3F6] hover:text-[#172033] dark:hover:bg-[#383D45] dark:hover:text-white"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="max-h-[min(70vh,560px)] space-y-5 overflow-y-auto scrollbar-hide p-5">
          <section>
            <div className="ml-auto max-w-[88%] rounded-xl rounded-br-sm bg-[#576CBC] px-3.5 py-3 text-white shadow-sm">
              <p className="whitespace-pre-wrap break-words text-[13px] leading-5">
                {message.messages || "Attachment"}
              </p>
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
              <p role="alert" className="py-2 text-[11px] text-red-500">{seenError}</p>
            ) : seenUsers.length === 0 ? (
              <p className="py-2 text-[11px] text-[#9299A5]">Not seen yet</p>
            ) : (
              <div className="divide-y divide-[#ECEEF2] dark:divide-[#3B4048]">
                {seenUsers.map((user, idx) => {
                  const name = displayName(user);
                  const seenAt = displaySeenAt(user);
                  const key = user.userId || user.tenantId || `${name}-${idx}`;
                  return (
                    <div key={String(key)} className="flex items-center gap-3 py-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E9EEF8] text-[11px] font-semibold text-[#4863A8] dark:bg-[#343D50] dark:text-[#B5C5F1]">
                        {name.trim().charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-[#263044] dark:text-[#E7EAF0]">{name}</p>
                      </div>
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

/* ═══════════════════════════════════════════════════════════════════
   ChatPanel props
   ═══════════════════════════════════════════════════════════════════ */
interface ChatPanelProps {
  selectedUser: IUser | null;
  getStatusColor: (status: string) => string;
  currentUser: { userId: string; userName: string; role: string };
  showGroupMenu: boolean;
  setShowGroupMenu: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenGroupDetails: () => void;
  handleDeleteChat: () => void;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onMessageSent?: (message: IMessage) => void;
  onMessagesLoaded?: (roomId: string, messages: IMessage[]) => void;
  onLastMessageUpdated?: (
    roomId: string,
    preview: { text: string; time: string; senderName?: string },
  ) => void;
  onChatCleared?: (roomId: string) => void;
}

/* ═══════════════════════════════════════════════════════════════════
   ChatPanel
   ═══════════════════════════════════════════════════════════════════ */
   
const ChatPanel = ({
  selectedUser,
  getStatusColor,
  currentUser,
  showGroupMenu,
  setShowGroupMenu,
  handleOpenGroupDetails,
  handleDeleteChat,
  messagesContainerRef,
  messagesEndRef,
  onMessageSent,
  onMessagesLoaded,
  onLastMessageUpdated,
  onChatCleared,
}: ChatPanelProps) => {
  const [defaultChatSource] = useState<ChatSource>(() => resolveChatSource());
  const chatSource = selectedUser?.chatSource ?? defaultChatSource;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [groupMemberCount, setGroupMemberCount] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<IMessage | null>(null);
  const [infoMessage, setInfoMessage] = useState<IMessage | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
const userId = resolveAdminUserId();
  const roomId = selectedUser?.roomId || selectedUser?._id;
  const receiverName = selectedUser?.userName;

  useEffect(() => {
    if (
      !selectedUser
      || !(selectedUser.isGroup || selectedUser.role.includes("Group"))
      || chatSource !== "TENANT"
    ) {
      setGroupMemberCount(null);
      return;
    }

    const roomId = selectedUser.roomId || selectedUser._id;
    const tenantId = resolveTenantId();
    const userId = currentUser.userId || resolveAdminUserId();
    const token = resolveAuthToken();
    const controller = new AbortController();
    setGroupMemberCount(null);

    if (!tenantId || !userId) {
      console.warn("[ChatPanel] Cannot load group member count: tenant or user ID is missing.", {
        hasTenantId: Boolean(tenantId),
        hasUserId: Boolean(userId),
      });
      setGroupMemberCount(
        selectedUser.members?.filter((member) => member.isSelected !== false).length ?? 0,
      );
      return () => controller.abort();
    }

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    void (async () => {
      try {
        const rolesUrl = `${API_BASE}/tenant-portal/${encodeURIComponent(tenantId)}/roles`;
        const rolesResponse = await fetch(rolesUrl, {
          method: "GET",
          cache: "no-store",
          headers,
          signal: controller.signal,
        });
        if (!rolesResponse.ok) {
          throw new Error(`Could not load tenant roles (HTTP ${rolesResponse.status}).`);
        }
        const rolesResult: unknown = await rolesResponse.json();
        if (
          !rolesResult
          || typeof rolesResult !== "object"
          || !("data" in rolesResult)
          || !Array.isArray(rolesResult.data)
        ) {
          throw new Error("The tenant roles response did not contain a roles list.");
        }
        const roles = Array.from(new Set(
          rolesResult.data.filter((role): role is string => typeof role === "string" && Boolean(role.trim()))
            .map((role) => role.trim().toUpperCase()),
        ));

        const selectedMemberIds = new Set<string>();
        await Promise.all(roles.map(async (role) => {
          const query = new URLSearchParams({
            tenantId,
            userId,
            payloadUserId: userId,
            role,
            page: "1",
            limit: "100",
          });
          const membersUrl = `${API_BASE}/user/chat/${encodeURIComponent(chatSource)}/groupuser/${encodeURIComponent(roomId)}?${query.toString()}`;
          const membersResponse = await fetch(membersUrl, {
            method: "GET",
            cache: "no-store",
            headers,
            signal: controller.signal,
          });
          if (!membersResponse.ok) {
            throw new Error(`Could not load ${role} group members (HTTP ${membersResponse.status}).`);
          }
          const membersResult: unknown = await membersResponse.json();
          if (
            !membersResult
            || typeof membersResult !== "object"
            || !("data" in membersResult)
            || !membersResult.data
            || typeof membersResult.data !== "object"
            || !("members" in membersResult.data)
            || !Array.isArray(membersResult.data.members)
          ) {
            throw new Error(`The ${role} group-members response did not contain a members list.`);
          }
          for (const member of membersResult.data.members) {
            if (!member || typeof member !== "object") continue;
            const record = member as Record<string, unknown>;
            const memberId = record.userId ?? record.tenantId ?? record._id;
            if (record.isSelected === true && typeof memberId === "string" && memberId) {
              selectedMemberIds.add(memberId);
            }
          }
        }));

        if (!controller.signal.aborted) {
          setGroupMemberCount(selectedMemberIds.size);
          console.info("[ChatPanel] Group member count loaded", {
            roomId,
            roleCount: roles.length,
            memberCount: selectedMemberIds.size,
          });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("[ChatPanel] Failed to load group member count", error);
        if (!controller.signal.aborted) {
          setGroupMemberCount(
            selectedUser.members?.filter((member) => member.isSelected !== false).length ?? 0,
          );
        }
      }
    })();

    return () => controller.abort();
  }, [
    chatSource,
    currentUser.userId,
    selectedUser?._id,
    selectedUser?.isGroup,
    selectedUser?.members,
    selectedUser?.role,
    selectedUser?.roomId,
  ]);


  /* ⭐ Load thread */
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const roomId = selectedUser.roomId || selectedUser._id;
    const receiverName = selectedUser.userName;
    const token = resolveAuthToken();
    const userId = resolveAdminUserId();
    const controller = new AbortController();

    setMessagesLoading(true);
    setMessagesError(null);
    setMessages([]);

    (async () => {
      try {
        if (!token || !userId) throw new Error("Missing auth credentials.");

        const url = API_ROOM_MESSAGES(chatSource, roomId, userId);
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: "no-store",
        });

        const json: IRoomMessagesResponse = await res.json();
        if (!res.ok || json.statusCode === 404) {
          throw new Error(json.message || `Fetch messages failed`);
        }

        const flat = flattenMessageGroups(json.data?.messagesByDate);
        const fallback = Array.isArray(json.data?.messages) ? json.data.messages : [];
        const raw = flat.length > 0 ? flat : fallback;

        const all = raw.map((m, i) => apiMessageToLocal(m, i, roomId, receiverName, userId));

        const clearedAt = getClearedAt(selectedUser._id);
        const visible = filterAfterClear(all, clearedAt);

        setMessages(visible);
        onMessagesLoaded?.(selectedUser._id, visible);

        const lastId = visible[visible.length - 1]?._id;
        if (lastId) {
          try {
            const seenRes = await fetch(API_MARK_CHAT_SEEN(chatSource), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ roomId, messageId: lastId, userId }),
              signal: controller.signal,
            });

            if (seenRes.ok) {
              const seenJson: IMarkSeenResponse = await seenRes.json().catch(() => ({}));
              const preview = extractLastMessagePreview(seenJson);
              if (preview) onLastMessageUpdated?.(selectedUser._id, preview);
            }
          } catch { /* silent */ }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setMessagesError(error instanceof Error ? error.message : "Failed to load messages.");
        }
      } finally {
        if (!controller.signal.aborted) setMessagesLoading(false);
      }
    })();

    return () => controller.abort();
  }, [selectedUser?._id, chatSource, onMessagesLoaded, onLastMessageUpdated]);

  useEffect(() => {
  if (!userId || !roomId || !chatSource) return;


  const room = {
    source: chatSource,
    roomId,
  };


  // 1. Listen for new messages
  const unsubscribeMessage = onNewMessage(userId, (event) => {
    if (
      event.source !== chatSource ||
      event.roomId !== roomId
    ) {
      return;
    }


    if (!event.message || typeof event.message !== "object") {
      return;
    }


    const incoming = event.message as Parameters<
      typeof apiMessageToLocal
    >[0];


    const localMessage = apiMessageToLocal(
      incoming,
      0,
      roomId,
      receiverName,
      userId
    );
    if(localMessage.senderId != userId){
    // 2. Update the existing message state without duplicates
    setMessages((previous) => {
      if (
        previous.some(
          (message) => message._id === localMessage._id,
        )
      ) {
        return previous;
      }


      return [...previous, localMessage];
    });
  }
  });


  // 3. Join the selected chat room
  void joinChatRoom(userId, room).catch((error: unknown) => {
    console.error("Chat room join failed:", error);
  });


  // 4. Clean up when switching rooms or unmounting
  return () => {
    unsubscribeMessage();
    leaveChatRoom(userId, room);
  };
}, [userId, roomId, chatSource, receiverName]);

  /* Auto-scroll */
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, messagesContainerRef]);

  /* ⭐ Send */
  const handleSend = async () => {
    if (!selectedUser) return;

    const access =
      selectedUser.sendAccess ??
      (selectedUser.groupSettings === "admins" ? "ADMIN_ONLY" : "EVERYONE");
    const canSendLocal =
      access === "EVERYONE" ||
      String(currentUser.role || "").toUpperCase().includes("ADMIN");

    if (!canSendLocal) {
      setSendError("Only admins can send messages in this chat.");
      return;
    }

    const text = messageText.trim();
    if (!text || sending) return;

    setSending(true);
    setSendError(null);

    const token = resolveAuthToken();
    const senderId = currentUser.userId || resolveAdminUserId();
    const senderName = currentUser.userName;

    const payload: SendMessagePayload = {
      roomId: selectedUser.roomId || selectedUser._id,
      senderId,
      senderName,
      senderRole: chatSource,
      messageType: "TEXT",
      message: text,
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

    try {
      const res = await fetch(API_SEND_CHAT_MESSAGE(chatSource), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json: SendMessageResponse = await res.json().catch(() => ({}));

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Send failed: HTTP ${res.status}`);
      }

      const candidates: unknown[] = [
        json?.data?.message?._id,
        json?.data?.messageId,
        json?.data?._id,
      ];
      const createdId = candidates.find(
        (v): v is string => typeof v === "string" && /^[a-f\d]{24}$/i.test(v),
      );

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newMessage: IMessage = {
        _id: createdId ?? `local-${Date.now()}`,
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
        deletedBy: "",
        side: "right",
        canReply: true,
        ...(replyTo
          ? {
            replyTo: {
              messageId: replyTo._id,
              messages: replyTo.messages,
              senderName: replyTo.senderName,
              senderId: replyTo.senderId,
            },
          }
          : {}),
      };

      setMessages((prev) => [...prev, newMessage]);
      onMessageSent?.(newMessage);
      setMessageText("");
      setReplyTo(null);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  /* ⭐ Delete message for everyone */
  const handleDelete = async (messageId: string) => {
    if (!messageId || deletingIds.has(messageId)) return;

    const userId = resolveAdminUserId();
    const token = resolveAuthToken();

    if (!userId || !token) {
      console.warn("Delete skipped — missing token or userId");
      return;
    }

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(messageId);
      return next;
    });

    try {
      const url = API_DELETE_MESSAGE_FOR_EVERYONE(chatSource, messageId, userId);

      if (process.env.NODE_ENV !== "production") {
        console.log("🚨 DELETE-MESSAGE-FOR-EVERYONE", { url });
      }

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (process.env.NODE_ENV !== "production") {
        console.log("🚨 DELETE-MESSAGE-RESPONSE", res.status, json);
      }

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Delete failed: HTTP ${res.status}`);
      }

      /* ⭐ Record who deleted it — used to render "You deleted…" vs "Deleted by X" */
      setDeletedBy(messageId, {
        userId: currentUser.userId,
        userName: currentUser.userName,
      });

      /* Mark as deleted locally */
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
              ...m,
              isDeleted: true,
              messages: "",
              deletedBy: currentUser.userId,
              deletedByName: currentUser.userName,
            }
            : m,
        ),
      );
    } catch (error) {
      console.error("deleteMessageForEveryone failed:", error);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  /* ⭐ Clear chat (frontend-only persistence) */
  const handleClear = async () => {
    if (!selectedUser || clearing) return;

    const roomId = selectedUser.roomId || selectedUser._id;
    const token = resolveAuthToken();
    const userId = resolveAdminUserId();

    setClearing(true);

    if (token && userId) {
      try {
        await fetch(API_CLEAR_CHAT(chatSource), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roomId, userId }),
        });
      } catch { /* silent */ }
    }

    setClearedAt(selectedUser._id, Date.now());

    setMessages([]);
    setReplyTo(null);
    setSendError(null);

    onChatCleared?.(selectedUser._id);

    setClearing(false);
    setShowGroupMenu(false);
  };

  const canSend = useMemo(() => {
    if (!selectedUser) return false;
    const access =
      selectedUser.sendAccess ??
      (selectedUser.groupSettings === "admins" ? "ADMIN_ONLY" : "EVERYONE");
    if (access === "EVERYONE") return true;
    const role = String(currentUser.role || "").toUpperCase();
    return role.includes("ADMIN") || role.includes("SUPERADMIN");
  }, [selectedUser, currentUser.role]);

  const groupedMessages = useMemo(() => {
    const fmt = (value: string) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };
    return messages.reduce((acc, m) => {
      const date = m.dateLabel || fmt(m.createdDate);
      if (!acc[date]) acc[date] = [];
      acc[date].push(m);
      return acc;
    }, {} as Record<string, IMessage[]>);
  }, [messages]);

  return (
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
                      {groupMemberCount ?? "—"}
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
                  <button
                    className="block w-full text-left px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200 disabled:opacity-60"
                    onClick={handleClear}
                    disabled={clearing}
                  >
                    {clearing ? "Clearing…" : "Clear chat"}
                  </button>
                  <button className="block w-full text-left px-3 py-2 text-[11px] text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]" onClick={handleDeleteChat}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-5 py-4 bg-[#FBFBFB] dark:bg-[#2c2c2c]"
          >
            {messagesLoading ? (
              <p className="py-6 text-center text-[11px] text-gray-400">Loading messages…</p>
            ) : messagesError ? (
              <p className="py-6 text-center text-[11px] text-red-500">{messagesError}</p>
            ) : messages.length === 0 ? (
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
                      const isMine = msg.side
                        ? msg.side === "right"
                        : msg.senderId === currentUser.userId;
                      const isDeleting = deletingIds.has(msg._id);

                      /* ⭐ Compute the deleted-by label */
                      const localDeleter = getDeletedBy(msg._id);
                      const deleterName =
                        msg.deletedByName ||
                        (msg as any).deletedBy?.name ||
                        localDeleter?.userName ||
                        msg.senderName ||
                        "Unknown";

                      const deletedLabel =
                        deleterName === currentUser.userName
                          ? "You deleted this message"
                          : `Deleted by ${deleterName}`;

                      return (
                        <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className="group relative max-w-[65%]">
                            <div className={`px-3 py-2 rounded-2xl inline-block
                              ${msg.isDeleted
                                ? "bg-transparent border border-dashed border-[#D5D9E2] dark:border-[#555] rounded-br-md rounded-bl-md"
                                : isMine
                                  ? "bg-[#576CBC] text-white rounded-br-md"
                                  : "bg-white dark:bg-[#242424] text-[#252B3A] dark:text-[#E2E2E2] border border-[#EEEEEE] dark:border-[#333] rounded-bl-md"}`}>

                              {/* Reply preview — hidden once the message is deleted */}
                              {msg.replyTo && !msg.isDeleted && (
                                <div className={`mb-1.5 rounded-md border-l-2 px-2 py-1 text-[10px]
                                  ${isMine
                                    ? "border-white/50 bg-white/10 text-white/90"
                                    : "border-[#576CBC] bg-[#EEF2FB] text-[#4A5A8A] dark:bg-[#2F3550] dark:text-[#A8B7E8]"}`}>
                                  <p className="font-semibold truncate">{msg.replyTo.senderName}</p>
                                  <p className="truncate opacity-90">{msg.replyTo.messages}</p>
                                </div>
                              )}

                              {/* ⭐ Deleted placeholder OR actual message text */}
                              {msg.isDeleted ? (
                                <p className="text-[12px] italic leading-[18px] text-[#9B9FA8] dark:text-[#8a8a8a] flex items-center gap-1.5">
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="shrink-0"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                  </svg>
                                  {deletedLabel}
                                </p>
                              ) : (
                                msg.messages && (
                                  <p className="text-[12px] leading-[18px] break-words whitespace-pre-wrap">
                                    {msg.messages}
                                  </p>
                                )
                              )}

                              {/* Timestamp + receipts */}
                              <div className={`mt-1 flex items-center justify-end gap-1 text-[10px]
                                ${msg.isDeleted
                                  ? "text-[#9B9FA8] dark:text-[#8a8a8a]"
                                  : isMine
                                    ? "text-white/70"
                                    : "text-[#9B9FA8] dark:text-[#8a8a8a]"}`}>
                                <span className="leading-none">
                                  {isDeleting ? "Deleting…" : msg.time}
                                </span>
                                {isMine && !msg.isDeleted && (
                                  <ReceiptDots delivered={!!msg.deliveredAt} seen={!!msg.seenAt} />
                                )}
                              </div>
                            </div>

                            {!msg.isDeleted && !isDeleting && (
                              <MessageMenu
                                showInfo={isMine}
                                showReply={msg.canReply !== false}
                                showDelete={isMine}
                                onInfo={() => setInfoMessage(msg)}
                                onReply={() => setReplyTo(msg)}
                                onDelete={() => handleDelete(msg._id)}
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

            {sendError && <p className="mb-2 text-[11px] text-red-500">{sendError}</p>}

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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && messageText.trim() && !sending) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => void handleSend()}
                  disabled={!messageText.trim() || sending}
                  className={`p-1.5 rounded-lg flex items-center ${messageText.trim() && !sending
                    ? "bg-[#576CBC] text-white"
                    : "bg-gray-200 dark:bg-[#505050] text-gray-400 cursor-not-allowed"
                    }`}
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

      {infoMessage && (
        <SeenByModal
          message={infoMessage}
          chatSource={chatSource}
          onClose={() => setInfoMessage(null)}
        />
      )}
    </div>
  );
};

export default ChatPanel;