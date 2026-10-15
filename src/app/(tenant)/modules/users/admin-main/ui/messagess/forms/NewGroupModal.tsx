"use client";

import React, { useCallback, useMemo, useState } from "react";
import { FiArrowLeft, FiSearch, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import type { CategoryDef, DirectoryMember } from "../chat-types";

interface NewGroupModalProps {
  categories: CategoryDef[];
  currentUserId: string;
  onClose: () => void;
  onCreate: (groupName: string, members: DirectoryMember[]) => Promise<void>;
  getPlanColor: (plan?: string) => { bg: string; text: string; dot: string };
  fetchMembersForCategory: (category: CategoryDef) => Promise<DirectoryMember[]>;
}

type GroupModalStep = "CATEGORY" | "MEMBERS";

const NewGroupModal = ({
  categories,
  currentUserId,
  onClose,
  onCreate,
  getPlanColor,
  fetchMembersForCategory,
}: NewGroupModalProps) => {
  const pickableCategories = useMemo(
    () => categories.filter(
      (category) =>
        category.key !== "ALL" &&
        category.key !== "GROUP" &&
        category.key !== "SUPERADMIN"
    ),
    [categories]
  );
  const [step, setStep] = useState<GroupModalStep>("CATEGORY");
  const [groupName, setGroupName] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryDef | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const [membersByCategory, setMembersByCategory] = useState<Record<string, DirectoryMember[]>>({});
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const loadMembersForCategory = useCallback(async (cat: CategoryDef) => {
    if (membersByCategory[cat.key]) return;

    setMembersLoading(true);
    setMembersError(null);

    try {
      const normalized = await fetchMembersForCategory(cat);
      setMembersByCategory((prev) => ({ ...prev, [cat.key]: normalized }));
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  }, [fetchMembersForCategory, membersByCategory]);

  const currentMembers = useMemo(
    () => (activeCategory ? membersByCategory[activeCategory.key] ?? [] : []),
    [membersByCategory, activeCategory]
  );

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return currentMembers;
    const q = memberSearch.toLowerCase();
    return currentMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.planName.toLowerCase().includes(q) ||
        m.userId.toLowerCase().includes(q)
    );
  }, [currentMembers, memberSearch]);

  const toggleMember = (id: string) => {
    if (id === currentUserId) return;
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
      filteredMembers.forEach((m) => {
        if (m.userId !== currentUserId) next.add(m.userId);
      });
      return next;
    });
  };
  const clearAllInCategory = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      filteredMembers.forEach((m) => {
        if (m.userId !== currentUserId) next.delete(m.userId);
      });
      return next;
    });
  };

  const handleCreate = async () => {
    const name = groupName.trim();
    if (!name) { setError("Group name is required"); return; }
    const selectableIds = Array.from(selected).filter((id) => id !== currentUserId);
    if (selectableIds.length === 0) { setError("Select at least one member"); return; }
    const selectedMembers = selectableIds
      .map(findMemberById)
      .filter((member): member is DirectoryMember => Boolean(member));
    if (selectedMembers.length !== selectableIds.length) {
      setError("Could not load details for every selected member. Please try again.");
      return;
    }
    setError(null);
    setCreatingGroup(true);
    try {
      await onCreate(name, selectedMembers);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create group.");
    } finally {
      setCreatingGroup(false);
    }
  };

  const findMemberById = (id: string): DirectoryMember | undefined => {
    for (const list of Object.values(membersByCategory)) {
      const found = list.find((m) => m.userId === id);
      if (found) return found;
    }
    return undefined;
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
              {step === "CATEGORY" ? "New Group" : (activeCategory?.label ?? "")}
            </h2>
            <p className="text-[11px] text-[#8C919C] dark:text-[#B5B5B5] truncate">
              {step === "CATEGORY"
                ? `${selected.size} member${selected.size === 1 ? "" : "s"} selected across categories`
                : membersLoading
                  ? "Loading members…"
                  : `${filteredMembers.length} member${filteredMembers.length === 1 ? "" : "s"} · ${filteredMembers.filter((m) => selected.has(m.userId)).length} selected here`}
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
                {Array.from(selected).map((id) => {
                  const m = findMemberById(id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FB] dark:bg-[#2F3550] px-2 py-[3px] text-[10.5px] font-medium text-[#576CBC] dark:text-[#A8B7E8]">
                      {m?.name ?? id}
                      <button type="button" onClick={() => toggleMember(id)} aria-label={`Remove ${m?.name ?? id}`} className="text-[#576CBC] hover:text-[#D14343] dark:text-[#A8B7E8]">
                        <FiX size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {step === "CATEGORY" ? (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-[#6D7280] dark:text-[#B5B5B5] mb-1">Pick categories to add members</p>
              {pickableCategories.map((cat) => {
                const list = membersByCategory[cat.key] ?? [];
                const selectedInCat = Array.from(selected).filter((id) =>
                  list.some((m) => m.userId === id)
                ).length;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat);
                      setStep("MEMBERS");
                      void loadMembersForCategory(cat);
                    }}
                    className="w-full flex items-center gap-3 rounded-xl border border-[#EEEEEE] dark:border-[#3F3F3F] bg-white dark:bg-[#242424] px-4 py-3 text-left hover:border-[#576CBC] hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#EEF2FB] text-[#576CBC]">
                      <span className="text-[14px] font-bold">{cat.short}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#101B41] dark:text-white truncate">{cat.label}</p>
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
                <button type="button" onClick={selectAllInCategory} className="text-[11px] font-semibold text-[#576CBC] hover:underline">Select all ({filteredMembers.length})</button>
                <button type="button" onClick={clearAllInCategory} className="text-[11px] font-semibold text-[#8C919C] hover:text-[#D14343]">Clear</button>
              </div>

              {membersLoading ? (
                <p className="py-8 text-center text-[11px] text-[#9A9EA8] dark:text-[#8a8a8a]">Loading members…</p>
              ) : membersError ? (
                <p role="alert" className="py-8 text-center text-[11px] text-red-500">{membersError}</p>
              ) : filteredMembers.length === 0 ? (
                <p className="py-8 text-center text-[11px] text-[#9A9EA8] dark:text-[#8a8a8a]">No members found</p>
              ) : (
                <div className="space-y-1.5">
                  {filteredMembers.map((member) => {
                    const isCurrentUser = member.userId === currentUserId;
                    const isChecked = !isCurrentUser && selected.has(member.userId);
                    const planColor = getPlanColor(member.planName);
                    return (
                      <button
                        key={member.userId}
                        type="button"
                        disabled={isCurrentUser}
                        onClick={() => toggleMember(member.userId)}
                        aria-label={isCurrentUser ? `${member.name} (you, cannot be added)` : member.name}
                        title={isCurrentUser ? "You cannot add yourself to the group." : undefined}
                        className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all
                          ${isCurrentUser
                            ? "cursor-not-allowed border-[#EEEEEE] bg-[#F3F4F6] opacity-60 dark:border-[#3F3F3F] dark:bg-[#2A2A2A]"
                            : isChecked
                              ? "border-[#576CBC] bg-[#F4F6FB] dark:bg-[#2A3050]"
                              : "border-[#EEEEEE] dark:border-[#3F3F3F] bg-white dark:bg-[#242424] hover:bg-[#F7F8FC] dark:hover:bg-[#2A2A2A]"}`}
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
                            <span className="text-[12.5px] font-semibold text-[#252B3A] dark:text-white truncate">
                              {member.name}{isCurrentUser ? " (You)" : ""}
                            </span>
                            {member.planName && (
                              <span className={`text-[10px] px-1.5 py-[1px] rounded flex-shrink-0 ${planColor.bg} ${planColor.text}`}>{member.planName}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#98A2B3] dark:text-[#8a8a8a] truncate mt-[2px]">
                            {categories.find((c) => c.key === member.role)?.label ?? member.role}
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
            <button
              onClick={handleCreate}
              disabled={creatingGroup}
              className="h-10 rounded-md bg-[#576CBC] text-white px-4 text-[12px] font-semibold hover:bg-[#4659a3] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingGroup ? "Creating..." : "Create Group"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewGroupModal;
