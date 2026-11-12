"use client";

import React, { useState } from "react";

import PlatformNotifications from "./components/PlatformNotifications";
import BasicInformation from "./components/BasicInformation";
import RegionalNotificationSettings from "./components/RegionalNotificationSettings";

import {
  NotificationSettings,
  NotificationCategory,
} from "./components/notificationTypes";

const defaultEvents = [
  {
    id: "email-login",
    title: "Enable Email/Password Login",
    description: "Allow users to sign in using email address and password.",
    email: true,
    inApp: false,
  },
  {
    id: "ticket-acknowledgement",
    title: "Ticket Acknowledgement",
    description: "Allow users to sign in using email address and password.",
    email: true,
    inApp: false,
  },
  {
    id: "ticket-resolved",
    title: "Ticket Resolved",
    description: "Allow users to sign in using email address and password.",
    email: true,
    inApp: false,
  },
  {
    id: "update-feature",
    title: "Update Feature",
    description: "Allow users to sign in using email address and password.",
    email: true,
    inApp: false,
  },
  {
    id: "add-tenant",
    title: "Add Tenant",
    description: "Allow users to sign in using email address and password.",
    email: true,
    inApp: false,
  },
];

const initialSettings: NotificationSettings = {
  enabled: true,
  supportEmail: "noreply@blackstone.com",
  country: "India",
  emailSignature:
    "--\n\nBlackstone Nexus\nEmpowering Education, Everywhere",

  events: {
    Institute: defaultEvents.map((event) => ({ ...event })),
    School: defaultEvents.map((event) => ({ ...event })),
    College: defaultEvents.map((event) => ({ ...event })),
  },
};

interface NotificationsProps {
  onSave?: (settings: NotificationSettings) => void;
}

const Notifications = ({ onSave }: NotificationsProps) => {
  const [settings, setSettings] =
    useState<NotificationSettings>(initialSettings);

  const [category, setCategory] =
    useState<NotificationCategory>("College");

  // Update notification toggle
  const handleNotificationToggle = (value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      enabled: value,
    }));
  };

  // Update individual event checkbox
  const handleEventChange = (
    id: string,
    field: "email" | "inApp",
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      events: {
        ...prev.events,
        [category]: prev.events[category].map((event) =>
          event.id === id
            ? { ...event, [field]: value }
            : event
        ),
      },
    }));
  };

  // Update Regional Settings
  const handleRegionalChange = (
    field: "supportEmail" | "country" | "emailSignature",
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Cancel Changes
  const handleCancel = () => {
    setSettings({
      ...initialSettings,
      events: {
        Institute: initialSettings.events.Institute.map((e) => ({ ...e })),
        School: initialSettings.events.School.map((e) => ({ ...e })),
        College: initialSettings.events.College.map((e) => ({ ...e })),
      },
    });

    setCategory("College");
  };

  // Save Changes
  const handleSave = () => {
    onSave?.(settings);
  };

  return (
    <div className="w-full space-y-1.5">

      {/* Page Heading */}
      <div className="mb-5 space-y-[2px]">
        <h2 className="text-sm font-semibold text-[#10204A] dark:text-white">
          Notifications
        </h2>

        <p className="mt-0.5 text-[11px] text-gray-500">
          Configure how and when the system sends notifications
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[1.75fr_1fr]">

        {/* Left Column */}
        <div className="space-y-3">
          <PlatformNotifications
            enabled={settings.enabled}
            onToggle={handleNotificationToggle}
          />

          <BasicInformation
            category={category}
            events={settings.events[category]}
            onCategoryChange={setCategory}
            onEventChange={handleEventChange}
          />
        </div>

        {/* Right Column */}
        <div>
          <RegionalNotificationSettings
            supportEmail={settings.supportEmail}
            country={settings.country}
            emailSignature={settings.emailSignature}
            onEmailChange={(value) =>
              handleRegionalChange("supportEmail", value)
            }
            onCountryChange={(value) =>
              handleRegionalChange("country", value)
            }
            onSignatureChange={(value) =>
              handleRegionalChange("emailSignature", value)
            }
          />
        </div>

      </div>

      {/* Footer Buttons */}
      <div className="mt-3 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-md border border-[#6379D3] px-4 py-1.5 text-[11px] font-medium text-[#536AC4] transition hover:bg-[#E9ECFA] dark:hover:bg-[#414B70]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-md bg-[#5B70C8] px-4 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#485DB5]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Notifications;