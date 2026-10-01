"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface GroupDetailsUser {
  userName: string;
  profileImage?: string;
  members?: { name: string; plan: string }[];
}

interface PlanColor {
  text: string;
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
