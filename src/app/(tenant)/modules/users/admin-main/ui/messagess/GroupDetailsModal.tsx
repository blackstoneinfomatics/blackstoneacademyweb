"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import type { CategoryDef } from "./chat-types";
interface ILocalMember {
  userId: string;
  userName: string;
  isSelected: boolean;
  role: string;
  course: string | null;
}
const API_BASE = AppApiEndpoints.API_END_POINT;
const API_GET_TENANT_ROLES = (tenantId: string) =>
    `${API_BASE}/tenant-portal/${tenantId}/roles`;
const GROUP_MEMBERS_PAGE_LIMIT = 100;
const API_GET_TENANT_USERS_BY_GROUP = (
    source: string,
    roomId: string,
    tenantId: string,
    userId: string,
    payloadUserId: string,
    role: string,
    page: number,
) => {
    const query = new URLSearchParams({
        tenantId,
        userId,
        payloadUserId,
        role,
        page: String(page),
        limit: String(GROUP_MEMBERS_PAGE_LIMIT),
    });
    return `${API_BASE}/user/chat/${encodeURIComponent(source)}/groupuser/${encodeURIComponent(roomId)}?${query}`;
};
const API_GET_GROUP_DETAILS = (source: string, roomId: string, userId: string) =>
    `${API_BASE}/user/chat/${encodeURIComponent(source)}/groups/${encodeURIComponent(roomId)}?userId=${encodeURIComponent(userId)}`;

type ChatSource = "TENANT" | "SUPER_ADMIN";

const resolveChatSource = (): ChatSource => {
    if (typeof window === "undefined") return "SUPER_ADMIN";
    const explicit = (window.localStorage.getItem("chatSource") || "").trim().toUpperCase();
    if (explicit === "SUPER_ADMIN" || explicit === "TENANT") return explicit;
    return window.location.pathname.toLowerCase().startsWith("/super-admin")
        ? "SUPER_ADMIN"
        : "TENANT";
};

const getStoredUserId = () => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("AdminPortalUserId")
        || window.localStorage.getItem("AdminPortalId")
        || "";
};

interface RoleUser {
    userId: string;
    userName: string;
    course: string | null;
    isSelected: boolean;
    role: string;
}

interface GroupMembersPagination {
    page: number;
    totalPages: number;
    totalRecords: number;
}

const getStoredTenantId = () => {
    if (typeof window === "undefined") return "";
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
                const tenant = JSON.parse(trimmed);
                const tenantId = tenant.tenantId || tenant.tenantCode || tenant.id || tenant._id;
                if (tenantId) return String(tenantId);
            } catch (error) {
                console.error("Could not parse tenant information:", error);
            }
        }
        return trimmed;
    }
    return "";
};

const getStoredAuthToken = () => {
    if (typeof window === "undefined") return "";
    for (const key of ["AdminAuthToken", "authToken", "token", "accessToken", "jwt"]) {
        const value = window.localStorage.getItem(key);
        if (value?.trim()) return value.trim();
    }
    return "";
};

const normalizeGroupRoleUsers = (response: unknown) => {
    if (!response || typeof response !== "object") {
        throw new Error("The group members response was not in the expected format.");
    }
    const payload = response as {
        data?: {
            members?: unknown;
            pagination?: Partial<GroupMembersPagination>;
        };
    };
    if (!Array.isArray(payload.data?.members)) {
        throw new Error("The group members response was not in the expected format.");
    }

    return {
        users: payload.data.members
            .filter((member): member is Record<string, unknown> => Boolean(member) && typeof member === "object")
            .map((member) => ({
                userId: String(member.userId ?? ""),
                userName: String(member.userName ?? "Unnamed"),
                course: typeof member.course === "string" ? member.course : null,
                role: String(member.role ?? ""),
                isSelected: member.isSelected === true,
            }))
            .filter((member) => Boolean(member.userId)),
        pagination: {
            page: Number(payload.data.pagination?.page) || 1,
            totalPages: Number(payload.data.pagination?.totalPages) || 1,
            totalRecords: Number(payload.data.pagination?.totalRecords) || 0,
        },
    };
};

export interface GroupDetailsData {
    roomId: string;
    roomCode: string;
    groupName: string;
    role: string;
    description: string;
    planName: string;
    sendAccess: "EVERYONE" | "ADMIN_ONLY";
    members: { tenantId: string; tenantName: string; isSelected: boolean; role?: string }[];
    memberCount: number;
}

