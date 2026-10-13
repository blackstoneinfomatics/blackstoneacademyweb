"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export interface GroupDetailsData {
    roomId: string;
    roomCode: string;
    groupName: string;
    role: string;
    description: string;
    planName: string;
    sendAccess: "EVERYONE" | "ADMIN_ONLY";
    members: { tenantId: string; tenantName: string; isSelected: boolean }[];
    memberCount: number;
}

interface AvailableTenant { tenantId: string; tenantName: string; }

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
    groupList?: GroupListItem[];
    onSelectGroup?: (roomId: string) => void;
    onImageChange: (file: File | null) => void;
    onUpdateMembers: (payload: { addTenantIds?: string[]; removeTenantIds?: string[]; updatedBy: string }) => void;
    onAddMembers?: (newMembers: { tenantId: string; tenantName: string }[]) => void;
    onUpdateAccess: (access: "EVERYONE" | "ADMIN_ONLY") => void;
    onToggleDeleteConfirm: (show: boolean) => void;
    onDelete: () => void;
    onClose: () => void;
    onSave: () => void;
}

type TabKey = "DETAILS" | "GROUPS" | "MEMBERS";

export function GroupDetailsModal({
    data, imagePreview, showDeleteConfirm, availableTenants = [],
    groupList = [], onSelectGroup, onImageChange, onUpdateMembers,
    onAddMembers, onUpdateAccess, onToggleDeleteConfirm, onDelete, onClose, onSave,
}: GroupDetailsModalProps) {
    const [tab, setTab] = useState<TabKey>("DETAILS");
    const [localMembers, setLocalMembers] = useState(data.members);
    const [access, setAccess] = useState<"EVERYONE" | "ADMIN_ONLY">(data.sendAccess);
    const [showAddDropdown, setShowAddDropdown] = useState(false);
    const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
    const [groupSearch, setGroupSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const existingIds = new Set(data.members.map((m) => m.tenantId));
        const missingFromPlan = availableTenants
            .filter((t) => !existingIds.has(t.tenantId))
            .map((t) => ({ tenantId: t.tenantId, tenantName: t.tenantName, isSelected: false }));
        setLocalMembers([...data.members, ...missingFromPlan]);
        setAccess(data.sendAccess);
    }, [data.members, data.sendAccess, availableTenants]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowAddDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => { setTab("DETAILS"); }, [data.roomId]);

    const handleToggleMember = (tenantId: string) => {
        const member = localMembers.find((m) => m.tenantId === tenantId);
        if (!member) return;
        setLocalMembers((prev) => prev.map((m) => m.tenantId === tenantId ? { ...m, isSelected: !m.isSelected } : m));
        if (member.isSelected) onUpdateMembers({ removeTenantIds: [tenantId], updatedBy: "ADMIN" });
        else onUpdateMembers({ addTenantIds: [tenantId], updatedBy: "ADMIN" });
    };

    const handleRemoveMember = (tenantId: string) => {
        const member = localMembers.find((m) => m.tenantId === tenantId);
        if (!member || !member.isSelected) return;
        setLocalMembers((prev) => prev.map((m) => m.tenantId === tenantId ? { ...m, isSelected: false } : m));
        onUpdateMembers({ removeTenantIds: [tenantId], updatedBy: "ADMIN" });
    };

    const handleAccessChange = (newAccess: "EVERYONE" | "ADMIN_ONLY") => {
        setAccess(newAccess);
        onUpdateAccess(newAccess);
    };

    const existingIds = new Set(localMembers.map((m) => m.tenantId));
    const addableTenants = availableTenants.filter((t) => !existingIds.has(t.tenantId));

    const toggleSelectedToAdd = (tenantId: string) => {
        setSelectedToAdd((prev) => prev.includes(tenantId) ? prev.filter((id) => id !== tenantId) : [...prev, tenantId]);
    };

    const handleConfirmAdd = () => {
        if (selectedToAdd.length === 0) return;
        const newMembers = addableTenants
            .filter((t) => selectedToAdd.includes(t.tenantId))
            .map((t) => ({ tenantId: t.tenantId, tenantName: t.tenantName, isSelected: true }));
        setLocalMembers((prev) => [...prev, ...newMembers]);
        onAddMembers?.(newMembers.map((m) => ({ tenantId: m.tenantId, tenantName: m.tenantName })));
        onUpdateMembers({ addTenantIds: selectedToAdd, updatedBy: "ADMIN" });
        setSelectedToAdd([]);
        setShowAddDropdown(false);
    };

    const selectedMembers = localMembers.filter((m) => m.isSelected);
    const selectedCount = selectedMembers.length;

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

    const filteredGroups = groupList.filter((g) => {
        if (!groupSearch.trim()) return true;
        const q = groupSearch.toLowerCase();
        return (
            g.groupName.toLowerCase().includes(q) ||
            (g.planName ?? "").toLowerCase().includes(q) ||
            (g.roomCode ?? "").toLowerCase().includes(q) ||
            (g.memberNames ?? []).some((n) => n.toLowerCase().includes(q))
        );
    });

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
                        <label className="cursor-pointer block relative shrink-0">
                            <div className="w-[72px] h-[72px] rounded-[12px] overflow-hidden bg-gray-100 flex items-center justify-center ring-2 ring-white shadow-md">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt={data.groupName} width={72} height={72} unoptimized className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[28px] font-semibold text-gray-400">
                                        {data.groupName?.charAt(0)?.toUpperCase() ?? "G"}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#576CBC] rounded-full p-[5px] shadow">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                                </svg>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageChange(e.target.files?.[0] ?? null)} />
                        </label>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-[18px] font-bold text-[#101828] tracking-tight truncate">
                                {data.groupName || "Untitled Group"}
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="text-[12px] text-[#667085] truncate">{data.description || "No description"}</span>
                            </div>
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
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-semibold ${access === "ADMIN_ONLY" ? "bg-[#FFF7E8] text-[#B45309]" : "bg-[#EAF8EC] text-[#22C55E]"
                                    }`}>
                                    {access === "ADMIN_ONLY" ? "🔒 Admins only" : "✓ Everyone"}
                                </span>
                                {data.roomCode && <span className="text-[11px] text-[#98A2B3]">#{data.roomCode}</span>}
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
                                { key: "GROUPS", label: `Groups (${groupList.length})` },
                                { key: "MEMBERS", label: `Members (${selectedCount})` },
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
                                    <input type="text" value={data.groupName || ""} readOnly className="w-full h-[42px] rounded-[6px] border border-[#D0D5DD] px-3 text-[13px] text-[#101B41] outline-none" />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[#101B41]">Description</label>
                                    <textarea value={data.description || ""} rows={2} readOnly placeholder="Enter group description" className="w-full rounded-[6px] border border-[#D0D5DD] px-3 py-2 text-[13px] text-[#101B41] outline-none resize-none" />
                                </div>

                                <div className="rounded-[8px] border border-[#E6EAF2] overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-[#E6EAF2] px-4 py-2.5 bg-[#F8F9FC]">
                                        <span className="text-[13px] font-semibold text-[#101B41]">{data.planName || "Basic Plan"} Members</span>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-[4px] bg-[#E6F0EC] text-[#2F7A5C] px-1.5 py-0.5 text-[11px] font-bold">
                                                {String(selectedCount).padStart(2, "0")}
                                            </span>
                                            {availableTenants.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddDropdown((o) => !o)}
                                                    className="flex items-center gap-1 rounded-[4px] bg-[#576CBC] px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-[#4659a3]"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                                        <line x1="12" y1="5" x2="12" y2="19" />
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {showAddDropdown && (
                                        <div ref={dropdownRef} className="border-b border-[#E6EAF2] bg-[#F8F9FC] p-2 max-h-[180px] overflow-y-auto">
                                            {addableTenants.length === 0 ? (
                                                <p className="py-3 text-center text-[11px] text-[#98A2B3]">All available tenants are already in this group.</p>
                                            ) : (
                                                <>
                                                    {addableTenants.map((t) => {
                                                        const isChecked = selectedToAdd.includes(t.tenantId);
                                                        return (
                                                            <div key={t.tenantId} onClick={() => toggleSelectedToAdd(t.tenantId)} className="flex items-center gap-2 rounded-[4px] px-2 py-1.5 cursor-pointer hover:bg-white">
                                                                <div className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[3px] border ${isChecked ? "bg-[#576CBC] border-[#576CBC]" : "bg-white border-[#D0D5DD]"}`}>
                                                                    {isChecked && (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white">
                                                                            <polyline points="20 6 9 17 4 12" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <span className="text-[12px] text-[#101B41] truncate">{t.tenantName}</span>
                                                            </div>
                                                        );
                                                    })}
                                                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[#E6EAF2]">
                                                        <button onClick={() => { setSelectedToAdd([]); setShowAddDropdown(false); }} className="h-[28px] rounded-[4px] border border-[#D0D5DD] bg-white px-3 text-[11px] font-semibold text-[#344054]">Cancel</button>
                                                        <button onClick={handleConfirmAdd} disabled={selectedToAdd.length === 0} className={`h-[28px] rounded-[4px] px-3 text-[11px] font-semibold text-white ${selectedToAdd.length === 0 ? "bg-[#98A2B3] cursor-not-allowed" : "bg-[#576CBC] hover:bg-[#4659a3]"}`}>
                                                            Add ({selectedToAdd.length})
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <div className="max-h-[260px] overflow-y-auto p-2 space-y-0.5">
                                        {localMembers.length === 0 ? (
                                            <p className="py-4 text-center text-[11px] text-[#98A2B3]">No members yet. Click "+ Add" to add tenants.</p>
                                        ) : (
                                            localMembers.map((member) => (
                                                <div key={member.tenantId} className="flex items-center gap-3 rounded-[6px] px-2 py-2 hover:bg-gray-50">
                                                    <div className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${colorFor(member.tenantId)}`}>
                                                        {member.tenantName?.charAt(0)?.toUpperCase() ?? "?"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-[13px] truncate ${member.isSelected ? "text-[#101B41] font-medium" : "text-[#98A2B3] line-through"}`}>
                                                            {member.tenantName}
                                                        </p>
                                                        {data.planName && <p className="text-[11px] text-[#98A2B3] truncate">{data.planName}</p>}
                                                    </div>
                                                    <button type="button" onClick={() => handleToggleMember(member.tenantId)} className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] ${member.isSelected ? "bg-[#576CBC]" : "border border-[#D0D5DD] bg-white"}`}>
                                                        {member.isSelected && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button type="button" onClick={() => handleRemoveMember(member.tenantId)} disabled={!member.isSelected} className={`p-1 ${member.isSelected ? "text-[#9EA3AE] hover:text-[#D14343]" : "text-[#E4E7EC] cursor-not-allowed"}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px]">
                                                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[8px] border border-[#E6EAF2] p-4">
                                    <h3 className="text-[13px] font-semibold text-[#101B41] mb-1">Group Settings</h3>
                                    <p className="text-[12px] text-[#667085] mb-3">Who can send messages</p>
                                    <div className="flex items-center gap-8">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <div onClick={() => handleAccessChange("EVERYONE")} className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center cursor-pointer ${access === "EVERYONE" ? "border-[#576CBC]" : "border-[#D0D5DD]"}`}>
                                                {access === "EVERYONE" && <div className="w-[8px] h-[8px] rounded-full bg-[#576CBC]" />}
                                            </div>
                                            <span className="text-[13px] text-[#101B41]">Everyone</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <div onClick={() => handleAccessChange("ADMIN_ONLY")} className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center cursor-pointer ${access === "ADMIN_ONLY" ? "border-[#576CBC]" : "border-[#D0D5DD]"}`}>
                                                {access === "ADMIN_ONLY" && <div className="w-[8px] h-[8px] rounded-full bg-[#576CBC]" />}
                                            </div>
                                            <span className="text-[13px] text-[#101B41]">Admins only</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="rounded-[8px] border border-[#F5D0D0] bg-[#FFF8F8] p-4">
                                    <p className="mb-1 text-[14px] font-bold text-[#D14343]">Delete Group</p>
                                    <p className="mb-4 text-[12px] text-[#8C919C]">Once deleted, this group and all messages will be permanently removed.</p>
                                    {!showDeleteConfirm ? (
                                        <button onClick={() => onToggleDeleteConfirm(true)} className="h-[36px] rounded-[6px] border border-[#D14343] text-[#D14343] px-4 text-[13px] font-semibold hover:bg-red-50">Delete Group</button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => onToggleDeleteConfirm(false)} className="flex-1 h-[36px] rounded-[6px] border border-[#D0D5DD] bg-white px-3 text-[13px] font-semibold text-[#344054]">Cancel</button>
                                            <button onClick={onDelete} className="flex-1 h-[36px] rounded-[6px] bg-[#D14343] text-white px-3 text-[13px] font-semibold hover:bg-red-700">Yes, Delete</button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {tab === "GROUPS" && (
                            <motion.div
                                key="groups"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 8 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-3"
                            >
                                <div className="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9EA3AE] w-3.5 h-3.5">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search groups..."
                                        value={groupSearch}
                                        onChange={(e) => setGroupSearch(e.target.value)}
                                        className="w-full h-9 pl-9 pr-3 rounded-md border border-[#E6EAF2] text-[12px] bg-white outline-none focus:border-[#576CBC]"
                                    />
                                </div>

                                {filteredGroups.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <p className="text-[12px] text-[#98A2B3]">No groups found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredGroups.map((g) => {
                                            const isCurrent = g.roomId === data.roomId;
                                            return (
                                                <button
                                                    key={g.roomId}
                                                    type="button"
                                                    onClick={() => { onSelectGroup?.(g.roomId); setTab("DETAILS"); }}
                                                    className={`w-full flex items-center gap-3 rounded-[8px] border px-3 py-3 text-left transition-colors ${isCurrent ? "border-[#576CBC] bg-[#F5F7FF]" : "border-[#E6EAF2] bg-white hover:bg-[#F8F9FC]"
                                                        }`}
                                                >
                                                    <div className="relative shrink-0">
                                                        <div className="w-[42px] h-[42px] rounded-[8px] overflow-hidden bg-gray-100 flex items-center justify-center">
                                                            {g.imagePreview ? (
                                                                <Image src={g.imagePreview} alt={g.groupName} width={42} height={42} unoptimized className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-[16px] font-semibold text-gray-400">
                                                                    {g.groupName?.charAt(0)?.toUpperCase() ?? "G"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {isCurrent && (
                                                            <span className="absolute -bottom-1 -right-1 rounded-full bg-[#576CBC] p-[3px]">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[13px] font-semibold text-[#101B41] truncate">{g.groupName}</span>
                                                            {isCurrent && <span className="text-[10px] font-semibold text-[#576CBC] shrink-0">• Current</span>}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-[2px]">
                                                            {g.planName && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-[#E0F2FE] px-1.5 py-[1px] text-[10px] font-semibold text-[#3B82F6]">
                                                                    {g.planName}
                                                                </span>
                                                            )}
                                                            <span className="text-[11px] text-[#98A2B3]">
                                                                {g.memberCount} member{g.memberCount === 1 ? "" : "s"}
                                                            </span>
                                                            {g.roomCode && <span className="text-[11px] text-[#98A2B3]">• #{g.roomCode}</span>}
                                                        </div>
                                                        {g.memberNames && g.memberNames.length > 0 && (
                                                            <div className="flex items-center mt-1 gap-1">
                                                                {g.memberNames.slice(0, 3).map((n, i) => (
                                                                    <span key={i} className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-semibold ${colorFor(n + i)}`} title={n}>
                                                                        {n.charAt(0).toUpperCase()}
                                                                    </span>
                                                                ))}
                                                                {g.memberNames.length > 3 && (
                                                                    <span className="text-[10px] text-[#98A2B3] ml-1">+{g.memberNames.length - 3}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <span className={`text-[10px] font-semibold px-1.5 py-[2px] rounded shrink-0 ${g.sendAccess === "ADMIN_ONLY" ? "bg-[#FFF7E8] text-[#B45309]" : "bg-[#EAF8EC] text-[#22C55E]"
                                                        }`}>
                                                        {g.sendAccess === "ADMIN_ONLY" ? "🔒 Admins" : "✓ Open"}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {tab === "MEMBERS" && (
                            <motion.div
                                key="members"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 8 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-2"
                            >
                                {selectedMembers.length === 0 ? (
                                    <p className="py-10 text-center text-[12px] text-[#98A2B3]">No members in this group yet.</p>
                                ) : (
                                    selectedMembers.map((member) => (
                                        <div key={member.tenantId} className="flex items-center gap-3 rounded-[8px] border border-[#E6EAF2] px-3 py-2.5">
                                            <div className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${colorFor(member.tenantId)}`}>
                                                {member.tenantName?.charAt(0)?.toUpperCase() ?? "?"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-[#101B41] truncate">{member.tenantName}</p>
                                                <p className="text-[11px] text-[#98A2B3]">{data.planName || "Member"}</p>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveMember(member.tenantId)} className="text-[11px] font-semibold text-[#D14343] hover:underline">
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#F0F1F4] bg-white">
                    <button onClick={onClose} className="h-[40px] rounded-[6px] border border-[#576CBC] text-[#576CBC] px-6 text-[13px] font-semibold hover:bg-blue-50">Cancel</button>
                    <button onClick={onSave} className="h-[40px] rounded-[6px] bg-[#576CBC] text-white px-6 text-[13px] font-semibold hover:bg-[#4659a3]">Done</button>
                </div>
            </motion.div>
        </motion.div>
    );
}