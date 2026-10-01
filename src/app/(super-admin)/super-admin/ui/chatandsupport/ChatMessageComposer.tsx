"use client";

import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { FaTelegramPlane } from "react-icons/fa";
import { motion } from "framer-motion";

export interface ReplyTarget {
  messages: string;
  senderName: string;
}

export function ChatMessageComposer({
  roomId,
  messageText,
  replyTo,
  onMessageTextChange,
  onClearReply,
  onSendMessage,
  formatFileSize,
}: {
  roomId: string;
  messageText: string;
  replyTo: ReplyTarget | null;
  onMessageTextChange: (value: string) => void;
  onClearReply: () => void;
  onSendMessage: (
    message: string,
    attachment: File | null,
    attachmentName: string
  ) => Promise<string | null>;
  formatFileSize: (bytes: number) => string;
}) {
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [pendingName, setPendingName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target as Node)
      ) {
        setAttachmentMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setPendingAttachment(null);
    setPendingName("");
    setEditingName(false);
    setAttachmentMenuOpen(false);
  }, [roomId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setPendingAttachment(file);
      setPendingName(file.name);
    }
    event.target.value = "";
  };

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;
    setIsSending(true);
    setSendError(null);

    try {
      const error = await onSendMessage(messageText, pendingAttachment, pendingName);
      if (error) {
        setSendError(error);
        return;
      }

      setPendingAttachment(null);
      setPendingName("");
      setEditingName(false);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Message could not be sent.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-3 border-t border-[#EEEEEE] dark:border-[#3F3F3F]">
      {sendError && (
        <p role="alert" className="mb-2 text-[11px] text-red-500">
          {sendError}
        </p>
      )}
      {replyTo && (
        <div className="mb-2 flex items-start justify-between rounded-md border-l-4 border-[#576CBC] bg-[#F0F1F3] dark:bg-[#2c2c2c] px-3 py-2 text-[11px]">
          <div className="min-w-0">
            <p className="font-semibold text-[#576CBC] dark:text-[#A8B7E8]">
              Replying to {replyTo.senderName}
            </p>
            <p className="truncate text-[#252B3A] dark:text-[#E2E2E2]">
              {replyTo.messages || "📎 Attachment"}
            </p>
          </div>
          <button onClick={onClearReply} className="ml-2 text-gray-400">
            ✕
          </button>
        </div>
      )}

      {pendingAttachment && (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-[#E6EAF2] bg-[#F8F9FC] px-2 py-1.5 dark:border-[#4A4A4A] dark:bg-[#2c2c2c]">
          <div className="min-w-0 flex-1">
            {editingName ? (
              <input
                autoFocus
                type="text"
                value={pendingName}
                onChange={(event) => setPendingName(event.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setEditingName(false);
                  if (event.key === "Escape") {
                    setPendingName(pendingAttachment.name);
                    setEditingName(false);
                  }
                }}
                className="w-full rounded border border-[#576CBC] bg-white px-1 py-[1px] text-[11px] dark:bg-[#343434] dark:text-white"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="block max-w-full truncate text-left text-[11px] font-medium text-[#252B3A] hover:text-[#576CBC] dark:text-white"
              >
                {pendingName || pendingAttachment.name}
              </button>
            )}
            <p className="text-[10px] text-[#8C919C]">
              {formatFileSize(pendingAttachment.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setPendingAttachment(null);
              setPendingName("");
              setEditingName(false);
            }}
            className="ml-1 text-gray-400"
          >
            ✕
          </button>
        </div>
      )}

      <div className="h-10 bg-[#F6F7F9] dark:bg-[#2c2c2c] rounded-md flex items-center px-2">
        <div className="relative" ref={attachmentMenuRef}>
          <button
            type="button"
            onClick={() => setAttachmentMenuOpen((open) => !open)}
            className="p-2 text-[#8E939D] dark:text-[#B5B5B5] hover:text-[#576CBC]"
          >
            <GrAttachment size={13} />
          </button>
          {attachmentMenuOpen && (
            <div className="absolute bottom-10 left-0 z-40 w-32 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-[#454545] dark:bg-[#2C2C2C]">
              <button
                type="button"
                onClick={() => {
                  setAttachmentMenuOpen(false);
                  docInputRef.current?.click();
                }}
                className="block w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-100 dark:text-gray-200"
              >
                Document
              </button>
              <button
                type="button"
                onClick={() => {
                  setAttachmentMenuOpen(false);
                  fileInputRef.current?.click();
                }}
                className="block w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-100 dark:text-gray-200"
              >
                Files
              </button>
            </div>
          )}
        </div>

        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.odt"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        <input
          type="text"
          placeholder="Type a message"
          value={messageText}
          onChange={(event) => {
            setSendError(null);
            onMessageTextChange(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (messageText.trim() || pendingAttachment)) {
              handleSend();
            }
          }}
          className="flex-1 bg-transparent outline-none text-[11px] text-[#252B3A] dark:text-[#E2E2E2] placeholder:text-[#A5A9B2] dark:placeholder:text-[#7A7A7A]"
        />
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={isSending}
          className="p-2 text-[#576CBC]"
        >
          <FaTelegramPlane size={13} />
        </motion.button>
      </div>
    </div>
  );
}
