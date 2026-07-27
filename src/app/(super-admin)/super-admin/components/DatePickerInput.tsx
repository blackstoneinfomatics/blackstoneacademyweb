"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css"; // Import custom css

import { CalendarDays } from "lucide-react";

interface Props {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder = "Select Date",
}: Props) {
  return (
    <div className="relative w-full">
      <DatePicker
        selected={value}
        onChange={onChange}
        placeholderText={placeholder}
        dateFormat="MMM dd, yyyy"
        popperPlacement="top-start"
        showPopperArrow={false}
        calendarClassName="alf-calendar"
        popperClassName="alf-datepicker-popper"
        className="
          h-11
          w-full
          rounded-lg
          border
          border-[#D4D4D4]
          bg-white
          px-3
          pr-10
          text-sm
          text-[#010E30CC]
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
          text-[#010E30CC]
        "
      />
    </div>
  );
}