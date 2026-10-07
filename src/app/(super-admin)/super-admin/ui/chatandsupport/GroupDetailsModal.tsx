"use client";

import { motion } from "framer-motion";
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
  members: {
    tenantId: string;
    tenantName: string;
    isSelected: boolean;
  }[];
  memberCount: number;
}

interface AvailableTenant {
  tenantId: string;
  tenantName: string;
}

interface GroupDetailsModalProps {
  data: GroupDetailsData;
  imagePreview: string | null;
  showDeleteConfirm: boolean;
  availableTenants?: AvailableTenant[];
  onImageChange: (file: File | null) => void;
  onUpdateMembers: (payload: {
    addTenantIds?: string[];
    removeTenantIds?: string[];
    updatedBy: string;
  }) => void;
  onAddMembers?: (
    newMembers: { tenantId: string; tenantName: string }[]
  ) => void;
  onUpdateAccess: (access: "EVERYONE" | "ADMIN_ONLY") => void;
  onToggleDeleteConfirm: (show: boolean) => void;
  onDelete: () => void;
  onClose: () => void;
  onSave: () => void;
}

export function GroupDetailsModal({
  data,
  imagePreview,
  showDeleteConfirm,
  availableTenants = [],
  onImageChange,
  onUpdateMembers,
  onAddMembers,
  onUpdateAccess,
  onToggleDeleteConfirm,
  onDelete,
  onClose,
  onSave,
}: GroupDetailsModalProps) {
  const [localMembers, setLocalMembers] = useState(data.members);
  const [access, setAccess] = useState<"EVERYONE" | "ADMIN_ONLY">(
    data.sendAccess
  );
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync local members when parent data changes
  useEffect(() => {
    // ✅ Merge the parent's members with the FULL available tenant list
    // so that any tenant that isn't in the group still appears (unticked)
    const existingIds = new Set(data.members.map((m) => m.tenantId));
    const missingFromPlan = availableTenants
      .filter((t) => !existingIds.has(t.tenantId))
      .map((t) => ({
        tenantId: t.tenantId,
        tenantName: t.tenantName,
        isSelected: false,
      }));

    setLocalMembers([...data.members, ...missingFromPlan]);
    setAccess(data.sendAccess);
  }, [data.members, data.sendAccess, availableTenants]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowAddDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggleMember = (tenantId: string) => {
    const member = localMembers.find((m) => m.tenantId === tenantId);
    if (!member) return;

    setLocalMembers((prev) =>
      prev.map((m) =>
        m.tenantId === tenantId ? { ...m, isSelected: !m.isSelected } : m
      )
    );

    if (member.isSelected) {
      onUpdateMembers({
        removeTenantIds: [tenantId],
        updatedBy: "SUPERADMIN",
      });
    } else {
      onUpdateMembers({
        addTenantIds: [tenantId],
        updatedBy: "SUPERADMIN",
      });
    }
  };

  // Soft remove — untick only
  const handleRemoveMember = (tenantId: string) => {
    const member = localMembers.find((m) => m.tenantId === tenantId);
    if (!member || !member.isSelected) return;

    setLocalMembers((prev) =>
      prev.map((m) =>
        m.tenantId === tenantId ? { ...m, isSelected: false } : m
      )
    );

    onUpdateMembers({
      removeTenantIds: [tenantId],
      updatedBy: "SUPERADMIN",
    });
  };

  const handleAccessChange = (newAccess: "EVERYONE" | "ADMIN_ONLY") => {
    setAccess(newAccess);
    onUpdateAccess(newAccess);
  };

  // Only show tenants not already in the group
  const existingIds = new Set(localMembers.map((m) => m.tenantId));
  const addableTenants = availableTenants.filter(
    (t) => !existingIds.has(t.tenantId)
  );

  const toggleSelectedToAdd = (tenantId: string) => {
    setSelectedToAdd((prev) =>
      prev.includes(tenantId)
        ? prev.filter((id) => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const handleConfirmAdd = () => {
    if (selectedToAdd.length === 0) return;

    const newMembers = addableTenants
      .filter((t) => selectedToAdd.includes(t.tenantId))
      .map((t) => ({
        tenantId: t.tenantId,
        tenantName: t.tenantName,
        isSelected: true,
      }));

    setLocalMembers((prev) => [...prev, ...newMembers]);

    onAddMembers?.(
      newMembers.map((m) => ({
        tenantId: m.tenantId,
        tenantName: m.tenantName,
      }))
    );

    onUpdateMembers({
      addTenantIds: selectedToAdd,
      updatedBy: "SUPERADMIN",
    });

    setSelectedToAdd([]);
    setShowAddDropdown(false);
  };

  const selectedCount = localMembers.filter((m) => m.isSelected).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/20 p-0 sm:p-4 font-sans"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-[500px] max-h-[92vh] bg-white rounded-t-[20px] sm:rounded-[16px] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-[18px] font-bold text-[#101828] tracking-tight">
            Group Details
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Avatar + Name */}
          <div className="flex gap-4 items-start">
            <label className="cursor-pointer block relative shrink-0 mt-1">
              <div className="w-[60px] h-[60px] rounded-[8px] overflow-hidden bg-gray-100 flex items-center justify-center">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt={data.groupName}
                    width={60}
                    height={60}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[24px] font-medium text-gray-400">
                    {data.groupName?.charAt(0)?.toUpperCase() ?? "G"}
                  </span>
                )}
              </div>
              <div className="absolute -top-1 -right-1 bg-[#576CBC] rounded-full p-[3px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3 text-white"
                >
                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                </svg>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="flex-1">
              <label className="mb-1.5 block text-[15px] font-medium text-[#101B41]">
                Group Name
              </label>
              <input
                type="text"
                value={data.groupName || ""}
                readOnly
                className="w-full h-[42px] rounded-[6px] border border-[#D0D5DD] px-3 text-[13px] text-[#101B41] outline-none focus:border-[#576CBC] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[15px] font-medium text-[#101B41]">
              Description
            </label>
            <textarea
              value={data.description || ""}
              placeholder="Enter group description"
              rows={2}
              readOnly
              className="w-full rounded-[6px] border border-[#D0D5DD] px-3 py-2 text-[13px] text-[#101B41] outline-none focus:border-[#576CBC] transition-colors resize-none"
            />
          </div>

          {/* Members List */}
          <div className="rounded-[8px] border border-[#E6EAF2] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E6EAF2] px-4 py-2.5">
              <span className="text-[13px] font-medium text-[#101B41]">
                {data.planName || "Basic Plans"} Members
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-[4px] bg-[#E6F0EC] text-[#2F7A5C] px-1.5 py-0.5 text-[11px] font-bold">
                  {String(selectedCount).padStart(2, "0")}
                </span>
                {availableTenants.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddDropdown((o) => !o)}
                    className="flex items-center gap-1 rounded-[4px] bg-[#576CBC] px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-[#4659a3] transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add
                  </button>
                )}
              </div>
            </div>

            {/* Add Member Dropdown */}
            {showAddDropdown && (
              <div
                ref={dropdownRef}
                className="border-b border-[#E6EAF2] bg-[#F8F9FC] p-2 max-h-[180px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {addableTenants.length === 0 ? (
                  <p className="py-3 text-center text-[11px] text-[#98A2B3]">
                    All available tenants are already in this group.
                  </p>
                ) : (
                  <>
                    {addableTenants.map((t) => {
                      const isChecked = selectedToAdd.includes(t.tenantId);
                      return (
                        <div
                          key={t.tenantId}
                          onClick={() => toggleSelectedToAdd(t.tenantId)}
                          className="flex items-center gap-2 rounded-[4px] px-2 py-1.5 cursor-pointer hover:bg-white transition-colors"
                        >
                          <div
                            className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${isChecked
                                ? "bg-[#576CBC] border-[#576CBC]"
                                : "bg-white border-[#D0D5DD]"
                              }`}
                          >
                            {isChecked && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-2.5 h-2.5 text-white"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[12px] text-[#101B41] truncate">
                            {t.tenantName}
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[#E6EAF2]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedToAdd([]);
                          setShowAddDropdown(false);
                        }}
                        className="h-[28px] rounded-[4px] border border-[#D0D5DD] bg-white px-3 text-[11px] font-semibold text-[#344054] hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmAdd}
                        disabled={selectedToAdd.length === 0}
                        className={`h-[28px] rounded-[4px] px-3 text-[11px] font-semibold text-white transition-colors ${selectedToAdd.length === 0
                            ? "bg-[#98A2B3] cursor-not-allowed"
                            : "bg-[#576CBC] hover:bg-[#4659a3]"
                          }`}
                      >
                        Add ({selectedToAdd.length})
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="max-h-[220px] overflow-y-auto p-2 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {localMembers.length === 0 ? (
                <p className="py-4 text-center text-[11px] text-[#98A2B3]">
                  No members yet. Click "+ Add" to add tenants.
                </p>
              ) : (
                localMembers.map((member) => (
                  <div
                    key={member.tenantId}
                    className="flex items-center gap-2 rounded-[4px] px-2 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleMember(member.tenantId)}
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] transition-colors ${member.isSelected
                          ? "bg-[#576CBC]"
                          : "border border-[#D0D5DD] bg-white"
                        }`}
                    >
                      {member.isSelected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3 h-3 text-white"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 flex items-center gap-2 truncate">
                      <span
                        className={`text-[13px] truncate ${member.isSelected
                            ? "font-normal text-[#101B41]"
                            : "font-normal text-[#98A2B3] line-through"
                          }`}
                      >
                        {member.tenantName}
                      </span>
                      {data.planName && (
                        <span className="text-[11px] font-normal text-[#98A2B3] truncate">
                          ({data.planName})
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.tenantId)}
                      disabled={!member.isSelected}
                      className={`p-1 transition-colors ${member.isSelected
                          ? "text-[#9EA3AE] hover:text-[#D14343]"
                          : "text-[#E4E7EC] cursor-not-allowed"
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-[16px] h-[16px]"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Group Settings */}
          <div className="rounded-[8px] border border-[#E6EAF2] p-3.5">
            <h3 className="text-[13px] font-medium text-[#101B41] mb-1">
              Group Settings
            </h3>
            <p className="text-[13px] text-[#101B41] mb-3">
              Who can send messages
            </p>

            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => handleAccessChange("EVERYONE")}
                  className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center cursor-pointer ${access === "EVERYONE"
                      ? "border-[#576CBC]"
                      : "border-[#D0D5DD]"
                    }`}
                >
                  {access === "EVERYONE" && (
                    <div className="w-[8px] h-[8px] rounded-full bg-[#576CBC]" />
                  )}
                </div>
                <span className="text-[13px] text-[#101B41]">Everyone</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => handleAccessChange("ADMIN_ONLY")}
                  className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center cursor-pointer ${access === "ADMIN_ONLY"
                      ? "border-[#576CBC]"
                      : "border-[#D0D5DD]"
                    }`}
                >
                  {access === "ADMIN_ONLY" && (
                    <div className="w-[8px] h-[8px] rounded-full bg-[#576CBC]" />
                  )}
                </div>
                <span className="text-[13px] text-[#101B41]">
                  Admins only
                </span>
              </label>
            </div>
          </div>

          {/* Delete Group */}
          <div className="rounded-[8px] border border-[#F5D0D0] bg-[#FFF8F8] p-4">
            <p className="mb-1 text-[14px] font-bold text-[#D14343]">
              Delete Group
            </p>
            <p className="mb-4 text-[12px] text-[#8C919C]">
              Once deleted, this group and all messages will be permanently
              removed.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => onToggleDeleteConfirm(true)}
                className="h-[36px] rounded-[6px] border border-[#D14343] text-[#D14343] px-4 text-[13px] font-semibold hover:bg-red-50 transition-colors"
              >
                Delete Group
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleDeleteConfirm(false)}
                  className="flex-1 h-[36px] rounded-[6px] border border-[#D0D5DD] bg-white px-3 text-[13px] font-semibold text-[#344054] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 h-[36px] rounded-[6px] bg-[#D14343] text-white px-3 text-[13px] font-semibold hover:bg-red-700 transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#F0F1F4] bg-white">
          <button
            onClick={onClose}
            className="h-[40px] rounded-[6px] border border-[#576CBC] text-[#576CBC] px-6 text-[13px] font-semibold hover:bg-blue-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="h-[40px] rounded-[6px] bg-[#576CBC] text-white px-6 text-[13px] font-semibold hover:bg-[#4659a3] transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}