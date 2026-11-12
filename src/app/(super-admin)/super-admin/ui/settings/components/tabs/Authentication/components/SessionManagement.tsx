import React from "react";
import AuthSettingsCard from "./AuthSettingsCard";
import AuthToggleRow from "./AuthToggleRow";
import AuthSelectRow from "./AuthSelectRow";

import {
  AuthSettings,
  BooleanSettingKey,
  SelectSettingKey,
} from "./authTypes";

interface Props {
  settings: AuthSettings;
  onToggle: (key: BooleanSettingKey, value: boolean) => void;
  onSelect: (key: SelectSettingKey, value: string) => void;
}

const SessionManagement = ({
  settings,
  onToggle,
  onSelect,
}: Props) => {
  return (
    <AuthSettingsCard title="Session Management (Optional)">
      <AuthSelectRow
        label="Session Timeout"
        description="Allow users to sign in using email address and password."
        value={settings.sessionTimeout}
        options={["5 Minutes", "15 Minutes", "30 Minutes", "1 Hour", "8 Hours"]}
        onChange={(v) => onSelect("sessionTimeout", v)}
      />

      <AuthSelectRow
        label="Idle Warning"
        description="Require users to verify with a second factor during sign in."
        value={settings.idleWarning}
        options={["5 Minutes", "10 Minutes", "15 Minutes", "30 Minutes"]}
        onChange={(v) => onSelect("idleWarning", v)}
      />

      <AuthToggleRow
        label="Remember Device"
        description="Allow users to remember trusted devices for 30 days."
        checked={settings.sessionRememberDevice}
        onChange={(v) => onToggle("sessionRememberDevice", v)}
      />
    </AuthSettingsCard>
  );
};

export default SessionManagement;