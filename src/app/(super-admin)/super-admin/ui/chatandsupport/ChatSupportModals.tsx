"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { IoChevronDown } from "react-icons/io5";

export interface BroadcastData {
  messageTitle: string;
  message: string;
  attachment: File | null;
}

export interface GroupFormData {
  groupName: string;
  description: string;
  planId: string;
  planName: string;
  profileImage: File | null;
  profilePreview: string | null;
  selectedPeople: string[];
}

interface PlanOption {
  _id: string;
  planName: string;
}

interface MemberOption {
  id: string;
  name: string;
  plan: string;
}

interface PlanColor {
  bg: string;
  text: string;
  dot: string;
}

interface GroupDetailsUser {
  userName: string;
  profileImage?: string;
  members?: { name: string; plan: string }[];
}

export function BroadcastModal({
  data,
  onChange,
  onClose,
  onSend,
}: {
  data: BroadcastData;
  onChange: (field: "messageTitle" | "message", value: string) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-[420px] bg-white dark:bg-[#343434] rounded-md shadow-xl"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-[16px] font-semibold text-[#010E30] dark:text-white">Broadcast Chat</h2>
            <button onClick={onClose} className="text-[#777D89] text-xl">×</button>
          </div>
          <div className="p-4 space-y-3">
            <input
              type="text"
              value={data.messageTitle}
              onChange={(event) => onChange("messageTitle", event.target.value)}
              placeholder="Message Title"
              className="w-full h-9 border border-[#D9DBE2] rounded-md px-3 text-[12px] dark:bg-[#2c2c2c] dark:text-white dark:border-[#4A4A4A]"
            />
            <textarea
              value={data.message}
              onChange={(event) => onChange("message", event.target.value)}
              placeholder="Type your message..."
              className="w-full h-[100px] border border-[#D9DBE2] rounded-md p-2 text-[12px] dark:bg-[#2c2c2c] dark:text-white dark:border-[#4A4A4A]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="h-9 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold">Cancel</button>
              <button onClick={onSend} className="h-9 rounded-md bg-[#576CBC] text-white px-4 text-[12px] font-semibold">Send All Tenant</button>
            </div>
          </div>
        </motion.div>
    </motion.div>
  );
}

export function AddGroupModal({
  data,
  plans,
  plansLoading,
  members,
  membersLoading,
  error,
  isCreating,
  getPlanColor,
  onChange,
  onToggleMember,
  onClose,
  onCreate,
}: {
  data: GroupFormData;
  plans: PlanOption[];
  plansLoading: boolean;
  members: MemberOption[];
  membersLoading: boolean;
  error: string | null;
  isCreating: boolean;
  getPlanColor: (plan?: string) => PlanColor;
  onChange: (updates: Partial<GroupFormData>) => void;
  onToggleMember: (id: string) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const selectedCount = members.filter((member) => data.selectedPeople.includes(member.id)).length;

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full sm:max-w-[460px] max-h-[92vh] bg-white dark:bg-[#2c2c2c] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="px-5 pt-4 pb-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F]">
            <h2 className="text-[16px] font-semibold text-[#101B41] dark:text-white">Add Group</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="relative self-start">
                <label className="cursor-pointer block">
                  <div className="w-[60px] h-[60px] rounded-2xl bg-[#E7E8EC] dark:bg-[#3A3A3A] flex items-center justify-center overflow-hidden">
                    {data.profilePreview ? <Image src={data.profilePreview} alt="Preview" width={60} height={60} unoptimized className="w-full h-full object-cover" /> : <span className="text-[28px] font-medium text-[#9297A2] dark:text-[#B5B5B5]">G</span>}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      onChange({ profileImage: file, profilePreview: file ? URL.createObjectURL(file) : null });
                    }}
                  />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-white">Group Name</label>
                <input type="text" value={data.groupName} onChange={(event) => onChange({ groupName: event.target.value })} className="w-full h-10 sm:h-9 rounded-md border border-[#D5D9E2] bg-white px-3 text-[12px] dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A]" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-white">Select Plan</label>
              <div className="relative">
                <button type="button" disabled={plansLoading || plans.length === 0} onClick={() => setPlanDropdownOpen((open) => !open)} className="w-full h-10 sm:h-9 rounded-md border border-[#D5D9E2] bg-white px-3 text-[12px] text-left flex items-center justify-between disabled:opacity-60 dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A]">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getPlanColor(data.planName).dot }} />
                    {plansLoading ? "Loading plans…" : data.planName || "Select Plan"}
                  </span>
                  <IoChevronDown className="text-[#777D89]" />
                </button>
                {planDropdownOpen && plans.length > 0 && (
                  <div className="absolute left-0 right-0 top-11 z-20 max-h-[220px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:bg-[#3A3A3A] dark:border-gray-700">
                    {plans.map((plan) => {
                      const color = getPlanColor(plan.planName);
                      return <button key={plan._id} onClick={() => { onChange({ planId: plan._id, planName: plan.planName, selectedPeople: [] }); setPlanDropdownOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-[12px] hover:bg-gray-100 dark:text-gray-200"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.dot }} />{plan.planName}</button>;
                    })}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-white">Description</label>
              <textarea value={data.description} onChange={(event) => onChange({ description: event.target.value })} placeholder="Short description..." rows={2} className="w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2 text-[12px] resize-none dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A]" />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between rounded-t-md border border-b-0 border-[#E6EAF2] bg-[#F8F9FC] px-3 py-2 dark:bg-[#2c2c2c] dark:border-[#4A4A4A]">
                <span className="text-[12px] font-medium text-[#101B41] dark:text-white">Select Members</span>
                <span className="rounded-md bg-[#E6F0EC] text-[#2F7A5C] px-2 py-0.5 text-[11px] font-semibold">{String(selectedCount).padStart(2, "0")} selected</span>
              </div>
              <div className="max-h-[240px] overflow-y-auto rounded-b-md border border-[#E6EAF2] bg-white p-2 space-y-1 dark:bg-[#343434] dark:border-[#4A4A4A]">
                {membersLoading ? <p className="py-4 text-center text-[11px] text-gray-400">Loading members…</p> : members.length === 0 ? <p className="py-4 text-center text-[11px] text-gray-400">No members found for this plan</p> : members.map((member) => {
                  const color = getPlanColor(member.plan);
                  return <label key={member.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[12px] hover:bg-[#F8F9FC] dark:hover:bg-[#3A3A3A]"><input type="checkbox" checked={data.selectedPeople.includes(member.id)} onChange={() => onToggleMember(member.id)} className="h-3.5 w-3.5 accent-[#576CBC]" /><span className="flex-1 truncate text-[#101B41] dark:text-white">{member.name}</span><span className={`text-[10px] px-1.5 py-[1px] rounded ${color.bg} ${color.text}`}>{member.plan}</span></label>;
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-[#F0F1F4] dark:border-[#3F3F3F]">
            {error ? <span className="text-[11px] text-red-500">{error}</span> : <span />}
            <div className="flex gap-2">
              <button onClick={onClose} className="h-10 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold">Cancel</button>
              <button onClick={onCreate} disabled={isCreating} className="h-10 rounded-md bg-[#576CBC] text-white px-4 text-[12px] font-semibold disabled:opacity-60">{isCreating ? "Creating…" : "Done"}</button>
            </div>
          </div>
        </motion.div>
    </motion.div>
  );
}

export function GroupDetailsModal({
  user,
  imagePreview,
  showDeleteConfirm,
  getPlanColor,
  onImageChange,
  onRemoveMember,
  onToggleDeleteConfirm,
  onDelete,
  onClose,
  onSave,
}: {
  user: GroupDetailsUser;
  imagePreview: string | null;
  showDeleteConfirm: boolean;
  getPlanColor: (plan?: string) => PlanColor;
  onImageChange: (file: File | null) => void;
  onRemoveMember: (index: number) => void;
  onToggleDeleteConfirm: (show: boolean) => void;
  onDelete: () => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={(event) => event.stopPropagation()} className="w-full sm:max-w-[460px] max-h-[92vh] bg-white dark:bg-[#2c2c2c] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[#F0F1F4] dark:border-[#3F3F3F]"><h2 className="text-[16px] font-semibold text-[#101B41] dark:text-white">Group Details</h2></div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="flex gap-4">
              <label className="cursor-pointer block relative">
                <div className="w-[66px] h-[66px] rounded-2xl bg-[#E7E8EC] dark:bg-[#3A3A3A] flex items-center justify-center overflow-hidden">
                  {imagePreview || user.profileImage ? <Image src={imagePreview || user.profileImage || ""} alt={user.userName} width={66} height={66} unoptimized className="w-full h-full object-cover" /> : <span className="text-[28px] font-medium text-[#9297A2]">{user.userName?.charAt(0)?.toUpperCase() ?? "G"}</span>}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(event) => onImageChange(event.target.files?.[0] ?? null)} />
              </label>
              <div className="flex-1"><label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-white">Group Name</label><input type="text" value={user.userName || ""} readOnly className="w-full h-10 rounded-md border border-[#D5D9E2] bg-white px-3 text-[12px] dark:bg-[#343434] dark:text-white dark:border-[#4A4A4A]" /></div>
            </div>
            <div className="rounded-md border border-[#E6EAF2] dark:border-[#4A4A4A] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#E6EAF2] bg-[#F8F9FC] px-3 py-2 dark:bg-[#2c2c2c] dark:border-[#4A4A4A]"><span className="text-[13px] font-medium text-[#101B41] dark:text-white">Group Members</span><span className="rounded-md bg-[#E6F0EC] text-[#2F7A5C] px-2 py-0.5 text-[11px] font-semibold">{String(user.members?.length ?? 0).padStart(2, "0")}</span></div>
              <div className="max-h-[200px] overflow-y-auto bg-white p-2 space-y-1 dark:bg-[#343434]">
                {(user.members ?? []).map((member, index) => { const color = getPlanColor(member.plan); return <div key={`${member.name}-${index}`} className="flex items-center gap-2 rounded px-2 py-1.5"><span className="flex-1 text-[12px] text-[#101B41] dark:text-white truncate">{member.name}</span><span className={`text-[11px] ${color.text}`}>{member.plan}</span><button type="button" onClick={() => onRemoveMember(index)} className="flex h-6 w-6 items-center justify-center rounded-md text-[#9EA3AE] hover:text-[#D14343]">🗑</button></div>; })}
              </div>
            </div>
            <div className="rounded-md border border-[#F5D0D0] bg-[#FFF8F8] p-3 dark:bg-[#3A2525] dark:border-[#5A2A2A]"><p className="mb-1 text-[13px] font-medium text-[#D14343]">Delete Group</p><p className="mb-3 text-[11px] text-[#8C919C]">Once deleted, this group and all messages will be permanently removed.</p>
              {!showDeleteConfirm ? <button onClick={() => onToggleDeleteConfirm(true)} className="h-9 rounded-md border border-[#D14343] text-[#D14343] px-4 text-[12px] font-semibold">Delete Group</button> : <div className="flex gap-2"><button onClick={() => onToggleDeleteConfirm(false)} className="flex-1 h-9 rounded-md border border-[#D5D9E2] px-3 text-[12px] font-semibold">Cancel</button><button onClick={onDelete} className="flex-1 h-9 rounded-md bg-[#D14343] text-white px-3 text-[12px] font-semibold">Yes, Delete</button></div>}
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-[#F0F1F4] dark:border-[#3F3F3F]"><button onClick={onClose} className="h-10 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold">Cancel</button><button onClick={onSave} className="h-10 rounded-md bg-[#576CBC] text-white px-4 text-[12px] font-semibold">Done</button></div>
        </motion.div>
      </motion.div>
  );
}