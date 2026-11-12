import React from "react";

interface AuthNumberRowProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}

const AuthNumberRow = ({
  label,
  description,
  value,
  onChange,
}: AuthNumberRowProps) => {
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

      <div className="flex shrink-0 items-center gap-1">
        <input
          type="number"
          min={1}
          max={20}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-[27px] w-[63px] rounded border border-[#E0E0E0] bg-white px-2 text-[9px] text-[#263755] outline-none focus:border-[#5B70C8] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
        />

        <span className="text-[9px] text-[#263755] dark:text-gray-300">
          Attempts
        </span>
      </div>
    </div>
  );
};

export default AuthNumberRow;