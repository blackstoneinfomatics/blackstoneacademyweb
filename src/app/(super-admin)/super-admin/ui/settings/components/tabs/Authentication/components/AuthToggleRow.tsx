import React from "react";

interface AuthToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const AuthToggleRow = ({
  label,
  description,
  checked,
  onChange,
}: AuthToggleRowProps) => {
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

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-[13px] w-[22px] shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#5B70C8]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-[2px] h-[9px] w-[9px] rounded-full bg-white transition-all ${
            checked ? "left-[11px]" : "left-[2px]"
          }`}
        />
      </button>
    </div>
  );
};

export default AuthToggleRow;