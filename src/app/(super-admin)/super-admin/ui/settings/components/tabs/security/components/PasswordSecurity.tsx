import React from "react";
import { LockKeyhole } from "lucide-react";
import SecurityCard from "./SecurityCard";

interface Props {
  settings: {
    enforceStrongPassword: boolean;
    minimumPasswordLength: string;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialCharacters: boolean;
  };
  onChange: (field: string, value: boolean | string) => void;
}

const PasswordSecurity = ({ settings, onChange }: Props) => {
  const handleCheckbox = (field: string, value: boolean) => (
    <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#10204A] dark:text-gray-200">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(field, e.target.checked)}
        className="h-[14px] w-[14px] cursor-pointer accent-[#5B70C8]"
      />
      {field === "enforceStrongPassword"
        ? "Enforce Strong Password"
        : field === "requireUppercase"
          ? "Require Uppercase (A-Z)"
          : field === "requireNumbers"
            ? "Require Numbers (0-9)"
            : "Require Special Characters (!@#$%^&*)"}
    </label>
  );

  return (
    <SecurityCard
      title="Password Security"
      description="Configure password rules for all users"
      icon={LockKeyhole}
      className="min-h-[250px]"
    >
      <div className="space-y-3">
        {handleCheckbox(
          "enforceStrongPassword",
          settings.enforceStrongPassword
        )}

        <div>
          <label className="mb-1 block text-[10px] text-[#10204A] dark:text-gray-200">
            Minimum Password Length
          </label>

          <select
            value={settings.minimumPasswordLength}
            onChange={(e) =>
              onChange("minimumPasswordLength", e.target.value)
            }
            className="h-[26px] w-full rounded border border-[#DCDCDC] bg-white px-2 text-[10px] text-[#263755] outline-none focus:border-[#5B70C8] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
          >
            {[6, 8, 10, 12, 14, 16].map((length) => (
              <option key={length} value={length}>
                {length}
              </option>
            ))}
          </select>
        </div>

        {handleCheckbox("requireUppercase", settings.requireUppercase)}

        {handleCheckbox("requireNumbers", settings.requireNumbers)}

        {handleCheckbox(
          "requireSpecialCharacters",
          settings.requireSpecialCharacters
        )}
      </div>
    </SecurityCard>
  );
};

export default PasswordSecurity;