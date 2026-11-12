import React from "react";

interface AuthSettingsCardProps {
  title: string;
  children: React.ReactNode;
}

const AuthSettingsCard = ({
  title,
  children,
}: AuthSettingsCardProps) => {
  return (
    <div className="rounded-lg bg-white p-3 shadow-[0_3px_12px_rgba(0,0,0,0.05)] dark:bg-[#343434]">
      <h2 className="mb-3 text-[13px] font-semibold text-[#10204A] dark:text-white">
        {title}
      </h2>

      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export default AuthSettingsCard;