interface ApiGroupDetails {
    roomId: string;
    roomCode: string;
    type: string;
    source: ChatSource;
    groupName: string;
    description: string;
    sendAccess: "EVERYONE" | "ADMIN_ONLY";
    canUpdate: boolean;
}

interface AvailableTenant {
    course: any;
    role: any; userId: string; userName: string; 
}

export interface GroupListItem {
    roomId: string;
    groupName: string;
    description?: string;
    planName?: string;
    roomCode?: string;
    sendAccess?: "EVERYONE" | "ADMIN_ONLY";
    memberCount: number;
    memberNames?: string[];
    imagePreview?: string | null;
}

interface GroupDetailsModalProps {
    data: GroupDetailsData;
    imagePreview: string | null;
    showDeleteConfirm: boolean;
    availableTenants?: AvailableTenant[];
    roleCategories?: CategoryDef[];
    groupList?: GroupListItem[];
    onSelectGroup?: (roomId: string) => void;
    onImageChange: (file: File | null) => void;
    onUpdateMembers: (payload: { addTenantIds?: string[]; removeTenantIds?: string[]; updatedBy: string }) => void;
    onAddMembers?: (newMembers: { userId: string; userName: string }[]) => void;
    onUpdateAccess: (access: "EVERYONE" | "ADMIN_ONLY") => void;
    onToggleDeleteConfirm: (show: boolean) => void;
    onDelete: () => void;
    onClose: () => void;
    onSave: () => void;
}

type TabKey = "DETAILS" | "ROLES";

