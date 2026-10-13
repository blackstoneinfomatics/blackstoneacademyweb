"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiMoreVertical, FiPlus, FiX } from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { GrAttachment } from "react-icons/gr";
import { motion } from "framer-motion";
import type { IMessage, IUser } from "./chat-types";

const ReceiptDots = ({ delivered, seen }: { delivered: boolean; seen: boolean }) => (
  <span className="ml-1 inline-flex items-center gap-[3px]">
    <span className={`inline-block h-[6px] w-[6px] rounded-full ${delivered ? "bg-white/90" : "bg-white/40"}`} />
    <span className={`inline-block h-[6px] w-[6px] rounded-full ${seen ? "bg-[#22C55E]" : "bg-white/40"}`} />
  </span>
);

const MessageMenu = ({
  showInfo, showReply, showDelete, onInfo, onReply, onDelete,
}: {
  showInfo: boolean; showReply: boolean; showDelete: boolean;
  onInfo: () => void; onReply: () => void; onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-sm hover:bg-white dark:bg-[#2C2C2C]/80 dark:text-gray-300"
        aria-label="Message options">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-30 w-24 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-[#454545] dark:bg-[#2C2C2C]">
          {showInfo && <button type="button" onClick={() => { onInfo(); setOpen(false); }} className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]">Info</button>}
          {showReply && <button type="button" onClick={() => { onReply(); setOpen(false); }} className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]">Reply</button>}
          {showDelete && <button type="button" onClick={() => { onDelete(); setOpen(false); }} className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3A3A3A]">Delete</button>}
        </div>
      )}
    </div>
  );
};


interface ChatPanelProps {
  selectedUser: IUser | null;
  getStatusColor: (status: string) => string;
  currentUser: { userId: string };
  showGroupMenu: boolean;
  setShowGroupMenu: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenGroupDetails: () => void;
  handleClearChat: () => void;
  handleDeleteChat: () => void;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesLoading: boolean;
  selectedMessages: IMessage[];
  groupedMessages: Record<string, IMessage[]>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  setInfoMessage: React.Dispatch<React.SetStateAction<IMessage | null>>;
  setReplyTo: React.Dispatch<React.SetStateAction<IMessage | null>>;
  handleDeleteMessage: (messageId: string) => void;
  replyTo: IMessage | null;
  canSend: boolean;
  messageText: string;
  setMessageText: (value: string) => void;
  handleSendMessage: () => Promise<string | null>;
}

