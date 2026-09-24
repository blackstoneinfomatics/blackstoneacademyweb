"use client";

import { IoClose } from "react-icons/io5";
import type { Ticket } from "../types";

interface ViewTicketDetailsProps {
  ticket: Ticket;
  onClose?: () => void;
}

export default function ViewTicketDetails({ ticket, onClose }: ViewTicketDetailsProps) {
  const {
    ticketId,
    tenantName,
    category,
    status,
    subject,
    description = "No additional description provided for this ticket.",
    plan = "Standard",
    tenantMessages = 0,
    adminReplies = 0,
    firstMessage = ticket.createdOn,
    lastReply = ticket.resolvedOn !== "-" ? ticket.resolvedOn : ticket.createdOn,
  } = ticket;

  return (
    <div className="w-full max-w-[640px] rounded-lg bg-white dark:bg-[#343434] p-4 shadow-sm">
      {/* Title */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-[16px] font-semibold text-[#172554] dark:text-white">
          View Ticket Details
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="text-[#9CA3AF] hover:text-[#172554] dark:hover:text-white"
        >
          <IoClose size={20} />
        </button>
      </div>

      {/* ================= TICKET DETAILS ================= */}
      <div className="mb-3 rounded-md border border-[#E1E5EC] dark:border-[#3F3F3F] p-3">
        <h3 className="mb-3 text-[13px] font-semibold text-[#172554] dark:text-white">
          Ticket Details
        </h3>

        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {/* Ticket ID */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Ticket ID
            </label>

            <input
              value={ticketId}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>

          {/* Tenant */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Tenant
            </label>

            <input
              value={tenantName}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Category
            </label>

            <input
              value={category}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Status
            </label>

            <input
              value={status}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#E5A32A] outline-none"
            />
          </div>

          {/* Subject */}
          <div className="col-span-2">
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Subject
            </label>

            <input
              value={subject}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Description
            </label>

            <textarea
              value={description}
              readOnly
              className="h-[70px] w-full resize-none rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] p-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>
        </div>
      </div>

      {/* ================= TENANT INFORMATION ================= */}
      <div className="mb-3 rounded-md border border-[#E1E5EC] dark:border-[#3F3F3F] p-3">
        <h3 className="mb-3 text-[13px] font-semibold text-[#172554] dark:text-white">
          Tenant Information
        </h3>

        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {/* Tenant Name */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Tenant Name
            </label>

            <input
              value={tenantName}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>

          {/* Plan */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Plan
            </label>

            <input
              value={plan}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>
        </div>
      </div>

      {/* ================= CONVERSATION SUMMARY ================= */}
      <div className="rounded-md border border-[#E1E5EC] dark:border-[#3F3F3F] p-3">
        <h3 className="mb-3 text-[13px] font-semibold text-[#172554] dark:text-white">
          Conversation Summary
        </h3>

        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {/* Tenant Messages */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Tenant Messages
            </label>

            <input
              value={tenantMessages}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>

          {/* Admin Replies */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Admin Replies
            </label>

            <input
              value={adminReplies}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>

          {/* First Message */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              First Message
            </label>

            <input
              value={firstMessage}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>

          {/* Last Reply */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Last Reply
            </label>

            <input
              value={lastReply}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
