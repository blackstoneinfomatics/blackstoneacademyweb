"use client";

import { CalendarDays } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import { CSSProperties } from "react";
import React, { forwardRef } from "react";


interface DatePickerInputProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  dateFormat?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;

  className?: string;
  inputClassName?: string;
  style?: React.CSSProperties;
}
interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      value,
      onClick,
      placeholder,
      disabled,
      className,
      style,
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          value={value || ""}
          onClick={onClick}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          className={className}
          style={style}
        />

        <CalendarDays
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
        />
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default function DatePickerInput({
  value,
  onChange,
  placeholder = "Select Date",
  dateFormat = "MMM dd, yyyy",
  disabled = false,
  minDate,
  maxDate,
  className = "",
  inputClassName = "",
  style,
}: DatePickerInputProps) {
  return (
    <div className={`relative w-full ${className}`}>
     <DatePicker
  selected={value}
  onChange={onChange}
  placeholderText={placeholder}
  dateFormat={dateFormat}
  disabled={disabled}
  minDate={minDate}
  maxDate={maxDate}
  popperPlacement="top-start"
  showPopperArrow={false}
  calendarClassName="alf-calendar"
  popperClassName="alf-datepicker-popper"
  customInput={
    <CustomInput
      className={`
        ${inputClassName}
      `}
      style={style}
    />
  }
/>

      {/* <CalendarDays
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
      /> */}
    </div>
  );
}