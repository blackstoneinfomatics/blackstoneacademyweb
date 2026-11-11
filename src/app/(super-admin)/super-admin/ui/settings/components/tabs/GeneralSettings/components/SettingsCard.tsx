import React from "react";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsCard = ({
  title,
  description,
  children,
}: SettingsCardProps) => {
  return (
    <div className="rounded-lg p-3 bg-white shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:bg-[#343434]">
      <h2 className="text-[14px] font-semibold text-[#10204A] dark:text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-[11px] text-gray-500">
          {description}
        </p>
      )}

      <div className="mt-3">{children}</div>
    </div>
  );
};

export default SettingsCard;