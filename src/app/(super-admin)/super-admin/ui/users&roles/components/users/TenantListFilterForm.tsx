"use client";

import React, { useState } from "react";
import { BsX } from "react-icons/bs";

export interface TenantFilterValues {
  tenantName: string;
  startDate: string;
  plan: string;
  renewalDate: string;
  status: string;
}

interface TenantListFilterFormProps {
  values: TenantFilterValues;
  onClose: () => void;
  onApply: (values: TenantFilterValues) => void;
}

const fieldClassName =
  "w-full rounded-md border border-[#D6D8DE] bg-white px-3 py-2 text-[11px] text-[#17244A] focus:border-[#5872C5] focus:outline-none dark:border-gray-600 dark:bg-[#1F1F1F] dark:text-gray-200";
const labelClassName =
  "mb-1.5 block text-[12px] font-medium text-[#17244A] dark:text-gray-200";

const TenantListFilterForm = ({
  values,
  onClose,
  onApply,
}: TenantListFilterFormProps) => {
  const [draftValues, setDraftValues] = useState(values);

  const updateValue = (field: keyof TenantFilterValues, value: string) => {
    setDraftValues((previous) => ({ ...previous, [field]: value }));
  };

  const clearFilters = () => {
    const clearedValues = {
      tenantName: "",
      startDate: "",
      plan: "",
      renewalDate: "",
      status: "",
    };
    setDraftValues(clearedValues);
    onApply(clearedValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 dark:bg-black/50">
      <div className="w-full max-w-[382px] rounded-lg bg-white shadow-2xl dark:bg-[#2C2C2C]">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-[16px] font-semibold text-[#101B3D] dark:text-white">
            Filter Tenants
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tenant filters"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <BsX className="text-[21px]" />
          </button>
        </div>

        <div className="space-y-3 px-4 pb-4 pt-4">
          <label className="block">
            <span className={labelClassName}>Tenant Name</span>
            <input
              value={draftValues.tenantName}
              onChange={(event) =>
                updateValue("tenantName", event.target.value)
              }
              placeholder="Search tenant name"
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className={labelClassName}>Start Date</span>
            <input
              type="date"
              value={draftValues.startDate}
              onChange={(event) => updateValue("startDate", event.target.value)}
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className={labelClassName}>Plan</span>
            <select
              value={draftValues.plan}
              onChange={(event) => updateValue("plan", event.target.value)}
              className={fieldClassName}
            >
              <option value="">All Plans</option>
              <option value="BASIC">Basic</option>
              <option value="STANDARD">Standard</option>
              <option value="PREMIUM">Premium</option>
              <option value="MAX-PRO 2">Max-Pro 2</option>
            </select>
          </label>

          <label className="block">
            <span className={labelClassName}>Renewal Date</span>
            <input
              type="date"
              value={draftValues.renewalDate}
              onChange={(event) =>
                updateValue("renewalDate", event.target.value)
              }
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className={labelClassName}>Tenant Status</span>
            <select
              value={draftValues.status}
              onChange={(event) => updateValue("status", event.target.value)}
              className={fieldClassName}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>

          <div className="flex justify-end gap-3 border-t border-[#E1E3E8] pt-3 dark:border-gray-700">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-[#5872C5] px-5 py-2 text-[11px] font-semibold text-[#5872C5] hover:bg-[#F2F4FF] dark:hover:bg-[#3A3A3A]"
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

export default TenantListFilterForm;
