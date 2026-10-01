"use client";

import { motion } from "framer-motion";

export interface BroadcastData {
  messageTitle: string;
  message: string;
  attachment: File | null;
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
          <h2 className="text-[16px] font-semibold text-[#010E30] dark:text-white">
            Broadcast Chat
          </h2>
          <button onClick={onClose} className="text-[#777D89] text-xl">
            ×
          </button>
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
            <button
              onClick={onClose}
              className="h-9 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              className="h-9 rounded-md bg-[#576CBC] text-white px-4 text-[12px] font-semibold"
            >
              Send All Tenant
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
