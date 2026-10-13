"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import type { CategoryDef, DirectoryMember } from "../chat-types";

interface NewChatModalProps {
  category: string;
  categories: CategoryDef[];
  onClose: () => void;
  onCreateChat: (member: DirectoryMember) => Promise<void>;
  getPlanColor: (plan?: string) => { bg: string; text: string; dot: string };
  fetchMembersForCategory: (category: CategoryDef) => Promise<DirectoryMember[]>;
}

const NewChatModal = ({
  category: initialCategory,
  categories,
  onClose,
  onCreateChat,
  getPlanColor,
  fetchMembersForCategory,
}: NewChatModalProps) => {
  const startOnCategoryPicker = !initialCategory || initialCategory === "ALL";
  const pickableCategories = useMemo(
    () => categories.filter((c) => c.key !== "ALL" && c.key !== "SUPERADMIN" && c.key !== "GROUP"),
    [categories]
  );

  const [step, setStep] = useState<"CATEGORY" | "MEMBERS">(
    startOnCategoryPicker ? "CATEGORY" : "MEMBERS"
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryDef | null>(() => {
    if (startOnCategoryPicker) return null;
    return categories.find((c) => c.key === initialCategory) ?? null;
  });
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<DirectoryMember | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const loadMembersForCategory = useCallback(async (cat: CategoryDef) => {
    setMembersLoading(true);
    setMembersError(null);
    setMembers([]);

    try {
      setMembers(await fetchMembersForCategory(cat));
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : "Failed to load members");
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [fetchMembersForCategory]);

  useEffect(() => {
    if (step !== "MEMBERS") return;
    if (!selectedCategory) return;
    if (members.length > 0) return;
    void loadMembersForCategory(selectedCategory);
  }, [step, selectedCategory]);

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.planName.toLowerCase().includes(q) ||
        m.userId.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

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
              onClick={() => { setStep("CATEGORY"); setMemberSearch(""); setSelectedMember(null); }}
              aria-label="Back"
              className="h-8 w-8 flex items-center justify-center rounded-md text-[#576CBC] hover:bg-[#EEF2FB] dark:hover:bg-[#2F2F2F] transition-colors"
            >
              <FiArrowLeft size={16} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-semibold text-[#101B41] dark:text-white truncate">
              {step === "CATEGORY" ? "New Chat" : `New Chat · ${selectedCategory?.label ?? ""}`}
            </h2>
            <p className="text-[11px] text-[#8C919C] dark:text-[#B5B5B5] truncate">
              {step === "CATEGORY"
                ? "Pick a category to see members"
                : membersLoading
                  ? "Loading members…"
                  : `${filteredMembers.length} member${filteredMembers.length === 1 ? "" : "s"}`}
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
              {pickableCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setSelectedCategory(cat);
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#9EA3AE] flex-shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
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

              {membersLoading ? (
                <p className="py-8 text-center text-[11px] text-[#9A9EA8] dark:text-[#8a8a8a]">Loading members…</p>
              ) : membersError ? (
                <p role="alert" className="py-8 text-center text-[11px] text-red-500">{membersError}</p>
              ) : filteredMembers.length === 0 ? (
                <p className="py-8 text-center text-[11px] text-[#9A9EA8] dark:text-[#8a8a8a]">No members found</p>
              ) : (
                <div className="space-y-2">
                  {filteredMembers.map((member) => {
                    const isSelected = selectedMember?.userId === member.userId;
                    const planColor = getPlanColor(member.planName);
                    return (
                      <div
                        key={member.userId}
                        className={`rounded-xl border bg-white dark:bg-[#242424] overflow-hidden transition-all ${isSelected ? "border-[#576CBC] shadow-sm" : "border-[#EEEEEE] dark:border-[#3F3F3F]"}`}
                      >
                        <button
                          onClick={() => { setSelectedMember(isSelected ? null : member); setCreateError(null); }}
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
                            <p className="text-[11px] text-[#98A2B3] dark:text-[#8a8a8a] truncate mt-[2px]">
                              {categories.find((c) => c.key === member.role)?.label ?? member.role}
                            </p>
                          </div>
                          <span className="flex-shrink-0 text-[10px] font-semibold text-[#576CBC]">{isSelected ? "Selected" : "Select"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-5 py-3 border-t border-[#F0F1F4] dark:border-[#3F3F3F]">
          {createError ? <p role="alert" className="text-[11px] text-red-500">{createError}</p> : <span />}
          <button onClick={onClose} className="h-10 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold hover:bg-[#EEF2FB] dark:hover:bg-[#2F2F2F] transition-colors">
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedMember || creatingChat}
            onClick={async () => {
              if (!selectedMember) return;
              setCreatingChat(true);
              setCreateError(null);
              try {
                await onCreateChat(selectedMember);
              } catch (error) {
                setCreateError(error instanceof Error ? error.message : "Could not create chat.");
              } finally {
                setCreatingChat(false);
              }
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#576CBC] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#4659a3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiPlus size={14} />
            {creatingChat ? "Creating..." : "Create Chat"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewChatModal;
