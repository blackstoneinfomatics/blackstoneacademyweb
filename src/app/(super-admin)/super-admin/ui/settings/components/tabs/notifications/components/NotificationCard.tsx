import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const NotificationCard = ({ title, children, className = "" }: Props) => {
  return (
    <div
      className={`rounded-lg bg-white p-3 shadow-[0_3px_12px_rgba(0,0,0,0.04)] dark:bg-[#343434] ${className}`}
    >
      <h2 className="mb-3 text-[13px] font-semibold text-[#10204A] dark:text-white">
        {title}
      </h2>

      {children}
    </div>
  );
};

export default NotificationCard;