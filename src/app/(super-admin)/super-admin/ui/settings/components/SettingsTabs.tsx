"use client";

import { useState } from "react";
import GeneralSettings from "./tabs/GeneralSettings/GeneralSettings";

const settingsTabs = [
  { id: "general", label: "General" },
  { id: "authentication", label: "Authentication" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "Integrations" },
  { id: "security", label: "Security" },
  { id: "system", label: "System Preferences" },
] as const;

export default function SettingsTabs() {
  const [activeTab, setActiveTab] =
    useState<(typeof settingsTabs)[number]["id"]>("general");
  const activeLabel = settingsTabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <div>
      <div
        aria-label="Settings categories"
        className="flex gap-2 overflow-x-auto"
        role="tablist"
      >
        {settingsTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              aria-controls="settings-tab-panel"
              aria-selected={isActive}
              className={`relative shrink-0 px-1 py-1 text-sm font-medium transition
  after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-full after:content-['']
  ${
    isActive
      ? "text-[#576CBC] after:bg-[#576CBC]"
      : "text-[#010e30] after:bg-transparent hover:text-[#576CBC] dark:text-gray-400"
  }`}
              id={`settings-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        aria-labelledby={`settings-tab-${activeTab}`}
        className="mt-5 min-h-40"
        id="settings-tab-panel"
        role="tabpanel"
      >
        {activeTab === "general" ? (
          <GeneralSettings />
        ) : (
          <h2 className="text-base font-semibold text-[#24324B] dark:text-white">
            {activeLabel}
          </h2>
        )}
      </div>
    </div>
  );
}
