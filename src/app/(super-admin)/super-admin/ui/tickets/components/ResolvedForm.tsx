"use client";

import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import type { ResolvedPayload, Ticket } from "../types";

interface ResolvedFormProps {
  ticket: Ticket;
  onCancel?: () => void;
  onSubmit?: (payload: ResolvedPayload) => void;
}

const priorityBadgeClass = (priority: Ticket["priority"]) => {
  switch (priority) {
    case "High":
      return "bg-[#F8DADA] text-[#E55353] dark:bg-[#D3464533]";
    case "Medium":
      return "bg-[#FCEED9] text-[#E5A32A] dark:bg-[#F0AD4E33]";
    default:
      return "bg-[#DFF3E3] text-[#3AAE5B] dark:bg-[#36477e33]";
  }
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ResolvedForm({
  ticket,
  onCancel,
  onSubmit,
}: ResolvedFormProps) {
  const [subject, setSubject] = useState(
    `We have received your complaint - ${ticket.ticketId.toLowerCase()}`,
  );
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"Resolved" | "Closed">("Closed");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(false);

  const resolvedOn =
    ticket.resolvedOn && ticket.resolvedOn !== "-"
      ? ticket.resolvedOn
      : todayISO();

  const handleSubmit = () => {
    onSubmit?.({
      ticketId: ticket.ticketId,
      subject,
      message,
      status,
      notifyEmail,
      notifyInApp,
    });
  };

  return (
    <div className="w-full max-w-[640px] rounded-lg bg-white dark:bg-[#343434] p-5 shadow-sm">
      {/* Title */}
      <h2 className="mb-4 text-[20px] font-semibold text-[#172554] dark:text-white">
        Resolved Form
      </h2>

      {/* Ticket Information */}
      <div className="mb-4 rounded-lg bg-[#F5F5F5] dark:bg-[#2c2c2c] p-4">
        <h3 className="mb-4 text-[14px] font-semibold text-[#172554] dark:text-white">
          Ticket Information
        </h3>

        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
          <div>
            <p className="text-[13px] font-medium text-[#172554] dark:text-white">
              Ticket ID
            </p>
            <p className="mt-1 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
              {ticket.ticketId}
            </p>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#172554] dark:text-white">Tenant</p>
            <p className="mt-1 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
              {ticket.tenantName}
            </p>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#172554] dark:text-white">Subject</p>
            <p className="mt-1 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
              {ticket.subject}
            </p>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#172554] dark:text-white">
              Priority
            </p>

            <span
              className={`mt-1 inline-block rounded px-4 py-1 text-[11px] ${priorityBadgeClass(ticket.priority)}`}
            >
              {ticket.priority}
            </span>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#172554] dark:text-white">
              Created On
            </p>
            <p className="mt-1 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
              {ticket.createdOn}
            </p>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#172554] dark:text-white">
              Resolved On
            </p>
            <p className="mt-1 text-[12px] text-[#596579] dark:text-[#B5B5B5]">{resolvedOn}</p>
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="mb-3">
        <label className="mb-1 block text-[13px] font-medium text-[#172554] dark:text-white">
          Subject
        </label>

        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-[34px] w-full rounded border border-[#D5D5D5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#172554] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
        />
      </div>

      {/* Message */}
      <div className="mb-3">
        <label className="mb-1 block text-[13px] font-medium text-[#172554] dark:text-white">
          Message
        </label>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a closing note for the tenant..."
          className="h-[120px] w-full resize-none rounded border border-[#D5D5D5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] p-2 text-[12px] text-[#172554] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC] placeholder:text-[#A5AAB4] dark:placeholder:text-[#7A7A7A]"
        />
      </div>

      {/* Status + Notification */}
      <div className="mb-3 grid grid-cols-2 gap-5">
        <div>
          <label className="mb-1 block text-[13px] font-medium text-[#172554] dark:text-white">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "Resolved" | "Closed")}
            className="h-[34px] w-full rounded border border-[#D5D5D5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#172554] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
          >
            <option value="Closed">Closed</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#172554] dark:text-white">
            Sent Notification
          </label>

          <div className="flex items-center gap-5 pt-1">
            <label className="flex items-center gap-1.5 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
              />
              Email
            </label>

            <label className="flex items-center gap-1.5 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
              <input
                type="checkbox"
                checked={notifyInApp}
                onChange={(e) => setNotifyInApp(e.target.checked)}
              />
              In-App Notification
            </label>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="mb-4 flex items-center gap-2 rounded-md bg-[#E5ECFF] dark:bg-[#36477e33] px-3 py-3 text-[12px] text-[#263B65] dark:text-[#C7D2FE]">
        <FaInfoCircle className="shrink-0 text-[#576CBC]" />

        <span>
          This message will be sent to the tenant and The ticket will be
          marked as resolved.
        </span>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 border-t border-[#E5E5E5] dark:border-[#4A4A4A] pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[#8EA3E8] dark:border-[#576CBC] px-5 py-2 text-[13px] font-medium text-[#576CBC] dark:text-[#8EA3E8] hover:bg-[#F1F4FF] dark:hover:bg-[#2F2F2F]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-md bg-[#576CBC] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#4D61AD]"
        >
          Resolved Update
        </button>
      </div>
    </div>
  );
}
