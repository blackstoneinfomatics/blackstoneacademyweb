import React from "react";
import IntegrationStatus from "./IntegrationStatus";
import { Integration } from "./integrationTypes";

interface Props {
  integration: Integration;
  onConfigure: (integration: Integration) => void;
  onConnect: (integration: Integration) => void;
}

const IntegrationCard = ({
  integration,
  onConfigure,
  onConnect,
}: Props) => {
  const Icon = integration.icon;

  return (
    <div className="rounded-md border border-[#E5E9F1] bg-white p-2.5 dark:border-[#484848] dark:bg-[#343434]">
      <div className="flex items-start gap-3">
        {/* Integration Icon */}
        <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {typeof Icon === "string" ? (
            <span className="text-[23px] font-bold text-[#263755] dark:text-white">
              {Icon}
            </span>
          ) : (
            <Icon
              className="h-[50px] w-[50px] text-[#263755] dark:text-white"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Integration Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="pt-0.5 text-[11px] font-semibold text-[#10204A] dark:text-white">
              {integration.name}
            </h3>

            <IntegrationStatus status={integration.status} />
          </div>

          <p className="mt-1 text-[9px] text-[#777777] dark:text-gray-400">
            {integration.description}
          </p>

          {integration.account && (
            <p className="mt-1 text-[9px] text-[#555555] dark:text-gray-300">
              **Account:** {integration.account}
            </p>
          )}

          {integration.bucket && (
            <p className="mt-1 text-[9px] text-[#555555] dark:text-gray-300">
              **Bucket:** {integration.bucket}
            </p>
          )}

          {integration.path && (
            <p className="mt-1 break-all text-[9px] text-[#555555] dark:text-gray-300">
              **Path:** {integration.path}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onConfigure(integration)}
              className="rounded border border-[#7040FF] px-3 py-1 text-[9px] font-medium text-[#7040FF] transition hover:bg-[#7040FF] hover:text-white"
            >
              Configure
            </button>

            <button
              type="button"
              onClick={() => onConnect(integration)}
              className="rounded border border-[#7040FF] px-3 py-1 text-[9px] font-medium text-[#7040FF] transition hover:bg-[#7040FF] hover:text-white"
            >
              connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationCard;