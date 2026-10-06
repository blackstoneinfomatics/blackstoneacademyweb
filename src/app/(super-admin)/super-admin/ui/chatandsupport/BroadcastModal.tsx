"use client";

import { motion } from "framer-motion";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

export interface BroadcastData {
  messageTitle: string;
  message: string;
  attachment: File | null;
}

const GLOBAL_ROOM_ID = "6abcf6069c158042d7a51acd";


export function BroadcastModal({
  data,
  onChange,
  onClose,
  onSend,
}: {
  data: BroadcastData;
  onChange: (
    field: "messageTitle" | "message" | "attachment",
    value: string | File | null
  ) => void;
  onClose: () => void;
  onSend: () => void;
}) {
const handleSend = async () => {
  try {
    if (!data.messageTitle.trim()) {
      alert("Message title is required");
      return;
    }

    if (!data.message.trim() && !data.attachment) {
      alert("Message or attachment is required");
      return;
    }

    if (data.attachment) {
      alert(
        "Attachments are not supported by this endpoint. Remove the file to send the message."
      );
      return;
    }

    const token = localStorage.getItem("SuperAdminAuthToken");
    const senderId = localStorage.getItem("SuperAdminUserId");
    const senderName = localStorage.getItem("SuperAdminPortalName");
    const senderRole = localStorage.getItem("SuperAdminRole");

    if ( !senderId || !senderName || !senderRole) {
      throw new Error("Super admin session details are missing. Please sign in again.");
    }

    const response = await fetch(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CHAT.MESSAGE}`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomId: GLOBAL_ROOM_ID,
        senderId,
        senderName,
        senderRole,
        messageType: "TEXT",
        message: data.message.trim(),
        title: data.messageTitle.trim(),
        attachments: [],
      }),
      },
    );

    const responseText = await response.text();
    let result: { success?: boolean; message?: string; error?: string } = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = {};
    }

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message ||
          result.error ||
          responseText ||
          `Failed to send broadcast message (HTTP ${response.status})`
      );
    }


    console.log("Broadcast message sent:", result);

    onSend();
    onClose();
  } catch (error) {
    console.error("Broadcast message error:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to send broadcast message"
    );
  }
};

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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-[16px] font-semibold text-[#010E30] dark:text-white">
            Broadcast Chat
          </h2>

          <button
            onClick={onClose}
            className="text-[#777D89] text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
      <label className="block text-[13px] font-medium text-[#0F1B3D] dark:text-white ">
              Message Title
            </label>
          {/* Message Title */}
          <input
            type="text"
            value={data.messageTitle}
            onChange={(event) =>
              onChange("messageTitle", event.target.value)
            }
            placeholder="Message Title"
            className="w-full h-9 border border-[#D9DBE2] rounded-md px-3 text-[12px] dark:bg-[#2c2c2c] dark:text-white dark:border-[#4A4A4A]"
          />

          {/* Message */}
          <label className="block text-[13px] font-medium text-[#0F1B3D] dark:text-white ">
              Description
            </label>
          <textarea
            value={data.message}
            onChange={(event) =>
              onChange("message", event.target.value)
            }
            placeholder="Type your message..."
            className="w-full h-[100px] border border-[#D9DBE2] rounded-md p-2 text-[12px] dark:bg-[#2c2c2c] dark:text-white dark:border-[#4A4A4A]"
          />

          {/* Attachments */}
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-[#0F1B3D] dark:text-white mb-2">
              Attachments
            </label>

            <div
              className="w-full h-12 border border-[#D9DBE2] rounded-md
                flex items-center justify-between px-3
                dark:bg-[#2c2c2c] dark:border-[#4A4A4A]"
            >
              <span className="text-[13px] text-[#374151] dark:text-white truncate max-w-[280px]">
                {data.attachment?.name || "File"}
              </span>

              <label className="cursor-pointer text-[13px] text-[#5269D9]">
                Upload

                <input
                  type="file"
                  className="hidden"
                  onChange={(event) =>
                    onChange(
                      "attachment",
                      event.target.files?.[0] || null
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="h-9 rounded-md border border-[#576CBC] text-[#576CBC] px-4 text-[12px] font-semibold"
            >
              Cancel
            </button>

            <button
              onClick={handleSend}
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