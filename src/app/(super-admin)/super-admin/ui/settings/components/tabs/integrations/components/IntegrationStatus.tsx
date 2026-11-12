import React from "react";
import { IntegrationStatus as StatusType } from "./integrationTypes";

interface Props {
  status: StatusType;
}

const IntegrationStatus = ({ status }: Props) => {
  const styles: Record<StatusType, string> = {
    Published: "bg-[#E9F9EF] text-[#278C45]",
    Connected: "bg-[#E9F9EF] text-[#278C45]",
    Active: "bg-[#E9F9EF] text-[#278C45]",
    "Not Connected": "bg-[#E0E0E0] text-[#555555]",
    Disabled: "bg-[#E0E0E0] text-[#555555]",
  };

  return (
    <span
      className={`shrink-0 rounded-sm px-2 py-1 text-[9px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default IntegrationStatus;