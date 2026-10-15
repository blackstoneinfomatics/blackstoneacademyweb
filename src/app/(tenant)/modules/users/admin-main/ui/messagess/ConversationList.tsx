"use client";

import React, { useEffect, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import type { CategoryDef, IUser } from "./chat-types";

type RoomListFilter = "ALL" | "GROUP" | "ADMIN" | "SUPERADMIN";

interface ConversationListProps {
  currentUser: { userId: string; userName: string; role: string };
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  categoryDropdownRef: React.RefObject<HTMLDivElement>;
  categories: CategoryDef[];
  categoriesLoading: boolean;
  categoryDropdownOpen: boolean;
  setCategoryDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeCategory: string;
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
  setSelectedUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  categoryHeading: string;
  tabCounts: { total: number; unread: number };
  setShowNewGroupModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowNewChatModal: React.Dispatch<React.SetStateAction<boolean>>;
  roomsRefreshKey: number;
  onRoomsLoaded: (rooms: unknown[], filter: RoomListFilter) => void;
  categoryRooms: IUser[];
  selectedUser: IUser | null;
  getPlanColor: (plan?: string) => { bg: string; text: string; dot: string };
  getStatusColor: (status: string) => string;
  handleSelectRoom: (room: IUser) => void;
}

const API_BASE = AppApiEndpoints.API_END_POINT;
const API_LIST_CHAT_ROOMS = (userId: string, filter: RoomListFilter) =>
  `${API_BASE}/user/chat-room/${encodeURIComponent(userId)}?filter=${filter}`;

const resolveTenantId = (): string => {
  const keys = [
    "tenantId", "tenantCode", "TenantId", "TENANT_ID",
    "selectedTenantId", "TENANT_CODE", "currentTenantId", "tenant",
  ];
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (!value?.trim()) continue;
    const trimmed = value.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        const tenantId = parsed.tenantId || parsed.tenantCode || parsed.id || parsed._id;
        if (tenantId) return String(tenantId);
      } catch (error) {
        console.error("Could not parse tenant information:", error);
      }
    }
    return trimmed;
  }
  return "";
};

const resolveAuthToken = (): string => {
  for (const key of ["AdminAuthToken", "authToken", "token", "accessToken", "jwt"]) {
    const value = window.localStorage.getItem(key);
    if (value?.trim()) return value.trim();
  }
  return "";
};