const ChatPanel = ({
  selectedUser, getStatusColor, currentUser, showGroupMenu, setShowGroupMenu,
  handleOpenGroupDetails, handleClearChat, handleDeleteChat, messagesContainerRef,
  messagesLoading, selectedMessages, groupedMessages, messagesEndRef,
  setInfoMessage, setReplyTo, handleDeleteMessage, replyTo, canSend,
  messageText, setMessageText, handleSendMessage,
}: ChatPanelProps) => (
  <div className="flex-1 min-w-0 h-full bg-white dark:bg-[#343434] rounded-lg shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                <div className="flex-shrink-0 h-[58px] px-4 border-b border-[#EEEEEE] dark:border-[#3F3F3F] flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-md bg-[#E7E8EC] dark:bg-[#242424] flex items-center justify-center overflow-hidden">
                        {selectedUser.profileImage ? (
                          <img src={selectedUser.profileImage} alt={selectedUser.userName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[13px] font-semibold text-[#9297A2] dark:text-[#B5B5B5]">
                            {selectedUser.userName?.charAt(0)?.toUpperCase() ?? "B"}
                          </span>
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#343434] ${getStatusColor(selectedUser.status)}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-semibold text-[#252B3A] dark:text-white truncate">{selectedUser.userName}</h3>
                      {selectedUser.role.includes("Group") ? (
                        <p className="text-[10px] text-[#8C919C] dark:text-[#B5B5B5] flex items-center gap-1">
                          Members
                          <span className="rounded bg-[#E6EAF2] px-1.5 py-[1px] text-[9px] font-medium text-[#576CBC] dark:bg-[#3A4570] dark:text-[#A8B7E8]">
                            {selectedUser.members?.filter((m: any) => m.isSelected !== false).length ?? 0}
                          </span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#8C919C] dark:text-[#B5B5B5] truncate">{selectedUser.role[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowGroupMenu((o) => !o)}
                      className="text-[#777D89] dark:text-[#B5B5B5] p-2 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-md"
                    >
                      <FiMoreVertical size={15} />
                    </button>
                    {showGroupMenu && (
                      <div className="absolute right-0 top-10 z-40 w-[130px] bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        {(selectedUser.isGroup || selectedUser.role.includes("Group")) && (
                          <button className="block w-full text-left px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200" onClick={handleOpenGroupDetails}>
                            Group Details
                          </button>
                        )}
                        <button className="block w-full text-left px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200" onClick={handleClearChat}>
                          Clear chat
                        </button>
                        <button className="block w-full text-left px-3 py-2 text-[11px] text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]" onClick={handleDeleteChat}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 bg-[#FBFBFB] dark:bg-[#2c2c2c]">
                  {messagesLoading ? (
                    <p className="py-6 text-center text-[11px] text-gray-400">Loading messages…</p>
                  ) : selectedMessages.length === 0 ? (
                    <p className="py-6 text-center text-[11px] text-gray-400">No messages yet</p>
                  ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                      <div key={date} className="mb-2">
                        <div className="flex items-center justify-center my-4">
                          <span className="text-[10px] font-medium text-[#A3A7B0] dark:text-[#8a8a8a] bg-white dark:bg-[#2c2c2c] px-3 py-1 rounded-full border border-[#EEEEEE] dark:border-[#3F3F3F]">
                            {date}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {msgs.map((msg) => {
                            const isMine = msg.side ? msg.side === "right" : msg.senderId === currentUser.userId;
                            return (
                              <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <div className="group relative max-w-[65%]">
                                  <div className={`px-3 py-2 rounded-2xl inline-block
                                    ${isMine
                                      ? msg.isDeleted
                                        ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-br-md"
                                        : "bg-[#576CBC] text-white rounded-br-md"
                                      : msg.isDeleted
                                        ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-bl-md"
                                        : "bg-white dark:bg-[#242424] text-[#252B3A] dark:text-[#E2E2E2] border border-[#EEEEEE] dark:border-[#333] rounded-bl-md"}`}>
                                    {msg.messages && (
                                      <p className="text-[12px] leading-[18px] break-words whitespace-pre-wrap">{msg.messages}</p>
                                    )}
                                    <div className={`mt-1 flex items-center justify-end gap-1 text-[10px]
                                      ${isMine ? "text-white/70" : "text-[#9B9FA8] dark:text-[#8a8a8a]"}`}>
                                      <span className="leading-none">{msg.time}</span>
                                      {isMine && <ReceiptDots delivered={!!msg.deliveredAt} seen={!!msg.seenAt} />}
                                    </div>
                                  </div>
                                  {!msg.isDeleted && (
                                    <MessageMenu
                                      showInfo={isMine}
                                      showReply={msg.canReply !== false}
                                      showDelete={isMine}
                                      onInfo={() => setInfoMessage(msg)}
                                      onReply={() => setReplyTo(msg)}
                                      onDelete={() => handleDeleteMessage(msg._id)}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex-shrink-0 border-t border-[#EEEEEE] dark:border-[#3F3F3F] p-3 bg-white dark:bg-[#343434]">
                  {replyTo && (
                    <div className="mb-2 flex items-start justify-between gap-2 rounded-md border-l-2 border-[#576CBC] bg-[#F4F6FB] dark:bg-[#2c2c2c] px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-[#576CBC]">{replyTo.senderName}</p>
                        <p className="truncate text-[11px] text-[#555D70] dark:text-[#C5C7CE]">{replyTo.messages}</p>
                      </div>
                      <button onClick={() => setReplyTo(null)} className="text-[#7C8492] hover:text-[#252B3A] dark:hover:text-white">
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                  {canSend ? (
                    <div className="flex items-center rounded-lg bg-gray-50 dark:bg-[#2c2c2c] p-1">
                      <button className="p-1.5 text-[#010E30] dark:text-[#FFFFFF] ml-1">
                        <GrAttachment size={14} />
                      </button>
                      <input
                        type="text"
                        placeholder="Type a message"
                        className="flex-1 px-2 py-1.5 text-xs bg-transparent outline-none text-[#010E30] dark:text-[#FFFFFF]"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && messageText.trim()) handleSendMessage(); }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSendMessage()}
                        disabled={!messageText.trim()}
                        className={`p-1.5 rounded-lg flex items-center ${messageText.trim() ? "bg-[#576CBC] text-white" : "bg-gray-200 dark:bg-[#505050] text-gray-400 cursor-not-allowed"}`}
                      >
                        <FaTelegramPlane size={14} />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-[#F5F6FA] dark:bg-[#2c2c2c] px-4 py-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#7C8492]">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      <span className="text-[11px] text-[#7C8492] dark:text-[#B5B5B5]">Only admins can send messages in this chat</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#EEF2FB] dark:bg-[#2c2c2c] flex items-center justify-center">
                  <FiPlus size={22} className="text-[#576CBC]" />
                </div>
                <p className="text-[13px] font-medium text-[#252B3A] dark:text-white">No conversation selected</p>
                <p className="text-[11px] text-[#9A9EA8] dark:text-[#8a8a8a] text-center max-w-[240px]">
                  Pick a category, then start a new chat or create a group.
                </p>
              </div>
            )}
          </div>
);

export default ChatPanel;
