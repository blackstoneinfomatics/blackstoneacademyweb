import React from "react";

interface AuthSelectRowProps {
  label: string;
  description: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const AuthSelectRow = ({
  label,
  description,
  value,
  options,
  onChange,
}: AuthSelectRowProps) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#10204A] dark:text-gray-200">
          {label}
        </p>

        <p className="mt-0.5 text-[10px] text-[#777777] dark:text-gray-400">
          {description}
        </p>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[27px] w-[112px] shrink-0 rounded border border-[#E0E0E0] bg-white px-2 text-[9px] text-[#263755] outline-none focus:border-[#5B70C8] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AuthSelectRow;7