const ConversationList = ({
  currentUser, searchQuery, setSearchQuery, categoryDropdownRef, categories,
  categoriesLoading, categoryDropdownOpen, setCategoryDropdownOpen, activeCategory,
  setActiveCategory, setSelectedUser, categoryHeading, tabCounts,
  setShowNewGroupModal, setShowNewChatModal, roomsRefreshKey, onRoomsLoaded, categoryRooms,
  selectedUser, getPlanColor, getStatusColor, handleSelectRoom,
}: ConversationListProps) => {
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const filter: RoomListFilter = activeCategory === "GROUP"
      ? "GROUP"
      : activeCategory === "ADMIN"
        ? "ADMIN"
      : activeCategory === "SUPERADMIN"
        ? "SUPERADMIN"
        : "ALL";

    const fetchRooms = async () => {
      setRoomsLoading(true);
      setRoomsError(null);

      try {
        const tenantId = resolveTenantId();
        const userId = window.localStorage.getItem("AdminPortalUserId")
          || window.localStorage.getItem("AdminPortalId")
          || "";
        if (!tenantId) throw new Error("Tenant ID not found in session.");
        if (!userId) throw new Error("Admin user ID not found in session.");

        const token = resolveAuthToken();
        const response = await fetch(API_LIST_CHAT_ROOMS(userId, filter), {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            tenantId,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Fetch chat rooms failed: HTTP ${response.status}`);

        const result = await response.json();
        if (result?.success === false) {
          throw new Error(result.message || "Fetch chat rooms failed.");
        }
        const data = result?.data ?? {};
        const rooms: unknown[] = Array.isArray(data.chatrooms)
          ? data.chatrooms
          : Array.isArray(result?.chatrooms)
            ? result.chatrooms
            : Array.isArray(data.data)
              ? data.data
              : Array.isArray(data.items)
                ? data.items
                : [];
        onRoomsLoaded(rooms, filter);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("fetchRooms failed:", error);
        setRoomsError(error instanceof Error ? error.message : "Could not load conversations.");
      } finally {
        if (!controller.signal.aborted) setRoomsLoading(false);
      }
    };

    void fetchRooms();
    return () => controller.abort();
  }, [activeCategory, onRoomsLoaded, retryKey, roomsRefreshKey]);

  const retryRooms = () => setRetryKey((previous) => previous + 1);

  return (
    <div className="w-full md:w-[340px] md:flex-none h-full bg-white dark:bg-[#343434] rounded-lg shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] flex flex-col overflow-hidden">
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

            <div className="px-3 py-2 flex items-center justify-between border-b border-[#EEEEEE] dark:border-[#3F3F3F] flex-shrink-0">
              <span className="text-[13px] font-medium text-[#101B41] dark:text-white">
                Ongoing Conversation
              </span>
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  onClick={() => setCategoryDropdownOpen((o) => !o)}
                    disabled={categoriesLoading || categories.length === 0}
                  className="min-w-[110px] flex items-center justify-between gap-2 text-[12px] font-medium text-[#101B41] dark:text-white px-3 py-[6px] rounded-md border border-[#E6EAF2] bg-white dark:bg-[#2c2c2c] dark:border-[#4A4A4A] disabled:opacity-60"
                >
                  <span className="truncate">
                    {categories.find((c) => c.key === activeCategory)?.label ?? "All"}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="text-[#101B41] dark:text-white flex-shrink-0">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

          {categoryDropdownOpen && categories.length > 0 && (
            <div className="absolute right-0 top-9 z-40 w-[210px] rounded-md border border-gray-200 bg-white shadow-lg dark:bg-[#2c2c2c] dark:border-[#4A4A4A] max-h-[280px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    setCategoryDropdownOpen(false);
                    setSelectedUser(null);
                  }}
                  className={`flex items-center gap-2 w-full text-left px-3 py-2 text-[12px] hover:bg-gray-100 dark:hover:bg-[#3A3A3A] ${activeCategory === cat.key
                    ? "text-[#576CBC] font-semibold"
                    : "text-[#101B41] dark:text-white"}`}
                >
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-2 flex items-center justify-between border-b border-[#EEEEEE] dark:border-[#3F3F3F] flex-shrink-0">
        <span className="text-[13px] font-medium text-[#101B41] dark:text-white">
          {categoryHeading}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#8C919C] dark:text-[#B5B5B5]">
            {tabCounts.total} total
          </span>
          {tabCounts.unread > 0 && (
            <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {tabCounts.unread > 99 ? "99+" : tabCounts.unread} unread
            </span>
          )}
        </div>
      </div>

            {/* Action button */}
            <div className="px-3 py-2 flex-shrink-0 border-b border-[#EEEEEE] dark:border-[#3F3F3F]">
              {activeCategory === "GROUP" ? (
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
              ) : activeCategory === "SUPERADMIN" || activeCategory === "ADMIN" ? (
                <div className="w-full flex items-center justify-center gap-1.5 rounded-md border border-dashed border-[#E6EAF2] dark:border-[#3A4570] px-2.5 py-2 text-[11px] font-medium text-[#8C919C] dark:text-[#8a8a8a]">
                  {roomsLoading
                    ? "Loading conversations..."
                    : roomsError
                      ? "Conversations could not be loaded."
                      : categoryRooms.length === 0
                        ? `No ${activeCategory === "SUPERADMIN" ? "Super Admin" : "Admin"} conversations yet.`
                        : `${activeCategory === "SUPERADMIN" ? "Super Admin" : "Admin"} conversations`}
                </div>
              ) : (
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-md bg-[#576CBC] text-white px-2.5 py-2 text-[12px] font-semibold hover:bg-[#4659a3] transition-colors"
                >
                  <FiPlus size={14} />
                  {activeCategory === "ALL"
                    ? "New Chat"
                    : `New Chat · ${categories.find((c) => c.key === activeCategory)?.label ?? activeCategory}`}
                </button>
              )}
            </div>

            {/* Room list */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {roomsLoading ? (
                <p className="py-6 text-center text-[11px] text-gray-400">Loading chats…</p>
              ) : roomsError ? (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                  <p role="alert" className="text-[12px] text-red-500">{roomsError}</p>
                  <button
                    type="button"
                    onClick={retryRooms}
                    className="text-[11px] font-semibold text-[#576CBC] hover:underline"
                  >
                    Retry
                  </button>
                </div>
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
                        ? "Start a new chat."
                        : activeCategory === "ADMIN" || activeCategory === "SUPERADMIN"
                          ? `No ${activeCategory === "ADMIN" ? "Admin" : "Super Admin"} conversations yet.`
                        : `Start a new chat with a ${(categories.find((c) => c.key === activeCategory)?.label ?? "member").toLowerCase()}.`}
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
                        onClick={() => handleSelectRoom(room)}
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
                            {room.roomRole && (
                              <span className="text-[10px] px-1.5 py-[1px] rounded bg-[#F1F3F7] text-[#687083] dark:bg-[#3A3A3A] dark:text-[#C0C4CC] flex-shrink-0">
                                {room.roomRole}
                              </span>
                            )}
                            {(room.roomType === "GROUP" || room.roomType === "SEGMENT" || room.roomType === "GLOBAL" || room.isGroup) && (
                              <span className="text-[10px] px-1.5 py-[1px] rounded bg-[#EEF2FB] text-[#576CBC] dark:bg-[#3A4570] dark:text-[#A8B7E8] flex-shrink-0">
                                {room.roomType === "SEGMENT" ? "Segment" : "Group"}
                              </span>
                            )}
                            {room.roomType === "TENANT" && (
                              <span className={`text-[10px] px-1.5 py-[1px] rounded flex-shrink-0 ${planColor.bg} ${planColor.text}`}>
                                Course: {room.roomCourse || "N/A"}
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
                    {room.isUnread && (room.unreadCount ?? 0) > 0 ? (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#4F46E5] text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
                        {room.unreadCount > 99 ? "99+" : room.unreadCount}
                      </span>
                    ) : (
                      <span className="h-[18px]" aria-hidden="true" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ConversationList;