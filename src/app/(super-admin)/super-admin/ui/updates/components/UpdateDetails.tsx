"use client";

import { IoClose } from "react-icons/io5";
import type { ProductUpdate } from "../types";

interface UpdateDetailsProps {
  update: ProductUpdate;
  onClose?: () => void;
}

const priorityTextClass = (priority: ProductUpdate["priority"]) => {
  switch (priority) {
    case "High":
      return "text-[#EF4444]";
    case "Medium":
      return "text-[#F59E0B]";
    default:
      return "text-[#4CAF50]";
  }
};

const statusTextClass = (status: ProductUpdate["status"]) => {
  switch (status) {
    case "Published":
      return "text-[#4CAF50]";
    case "Scheduled":
      return "text-[#F59E0B]";
    case "Archived":
      return "text-[#EF4444]";
    default:
      return "text-[#576CBC]";
  }
};

export default function UpdateDetails({ update, onClose }: UpdateDetailsProps) {
  return (
    <div className="w-full max-w-[440px] rounded-md bg-white dark:bg-[#343434] p-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D9DDE5] dark:border-[#4A4A4A] pb-2">
        <h2 className="text-[14px] font-semibold text-[#172554] dark:text-white">Details</h2>

        <button
          type="button"
          onClick={onClose}
          className="text-[#9CA3AF] hover:text-[#172554] dark:hover:text-white"
        >
          <IoClose size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="px-1 py-3">
        {/* Row 1 - Update Title + Category */}
        <div className="grid grid-cols-2 gap-3">
          {/* Update Title */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Update Title
            </label>

            <input
              type="text"
              value={update.title}
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
              type="text"
              value={update.category}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-3">
          <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
            Description
          </label>

          <textarea
            value={update.description}
            readOnly
            className="h-[65px] w-full resize-none rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] p-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
          />
        </div>

        {/* Audience + Release Date */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {/* Audience */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Audience
            </label>

            <input
              type="text"
              value={update.audience}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>

          {/* Release Date */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Release Date
            </label>

            <input
              type="text"
              value={update.releaseDate}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>
        </div>

        {/* Purchase Tenant + Priority + Status */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          {/* Purchase Tenant */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Purchase Tenant
            </label>

            <input
              type="text"
              value={update.affectedTenants ?? "-"}
              readOnly
              className="h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#B5B5B5] outline-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Priority
            </label>

            <input
              type="text"
              value={update.priority}
              readOnly
              className={`h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] font-medium outline-none ${priorityTextClass(update.priority)}`}
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
              Status
            </label>

            <input
              type="text"
              value={update.status}
              readOnly
              className={`h-[32px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] font-medium outline-none ${statusTextClass(update.status)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
