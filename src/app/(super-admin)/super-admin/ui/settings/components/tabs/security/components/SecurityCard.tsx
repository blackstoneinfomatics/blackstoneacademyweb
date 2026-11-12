import React from "react";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const SecurityCard = ({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}: Props) => {
  return (
    <div
      className={`rounded-lg bg-white p-3 shadow-[0_3px_12px_rgba(0,0,0,0.04)] dark:bg-[#343434] ${className}`}
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#EAEFFF] text-[#5B70C8] dark:bg-[#414B70]">
          <Icon size={16} />
        </div>

        <div>
          <h3 className="text-[11px] font-semibold text-[#10204A] dark:text-white">
            {title}
          </h3>

          <p className="mt-0.5 text-[9px] text-gray-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
};

export default SecurityCard;