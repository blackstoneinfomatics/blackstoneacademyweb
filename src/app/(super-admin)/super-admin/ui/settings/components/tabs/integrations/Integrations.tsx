"use client";

import React, { useState } from "react";
import IntegrationSection from "./components/IntegrationSection";
import { integrationData } from "./components/IntegrationData";
import {
  Integration,
  IntegrationCategory,
} from "./components/integrationTypes";

interface IntegrationsProps {
  onConfigure?: (integration: Integration) => void;
  onConnect?: (integration: Integration) => void;
  onAddIntegration?: () => void;
}

const Integrations = ({
  onConfigure,
  onConnect,
  onAddIntegration,
}: IntegrationsProps) => {
  const [sections, setSections] =
    useState<IntegrationCategory[]>(() =>
      integrationData.map((section) => ({
        ...section,
        integrations: section.integrations.map((item) => ({ ...item })),
      }))
    );

  // Configure Integration
  const handleConfigure = (integration: Integration) => {
    onConfigure?.(integration);
  };

  // Connect Integration
  const handleConnect = (integration: Integration) => {
    onConnect?.(integration);

    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        integrations: section.integrations.map((item) =>
          item.id === integration.id
            ? { ...item, status: "Connected" }
            : item
        ),
      }))
    );
  };

  return (
    <div className="w-full space-y-1.5 rounded-lg bg-white p-3 dark:bg-[#292929]">

      {/* Header */}
      <div className="mb-5 space-y-[2px] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#10204A] dark:text-white">
            Integrations
          </h2>

          <p className="mt-0.5 text-[11px] text-[#888888] dark:text-gray-400">
            Connect and manage third-party services used across the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddIntegration}
          className="shrink-0 rounded-md bg-[#5B70C8] px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-[#485DB5]"
        >
          Add Integrations
        </button>
      </div>

      {/* Integration Sections */}
      <div className="space-y-4 p-2.5 dark:bg-[#303030]">
        {sections.map((section) => (
          <IntegrationSection
            key={section.title}
            section={section}
            onConfigure={handleConfigure}
            onConnect={handleConnect}
          />
        ))}
      </div>
    </div>
  );
};

export default Integrations;