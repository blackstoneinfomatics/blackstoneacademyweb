"use client";

import { X, CalendarDays, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DatePickerInput from "./DatePickerInput";

export interface SelectOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "dateRange";
  placeholder?: string;
  options?: SelectOption[];
}

interface FilterDrawerProps {
  open: boolean;
  title?: string;

  fields: FilterField[];

  values: Record<string, any>;

  onClose: () => void;

  onApply: (values: Record<string, any>) => void;

  onReset?: () => void;

  resultCount?: number;
}

export default function FilterDrawer({
  open,
  title = "Filter by",
  fields,
  values,
  onClose,
  onApply,
  onReset,
  resultCount = 0,
}: FilterDrawerProps) {
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    setFilters(values);
  }, [values]);

  const updateField = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}

      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
        onClick={onClose}
      >
        {/* Popup */}
        <div
          className="
w-full
max-w-[380px]
rounded-xl
border
border-[#E8E8E8]
bg-white
shadow-2xl
animate-in
zoom-in-95
duration-200
"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EAECF0] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#101828]">{title}</h2>

            <button onClick={onClose}>
              <X size={20} className="text-[#CCCFD6] hover:text-gray-700" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-5 p-5">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="mb-2 block text-sm font-normal text-[#101828]">
                  {field.label}
                </label>

                {renderField(field, filters, updateField)}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex gap-4 border-t border-[#EAECF0] p-5">
            <button
              onClick={() => {
                setFilters({});
                onReset?.();
              }}
              className="flex-1 rounded-lg border border-[#576CBC] py-3 text-sm font-semibold text-[#576CBC] hover:bg-[#F5F7FF]"
            >
              Reset
            </button>

            <button
              onClick={() => onApply(filters)}
              className="flex-[1.5] rounded-lg bg-[#576CBC] py-3 text-sm font-semibold text-white hover:bg-[#475DB8]"
            >
              Show {resultCount} Results
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* --------------------------
      Field Renderer
--------------------------- */

function renderField(
  field: FilterField,
  filters: Record<string, any>,
  updateField: (key: string, value: any) => void,
) {
  switch (field.type) {
    /* ------------------------
          TEXT INPUT
    ------------------------- */

    case "text":
      return (
        <input
          type="text"
          value={filters[field.key] ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => updateField(field.key, e.target.value)}
          className="
            h-11
            w-full
            rounded-lg
            border
            border-[#D4D4D4]
            px-4
            text-sm
            text-[#010E30CC]/80
            outline-none
            transition
            focus:border-[#576CBC]
          "
        />
      );

    /* ------------------------
            SELECT
    ------------------------- */

    case "select":
      return (
        <div className="relative">
          <select
            value={filters[field.key] ?? ""}
            onChange={(e) => updateField(field.key, e.target.value)}
            className="
              h-11
              w-full
              appearance-none
              rounded-lg
              border
              border-[#D4D4D4]
              bg-white
              px-4
              pr-10
             text-[#010E30CC]/80
              text-sm
              outline-none
              transition
              focus:border-[#576CBC]
            "
          >
            <option value="">{field.placeholder}</option>

            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            className="
              pointer-events-none
              absolute
              right-3
              top-1/2
              -translate-y-1/2
            text-[#010E30CC]/80
            "
          />
        </div>
      );

    /* ------------------------
            DATE
    ------------------------- */

    case "date":
      return (
        <div className="relative">
          <input
            type="date"
            value={filters[field.key] ?? ""}
            onChange={(e) => updateField(field.key, e.target.value)}
            className="
              h-11
              w-full
              rounded-lg
              border
              border-[#D4D4D4]
              px-4
              pr-10
              text-sm
             text-[#010E30CC]/80
              outline-none
              focus:border-[#576CBC]
            "
          />

          <CalendarDays
            size={18}
            className="
              pointer-events-none
              absolute
              right-3
              top-1/2
              -translate-y-1/2
                          text-[#010E30CC]/80

            "
          />
        </div>
      );

    /* ------------------------
        DATE RANGE
    ------------------------- */

   case "dateRange":
  return (
    <div className="grid grid-cols-2 gap-3">
      <DatePickerInput
        value={filters[`${field.key}From`] || null}
        onChange={(date) =>
          updateField(`${field.key}From`, date)
        }
        placeholder="Jan 20, 2020"
       inputClassName=" h-11 w-full rounded-lg border border-[#D4D4D4] bg-white px-3 pr-10 text-sm text-[#010E30CC] outline-none focus:border-[#576CBC] "
      />

      <DatePickerInput
        value={filters[`${field.key}To`] || null}
        onChange={(date) =>
          updateField(`${field.key}To`, date)
        }
        placeholder="Jan 24, 2020"
               inputClassName=" h-11 w-full rounded-lg border border-[#D4D4D4] bg-white px-3 pr-10 text-sm text-[#010E30CC] outline-none focus:border-[#576CBC] "

      />
    </div>
  );
  default:
      return null;
  }
}
