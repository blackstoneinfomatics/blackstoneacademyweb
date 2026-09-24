"use client";

import React from "react";
import { BsX } from "react-icons/bs";

export interface PortalFormData {
  portalName: string;
  portalType: "CUSTOM" | "DEFAULT";
  userLimit: string;
  status: "Active" | "Inactive";
}

interface AddPortalFormProps {
  formData: PortalFormData;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

const inputClassName =
  "w-full rounded-md border border-[#D6D8DE] bg-white px-3 py-2 text-[11px] text-[#17244A] focus:border-[#5872C5] focus:outline-none dark:border-gray-600 dark:bg-[#1F1F1F] dark:text-gray-200";
const labelClassName =
  "mb-1.5 block text-[12px] font-medium text-[#17244A] dark:text-gray-200";

const AddPortalForm = ({
  formData,
  isSaving,
  onClose,
  onSubmit,
  onChange,
}: AddPortalFormProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 dark:bg-black/50">
    <div className="h-[460px] w-full max-w-[500px] rounded-lg bg-white shadow-2xl dark:bg-[#2C2C2C]">
      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-[16px] font-semibold text-[#101B3D] dark:text-white">
          Add Portal
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label="Close add portal form"
        >
          <BsX className="text-[21px]" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 px-4 pb-4 pt-2">
        <label className="block">
          <span className={labelClassName}>Portal Name</span>
          <input
            required
            name="portalName"
            value={formData.portalName}
            onChange={onChange}
            placeholder="Enter module name"
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className={labelClassName}>Portal Type</span>
          <select
            name="portalType"
            value={formData.portalType}
            onChange={onChange}
            className={inputClassName}
          >
            <option value="CUSTOM">Custom</option>
            <option value="DEFAULT">Default</option>
          </select>
        </label>

        <label className="block">
          <span className={labelClassName}>User Limit</span>
          <input
            required
            min="0"
            type="number"
            name="userLimit"
            value={formData.userLimit}
            onChange={onChange}
            placeholder="1"
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className={labelClassName}>Status</span>
          <select
            name="status"
            value={formData.status}
            onChange={onChange}
            className={inputClassName}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        <div className="flex justify-end gap-3 border-t border-[#E1E3E8] pt-3 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#5872C5] px-5 py-2 text-[11px] font-semibold text-[#5872C5] hover:bg-[#F2F4FF] dark:hover:bg-[#3A3A3A]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-[#5872C5] px-6 py-2 text-[11px] font-semibold text-white hover:bg-[#4D66B3] disabled:opacity-50"
          >
            {isSaving ? "Adding..." : "Next"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default AddPortalForm;
