"use client";

import React from "react";
import { BsX } from "react-icons/bs";

export interface PortalStatusFormData {
  isEnabled: "true" | "false";
}

interface UpdatePortalStatusFormProps {
  portalName: string;
  formData: PortalStatusFormData;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const selectClassName =
  "w-full rounded-md border border-[#D6D8DE] bg-white px-3 py-2 text-[11px] text-[#17244A] focus:border-[#5872C5] focus:outline-none";

const UpdatePortalStatusForm = ({
  portalName,
  formData,
  isSaving,
  onClose,
  onSubmit,
  onChange,
}: UpdatePortalStatusFormProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
    <div className="w-full max-w-[382px] rounded-lg bg-white shadow-2xl">
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#101B3D]">
            Update Portal
          </h2>
          <p className="mt-1 text-[11px] text-gray-500">{portalName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close update portal form"
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
        >
          <BsX className="text-[21px]" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 px-4 pb-4 pt-4">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-[#17244A]">
            Access
          </span>
          <select
            name="isEnabled"
            value={formData.isEnabled}
            onChange={onChange}
            className={selectClassName}
          >
            <option value="true">Enable</option>
            <option value="false">Disable</option>
          </select>
        </label>

        <div className="flex justify-end gap-3 border-t border-[#E1E3E8] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#5872C5] px-5 py-2 text-[11px] font-semibold text-[#5872C5] hover:bg-[#F2F4FF]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-[#5872C5] px-6 py-2 text-[11px] font-semibold text-white hover:bg-[#4D66B3] disabled:opacity-50"
          >
            {isSaving ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default UpdatePortalStatusForm;
