"use client";

import React, { useState } from "react";
import { BsX } from "react-icons/bs";

export interface PortalFilterValues {
  portalType: string;
  roleType: string;
  status: string;
  isEnabled: string;
}

interface PortalFilterFormProps {
  values: PortalFilterValues;
  onClose: () => void;
  onApply: (values: PortalFilterValues) => void;
}

const selectClassName =
  "w-full rounded-md border border-[#D6D8DE] bg-white px-3 py-2 text-[11px] text-[#17244A] focus:border-[#5872C5] focus:outline-none";

const PortalFilterForm = ({
  values,
  onClose,
  onApply,
}: PortalFilterFormProps) => {
  const [draftValues, setDraftValues] = useState(values);

  const updateValue = (field: keyof PortalFilterValues, value: string) => {
    setDraftValues((previous) => ({ ...previous, [field]: value }));
  };

  const clearFilters = () => {
    const clearedValues = {
      portalType: "",
      roleType: "",
      status: "",
      isEnabled: "",
    };
    setDraftValues(clearedValues);
    onApply(clearedValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[382px] rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-[16px] font-semibold text-[#101B3D]">
            Filter Portals
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close portal filters"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
          >
            <BsX className="text-[21px]" />
          </button>
        </div>

        <div className="space-y-3 px-4 pb-4 pt-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#17244A]">
              Portal Type
            </span>
            <select
              value={draftValues.portalType}
              onChange={(event) =>
                updateValue("portalType", event.target.value)
              }
              className={selectClassName}
            >
              <option value="">All Portal Types</option>
              <option value="DEFAULT">Default</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#17244A]">
              Role Type
            </span>
            <select
              value={draftValues.roleType}
              onChange={(event) => updateValue("roleType", event.target.value)}
              className={selectClassName}
            >
              <option value="">All Role Types</option>
              <option value="ACADEMIC">Academic</option>
              <option value="ADMINISTRATION">Administration</option>
              <option value="FINANCE">Finance</option>
              <option value="TRANSPORT">Transport</option>
              <option value="HOSTEL">Hostel</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#17244A]">
              Portal Status
            </span>
            <select
              value={draftValues.status}
              onChange={(event) => updateValue("status", event.target.value)}
              className={selectClassName}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#17244A]">
              Access
            </span>
            <select
              value={draftValues.isEnabled}
              onChange={(event) => updateValue("isEnabled", event.target.value)}
              className={selectClassName}
            >
              <option value="">All Access</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>

          <div className="flex justify-end gap-3 border-t border-[#E1E3E8] pt-3">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-[#5872C5] px-5 py-2 text-[11px] font-semibold text-[#5872C5] hover:bg-[#F2F4FF]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => onApply(draftValues)}
              className="rounded-md bg-[#5872C5] px-6 py-2 text-[11px] font-semibold text-white hover:bg-[#4D66B3]"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalFilterForm;