export function GroupDetailsModal({
    data, imagePreview, showDeleteConfirm, availableTenants = [],
    onImageChange, onUpdateMembers,
    onAddMembers, onUpdateAccess, onToggleDeleteConfirm, onDelete, onClose, onSave,
}: GroupDetailsModalProps) {
    const [tab, setTab] = useState<TabKey>("DETAILS");
    const [localMembers, setLocalMembers] = useState<ILocalMember[]>([]);
    const [access, setAccess] = useState<"EVERYONE" | "ADMIN_ONLY">();
    const [groupDetails, setGroupDetails] = useState<ApiGroupDetails | null>(null);
    const [groupDetailsLoading, setGroupDetailsLoading] = useState(true);
    const [groupDetailsError, setGroupDetailsError] = useState<string | null>(null);
    const [, setShowAddDropdown] = useState(false);
    const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
    const [tenantRoles, setTenantRoles] = useState<string[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [rolesError, setRolesError] = useState<string | null>(null);
    const [roleSearch, setRoleSearch] = useState("");
    const [selectedPortalRole, setSelectedPortalRole] = useState("");
    const [roleUsers, setRoleUsers] = useState<RoleUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [roleUsersLoading, setRoleUsersLoading] = useState(false);
    const [roleUsersError, setRoleUsersError] = useState<string | null>(null);
    const [roleUsersPage, setRoleUsersPage] = useState(1);
    const [roleUsersPagination, setRoleUsersPagination] = useState<GroupMembersPagination>({
        page: 1,
        totalPages: 1,
        totalRecords: 0,
    });
    const [] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const canUpdateGroup = groupDetails?.roomId === data.roomId && groupDetails.canUpdate;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowAddDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => { setTab("DETAILS"); }, [data.roomId]);

    useEffect(() => {
        const userId = getStoredUserId();
        const source = resolveChatSource();
        const controller = new AbortController();

        setGroupDetails(null);
        setGroupDetailsError(null);
        setGroupDetailsLoading(true);

        if (!data.roomId) {
            setGroupDetailsError("Group ID is missing.");
            setGroupDetailsLoading(false);
            return () => controller.abort();
        }
        if (!userId) {
            setGroupDetailsError("Admin user ID not found in session.");
            setGroupDetailsLoading(false);
            return () => controller.abort();
        }

        const token = getStoredAuthToken();
        void (async () => {
            try {
                const response = await fetch(API_GET_GROUP_DETAILS(source, data.roomId, userId), {
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    signal: controller.signal,
                });
                const result: unknown = await response.json();
                if (!response.ok) {
                    const message = result && typeof result === "object" && "message" in result
                        ? String((result as { message?: unknown }).message || "")
                        : "";
                    throw new Error(message || `Failed to load group details (HTTP ${response.status}).`);
                }

                const details = result && typeof result === "object" && "data" in result
                    ? (result as { data?: unknown }).data
                    : undefined;
                if (!details || typeof details !== "object") {
                    throw new Error("The group details response was not in the expected format.");
                }
                const payload = details as Partial<ApiGroupDetails>;
                if (
                    typeof payload.groupName !== "string"
                    || typeof payload.description !== "string"
                    || (payload.sendAccess !== "EVERYONE" && payload.sendAccess !== "ADMIN_ONLY")
                ) {
                    throw new Error("The group details response was missing required group information.");
                }

                const normalizedDetails: ApiGroupDetails = {
                    roomId: String(payload.roomId || data.roomId),
                    roomCode: String(payload.roomCode || ""),
                    type: String(payload.type || ""),
                    source,
                    groupName: payload.groupName,
                    description: payload.description,
                    sendAccess: payload.sendAccess,
                    canUpdate: payload.canUpdate === true,
                };
                setGroupDetails(normalizedDetails);
                setAccess(normalizedDetails.sendAccess);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                setGroupDetailsError(error instanceof Error ? error.message : "Failed to load group details.");
            } finally {
                if (!controller.signal.aborted) setGroupDetailsLoading(false);
            }
        })();

        return () => controller.abort();
    }, [data.roomId]);

    useEffect(() => {
        const tenantId = getStoredTenantId();
        if (!tenantId) {
            setTenantRoles([]);
            setRolesError("Tenant ID not found in session.");
            return;
        }

        const controller = new AbortController();
        setRolesLoading(true);
        setRolesError(null);
        const token = getStoredAuthToken();

        void (async () => {
            try {
                const response = await fetch(API_GET_TENANT_ROLES(encodeURIComponent(tenantId)), {
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error(`Failed to load roles (HTTP ${response.status})`);

                const result: unknown = await response.json();
                const roles = result && typeof result === "object" && "data" in result
                    ? (result as { data?: unknown }).data
                    : undefined;
                if (!Array.isArray(roles)) throw new Error("The roles response was not in the expected format.");

                const roleNames = Array.from(new Set(
                    roles.filter((role): role is string => typeof role === "string" && Boolean(role.trim()))
                        .map((role) => role.trim()),
                ));
                setTenantRoles(roleNames);
                setSelectedPortalRole((current) =>
                    roleNames.includes(current) ? current : roleNames[0] ?? "",
                );
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                setTenantRoles([]);
                setRolesError(error instanceof Error ? error.message : "Failed to load roles.");
            } finally {
                if (!controller.signal.aborted) setRolesLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!selectedPortalRole) {
            setRoleUsers([]);
            setRoleUsersError(null);
            setRoleUsersLoading(false);
            return;
        }

        const tenantId = getStoredTenantId();
        if (!tenantId) {
            setRoleUsers([]);
            setRoleUsersError("Tenant ID not found in session.");
            return;
        }

        const userId = getStoredUserId();
        if (!userId) {
            setRoleUsers([]);
            setRoleUsersError("User ID not found in session.");
            return;
        }
        setCurrentUserId(userId);

        const controller = new AbortController();
        setRoleUsersLoading(true);
        setRoleUsersError(null);
        const token = getStoredAuthToken();

        void (async () => {
            try {
                const response = await fetch(
                    API_GET_TENANT_USERS_BY_GROUP(
                        "TENANT",
                        data.roomId,
                        tenantId,
                        userId,
                        userId,
                        selectedPortalRole,
                        roleUsersPage,
                    ),
                    {
                        cache: "no-store",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        signal: controller.signal,
                    },
                );
                if (!response.ok) throw new Error(`Failed to load ${selectedPortalRole} members (HTTP ${response.status})`);
                const result = normalizeGroupRoleUsers(await response.json());
                setRoleUsers(result.users.map((member) => ({
                    userId: member.userId,
                    userName: member.userName,
                    course: member.course,
                    role: member.role,
                    isSelected: member.isSelected,
                })));
                setRoleUsersPagination(result.pagination);
                setLocalMembers((current) => {
                    const byId = new Map(current.map((member) => [member.userId, member]));
                    result.users.forEach((member) => {
                        byId.set(member.userId, {
                            userId: member.userId,
                            userName: member.userName,
                            course:member.course,
                            role: member.role || selectedPortalRole,
                            isSelected: member.isSelected,
                        });
                    });
                    return Array.from(byId.values());
                });
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                setRoleUsers([]);
                setRoleUsersError(error instanceof Error ? error.message : "Failed to load role details.");
            } finally {
                if (!controller.signal.aborted) setRoleUsersLoading(false);
            }
        })();

        return () => controller.abort();
    }, [data.roomId, roleUsersPage, selectedPortalRole]);


    const handleRemoveMember = (userId: string) => {
        if (!canUpdateGroup) return;
        setRoleUsers((prev) => prev.map((member) =>
            member.userId === userId ? { ...member, isSelected: false } : member,
        ));
        setLocalMembers((prev) => prev.map((member) =>
            member.userId === userId ? { ...member, isSelected: false } : member,
        ));
        onUpdateMembers({ removeTenantIds: [userId], updatedBy: "ADMIN" });
    };

    const handleToggleRoleUser = (user: RoleUser) => {
        if (!canUpdateGroup) return;
        const isSelected = !user.isSelected;
        setRoleUsers((prev) => prev.map((member) =>
            member.userId === user.userId ? { ...member, isSelected } : member,
        ));
        setLocalMembers((prev) => {
            const exists = prev.some((member) => member.userId === user.userId);
            const nextMember = {
                userId: user.userId,
                userName: user.userName,
                course: user.course,
                role: selectedPortalRole,
                isSelected,
            };
            return exists
                ? prev.map((member) => member.userId === user.userId ? { ...member, isSelected } : member)
                : [...prev, nextMember];
        });

        if (isSelected) {
            onAddMembers?.([{ userId: user.userId, userName: user.userName }]);
            onUpdateMembers({ addTenantIds: [user.userId], updatedBy: "ADMIN" });
        } else {
            onUpdateMembers({ removeTenantIds: [user.userId], updatedBy: "ADMIN" });
        }
    };

    const handleAccessChange = (newAccess: "EVERYONE" | "ADMIN_ONLY") => {
        if (!canUpdateGroup) return;
        setAccess(newAccess);
        onUpdateAccess(newAccess);
    };

    const existingIds = new Set(localMembers.map((m) => m.userId));
    const addableTenants = availableTenants.filter((t) => !existingIds.has(t.userId));

    const handleConfirmAdd = () => {
        if (!canUpdateGroup || selectedToAdd.length === 0) return;
        const newMembers = addableTenants
            .filter((t) => selectedToAdd.includes(t.userId))
            .map((t) => ({
                userId: t.userId,
                userName: t.userName,
                isSelected: true,
                role: t.role,
                course: t.course,
            }));
        setLocalMembers((prev) => [...prev, ...newMembers]);
        onAddMembers?.(newMembers.map((m) => ({ userId: m.userId, userName: m.userName })));
        onUpdateMembers({ addTenantIds: selectedToAdd, updatedBy: "ADMIN" });
        setSelectedToAdd([]);
        setShowAddDropdown(false);
    };

    const selectedMembers = localMembers.filter((m) => m.isSelected);
    const selectedCount = selectedMembers.length;
    const membersByRole = new Map<string, typeof selectedMembers>();
    selectedMembers.forEach((member) => {
        const role = member.role || "OTHER";
        membersByRole.set(role, [...(membersByRole.get(role) ?? []), member]);
    });

    const avatarColors = [
        "bg-[#E9EEF8] text-[#4863A8]",
        "bg-[#E6F7EC] text-[#22C55E]",
        "bg-[#F3E8FF] text-[#8B5CF6]",
        "bg-[#FFF7E8] text-[#F4A429]",
        "bg-[#FDEAEA] text-[#E35D5D]",
        "bg-[#E0F2FE] text-[#3B82F6]",
    ];
    const colorFor = (key: string) => {
        let h = 0;
        for (let i = 0; i < key.length; i++) h = (h << 5) - h + key.charCodeAt(i);
        return avatarColors[Math.abs(h) % avatarColors.length];
    };

    const filteredRoles = tenantRoles.filter((role) =>
        role.toLowerCase().includes(roleSearch.trim().toLowerCase()),
    );

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/20 p-0 sm:p-4 font-sans"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-[560px] max-h-[92vh] bg-white rounded-t-[20px] sm:rounded-[16px] shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="relative bg-gradient-to-b from-[#EEF2FB] to-white px-6 pt-5 pb-4 border-b border-[#E6EAF2]">
                    <div className="flex items-start gap-4">
                        <label className={`block relative shrink-0 ${canUpdateGroup ? "cursor-pointer" : "pointer-events-none cursor-not-allowed opacity-60"}`}>
                            <div className="w-[72px] h-[72px] rounded-[12px] overflow-hidden bg-gray-100 flex items-center justify-center ring-2 ring-white shadow-md">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt={groupDetails?.groupName || "Group"} width={72} height={72} unoptimized className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[28px] font-semibold text-gray-400">
                                        {groupDetails?.groupName?.charAt(0)?.toUpperCase() ?? "G"}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#576CBC] rounded-full p-[5px] shadow">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                                </svg>
                            </div>
                            <input type="file" accept="image/*" disabled={!canUpdateGroup} className="hidden" onChange={(e) => onImageChange(e.target.files?.[0] ?? null)} />
                        </label>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-[18px] font-bold text-[#101828] tracking-tight truncate">
                                {groupDetailsLoading ? "Loading group details..." : groupDetails?.groupName || "Group details unavailable"}
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="text-[12px] text-[#667085] truncate">{groupDetails?.description || (groupDetailsLoading ? " " : "No description")}</span>
                            </div>
                            {groupDetailsError && (
                                <p role="alert" className="mt-1 text-[11px] text-red-600">{groupDetailsError}</p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F0EC] px-2 py-[3px] text-[11px] font-semibold text-[#2F7A5C]">
                                    {selectedCount} member{selectedCount === 1 ? "" : "s"}
                                </span>
                                {data.planName && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E0F2FE] px-2 py-[3px] text-[11px] font-semibold text-[#3B82F6]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                                        {data.planName}
                                    </span>
                                )}
                                {groupDetails && (
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-semibold ${access === "ADMIN_ONLY" ? "bg-[#FFF7E8] text-[#B45309]" : "bg-[#EAF8EC] text-[#22C55E]"
                                        }`}>
                                        {access === "ADMIN_ONLY" ? "🔒 Admins only" : "✓ Everyone"}
                                    </span>
                                )}
                                {groupDetails?.roomCode && <span className="text-[11px] text-[#98A2B3]">#{groupDetails.roomCode}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-3">
                    <div className="flex items-center gap-1 border-b border-[#E6EAF2]">
                        {(
                            [
                                { key: "DETAILS", label: "Details" },
                                { key: "ROLES", label: `Roles (${tenantRoles.length})` },
                            ] as const
                        ).map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`relative px-3 py-2 text-[12px] font-medium transition-colors ${tab === t.key ? "text-[#576CBC]" : "text-[#667085] hover:text-[#101B41]"
                                    }`}
                            >
                                {t.label}
                                {tab === t.key && (
                                    <motion.div
                                        layoutId="groupDetailsTabIndicator"
                                        className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#576CBC] rounded-t"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <AnimatePresence mode="wait">
                        {tab === "DETAILS" && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 8 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[#101B41]">Group Name</label>
                                    <input type="text" value={groupDetails?.groupName || ""} readOnly className="w-full h-[42px] rounded-[6px] border border-[#D0D5DD] px-3 text-[13px] text-[#101B41] outline-none" />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[#101B41]">Description</label>
                                    <textarea value={groupDetails?.description || ""} rows={2} readOnly placeholder="Enter group description" className="w-full rounded-[6px] border border-[#D0D5DD] px-3 py-2 text-[13px] text-[#101B41] outline-none resize-none" />
                                </div>

                                <div className="rounded-[8px] border border-[#E6EAF2] p-4">
                                    <h3 className="text-[13px] font-semibold text-[#101B41] mb-1">Group Settings</h3>
                                    <p className="text-[12px] text-[#667085] mb-3">Who can send messages</p>
                                    <div className="flex items-center gap-8">
                                        <div className={`flex items-center gap-2 select-none ${canUpdateGroup ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
                                            <button type="button" disabled={!canUpdateGroup} aria-label="Allow everyone to send messages" onClick={() => handleAccessChange("EVERYONE")} className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center disabled:cursor-not-allowed ${access === "EVERYONE" ? "border-[#576CBC]" : "border-[#D0D5DD]"}`}>
                                                {access === "EVERYONE" && <div className="w-[8px] h-[8px] rounded-full bg-[#576CBC]" />}
                                            </button>
                                            <span className="text-[13px] text-[#101B41]">Everyone</span>
                                        </div>
                                        <div className={`flex items-center gap-2 select-none ${canUpdateGroup ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
                                            <button type="button" disabled={!canUpdateGroup} aria-label="Allow admins only to send messages" onClick={() => handleAccessChange("ADMIN_ONLY")} className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center disabled:cursor-not-allowed ${access === "ADMIN_ONLY" ? "border-[#576CBC]" : "border-[#D0D5DD]"}`}>
                                                {access === "ADMIN_ONLY" && <div className="w-[8px] h-[8px] rounded-full bg-[#576CBC]" />}
                                            </button>
                                            <span className="text-[13px] text-[#101B41]">Admins only</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[8px] border border-[#F5D0D0] bg-[#FFF8F8] p-4">
                                    <p className="mb-1 text-[14px] font-bold text-[#D14343]">Delete Group</p>
                                    <p className="mb-4 text-[12px] text-[#8C919C]">Once deleted, this group and all messages will be permanently removed.</p>
                                    {!showDeleteConfirm ? (
                                        <button type="button" disabled={!canUpdateGroup} onClick={() => onToggleDeleteConfirm(true)} className="h-[36px] rounded-[6px] border border-[#D14343] text-[#D14343] px-4 text-[13px] font-semibold hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">Delete Group</button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button type="button" disabled={!canUpdateGroup} onClick={() => onToggleDeleteConfirm(false)} className="flex-1 h-[36px] rounded-[6px] border border-[#D0D5DD] bg-white px-3 text-[13px] font-semibold text-[#344054] disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
                                            <button type="button" disabled={!canUpdateGroup} onClick={onDelete} className="flex-1 h-[36px] rounded-[6px] bg-[#D14343] text-white px-3 text-[13px] font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">Yes, Delete</button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}


                        {tab === "ROLES" && (
                            <motion.div
                                key="roles"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 8 }}
                                transition={{ duration: 0.15 }}
                                className="flex min-h-[240px] gap-3"
                            >
                                <nav aria-label="Tenant roles" className="w-[150px] shrink-0 space-y-2 border-r border-[#E6EAF2] pr-2">
                                    <input
                                        type="search"
                                        placeholder="Search roles..."
                                        value={roleSearch}
                                        onChange={(event) => setRoleSearch(event.target.value)}
                                        disabled={!canUpdateGroup}
                                        className="h-8 w-full rounded-md border border-[#E6EAF2] px-2 text-[11px] outline-none focus:border-[#576CBC] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70"
                                    />
                                    {rolesLoading ? (
                                        <p className="px-2 py-3 text-[11px] text-[#98A2B3]">Loading roles...</p>
                                    ) : rolesError ? (
                                        <p role="alert" className="px-2 py-2 text-[11px] text-[#D14343]">{rolesError}</p>
                                    ) : filteredRoles.length === 0 ? (
                                        <p className="px-2 py-3 text-[11px] text-[#98A2B3]">No roles found</p>
                                    ) : (
                                        filteredRoles.map((role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPortalRole(role);
                                                    setRoleUsersPage(1);
                                                }}
                                                className={`flex w-full items-center justify-between gap-1 rounded-md px-2 py-2 text-left text-[12px] ${
                                                    selectedPortalRole === role
                                                        ? "bg-[#EEF2FB] font-semibold text-[#576CBC]"
                                                        : "text-[#667085] hover:bg-[#F8F9FC]"
                                                }`}
                                            >
                                                <span className="truncate">{role}</span>
                                                {selectedPortalRole === role && (
                                                    <span aria-hidden="true" className="text-[10px]">›</span>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </nav>
                                <div className="min-w-0 flex-1 space-y-2">
                                    {!selectedPortalRole ? (
                                        <p className="py-10 text-center text-[12px] text-[#98A2B3]">Select a role to view its members.</p>
                                    ) : (
                                        <>
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <h3 className="truncate text-[13px] font-semibold text-[#101B41]">{selectedPortalRole}</h3>
                                                {!roleUsersLoading && !roleUsersError && (
                                                    <span className="shrink-0 rounded-full bg-[#E6F0EC] px-2 py-[3px] text-[10px] font-semibold text-[#2F7A5C]">
                                                        {roleUsersPagination.totalRecords} member{roleUsersPagination.totalRecords === 1 ? "" : "s"}
                                                    </span>
                                                )}
                                            </div>
                                            {roleUsersLoading ? (
                                                <p className="py-8 text-center text-[12px] text-[#98A2B3]">Loading role details...</p>
                                            ) : roleUsersError ? (
                                                <p role="alert" className="py-8 text-center text-[12px] text-[#D14343]">{roleUsersError}</p>
                                            ) : roleUsers.length === 0 ? (
                                                <p className="py-8 text-center text-[12px] text-[#98A2B3]">No users found for this role.</p>
                                            ) : (
                                                <>
                                                    {[...roleUsers]
                                                        .sort((first, second) => Number(second.isSelected) - Number(first.isSelected))
                                                        .map((user) => (
                                                        <div key={user.userId} className="flex items-center gap-3 rounded-[8px] border border-[#E6EAF2] px-3 py-2.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={user.isSelected}
                                                                disabled={!canUpdateGroup}
                                                                onChange={() => handleToggleRoleUser(user)}
                                                                aria-label={`${user.isSelected ? "Remove" : "Add"} ${user.userName} ${user.isSelected ? "from" : "to"} this group`}
                                                                className="h-4 w-4 shrink-0 cursor-pointer accent-[#576CBC] disabled:cursor-not-allowed"
                                                            />
                                                            <div className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${colorFor(user.userId)}`}>
                                                                {user.userId === currentUserId ? "Y" : user.userName.charAt(0).toUpperCase() || "?"}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-[13px] font-medium text-[#101B41]">{user.userId === currentUserId ? "You" : user.userName}</p>
                                                                <p className="text-[11px] text-[#98A2B3]">{selectedPortalRole}</p>
                                                            </div>
                                                            {user.course && (
                                                                <span className="max-w-[90px] shrink-0 truncate rounded bg-[#E0F2FE] px-1.5 py-[2px] text-[10px] font-semibold text-[#3B82F6]">
                                                                    {user.course}
                                                                </span>
                                                            )}
                                                            {canUpdateGroup && user.isSelected && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveMember(user.userId)}
                                                                    aria-label={`Remove ${user.userName} from this group`}
                                                                    title="Remove from group"
                                                                    className="shrink-0 rounded p-1 text-[#D14343] hover:bg-[#FDEAEA]"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                                                        <path d="M3 6h18" />
                                                                        <path d="M8 6V4h8v2" />
                                                                        <path d="m19 6-1 14H6L5 6" />
                                                                        <path d="M10 11v5M14 11v5" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {roleUsersPagination.totalPages > 1 && (
                                                        <div className="flex items-center justify-between pt-2">
                                                            <button
                                                                type="button"
                                                                disabled={roleUsersPage <= 1 || roleUsersLoading}
                                                                onClick={() => setRoleUsersPage((page) => Math.max(1, page - 1))}
                                                                className="rounded border border-[#E6EAF2] px-2 py-1 text-[11px] text-[#576CBC] disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                Previous
                                                            </button>
                                                            <span className="text-[11px] text-[#98A2B3]">
                                                                Page {roleUsersPagination.page} of {roleUsersPagination.totalPages}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                disabled={roleUsersPage >= roleUsersPagination.totalPages || roleUsersLoading}
                                                                onClick={() => setRoleUsersPage((page) => Math.min(roleUsersPagination.totalPages, page + 1))}
                                                                className="rounded border border-[#E6EAF2] px-2 py-1 text-[11px] text-[#576CBC] disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#F0F1F4] bg-white">
                    <button onClick={onClose} className="h-[40px] rounded-[6px] border border-[#576CBC] text-[#576CBC] px-6 text-[13px] font-semibold hover:bg-blue-50">Cancel</button>
                    <button onClick={onSave} disabled={!canUpdateGroup} className="h-[40px] rounded-[6px] bg-[#576CBC] text-white px-6 text-[13px] font-semibold hover:bg-[#4659a3] disabled:cursor-not-allowed disabled:opacity-50">Done</button>
                </div>
            </motion.div>
        </motion.div>
    );
}