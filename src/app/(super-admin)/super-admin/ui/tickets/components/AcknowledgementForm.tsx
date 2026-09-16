"use client";

import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import type { AcknowledgementPayload, Ticket } from "../types";

interface AcknowledgementFormProps {
  ticket: Ticket;
  onCancel?: () => void;
  onSubmit?: (payload: AcknowledgementPayload) => void;
}

const priorityBadgeClass = (priority: Ticket["priority"]) => {
  switch (priority) {
    case "High":
      return "bg-[#F8DADA] text-[#E55353]";
    case "Medium":
      return "bg-[#FCEED9] text-[#E5A32A]";
    default:
      return "bg-[#DFF3E3] text-[#3AAE5B]";
  }
};

export default function AcknowledgementForm({
  ticket,
  onCancel,
  onSubmit,
}: AcknowledgementFormProps) {
  const [subject, setSubject] = useState(
    `We have received your complaint - ${ticket.ticketId.toLowerCase()}`,
  );
  const [message, setMessage] = useState("");
  const [timeline, setTimeline] = useState(ticket.createdOn);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(false);

  const handleSubmit = () => {
    onSubmit?.({
      ticketId: ticket.ticketId,
      subject,
      message,
      timeline,
      notifyEmail,
      notifyInApp,
    });
  };

  return (
    <div className="w-full max-w-[640px] rounded-lg bg-white p-5 shadow-sm">
      {/* Title */}
      <h2 className="mb-4 text-[20px] font-semibold text-[#172554]">
        Acknowledgement
      </h2>

      {/* Ticket Information */}
      <div className="mb-4 rounded-lg bg-[#F5F5F5] p-4">
        <h3 className="mb-4 text-[14px] font-semibold text-[#172554]">
          Ticket Information
        </h3>

        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
          <div>
            <p className="text-[13px] font-medium text-[#172554]">
              Ticket ID
            </p>
            <p className="mt-1 text-[12px] text-[#596579]">
              {ticket.ticketId}
            </p>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#172554]">Tenant</p>
            <p className="mt-1 text-[12px] text-[#596579]">
              {ticket.tenantName}
            </p>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#172554]">Subject</p>
            <p className="mt-1 text-[12px] text-[#596579]">
              {ticket.subject}
            </p>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#172554]">
              Priority
            </p>

            <span
              className={`mt-1 inline-block rounded px-4 py-1 text-[11px] ${priorityBadgeClass(ticket.priority)}`}
            >
              {ticket.priority}
            </span>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#172554]">
              Created On
            </p>
            <p className="mt-1 text-[12px] text-[#596579]">
              {ticket.createdOn}
            </p>
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="mb-3">
        <label className="mb-1 block text-[13px] font-medium text-[#172554]">
          Subject
        </label>

        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-[34px] w-full rounded border border-[#D5D5D5] px-2 text-[12px] outline-none focus:border-[#576CBC]"
        />
      </div>

      {/* Message */}
      <div className="mb-3">
        <label className="mb-1 block text-[13px] font-medium text-[#172554]">
          Message
        </label>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add an update for the tenant..."
          className="h-[120px] w-full resize-none rounded border border-[#D5D5D5] p-2 text-[12px] outline-none focus:border-[#576CBC]"
        />
      </div>

      {/* Timeline + Notification */}
      <div className="mb-3 grid grid-cols-2 gap-5">
        <div>
          <label className="mb-1 block text-[13px] font-medium text-[#172554]">
            Ticket Timeline
          </label>

          <div className="relative">
            <input
              type="text"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="h-[34px] w-full rounded border border-[#D5D5D5] px-2 text-[12px]"
            />

            <IoCalendarOutline
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#697386]"
              size={16}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#172554]">
            Sent Notification
          </label>

          <div className="flex items-center gap-5 pt-1">
            <label className="flex items-center gap-1.5 text-[12px] text-[#596579]">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
              />
              Email
            </label>

            <label className="flex items-center gap-1.5 text-[12px] text-[#596579]">
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
      <div className="mb-4 flex items-center gap-2 rounded-md bg-[#E5ECFF] px-3 py-3 text-[12px] text-[#263B65]">
        <FaInfoCircle className="shrink-0 text-[#576CBC]" />

        <span>
          This message will be sent to the tenant and recorded in the ticket
          timeline.
        </span>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 border-t border-[#E5E5E5] pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[#8EA3E8] px-5 py-2 text-[13px] font-medium text-[#576CBC] hover:bg-[#F1F4FF]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-md bg-[#576CBC] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#4D61AD]"
        >
          Send Acknowledgement
        </button>
      </div>
    </div>
  );
}
