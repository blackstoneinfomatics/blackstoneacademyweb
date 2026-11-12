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

const EmailVerification = ({
  settings,
  onToggle,
  onSelect,
}: Props) => {
  return (
    <AuthSettingsCard title="Email Verification">
      <AuthToggleRow
        label="Require Email Verification"
        description="New users must verify their email address."
        checked={settings.requireEmailVerification}
        onChange={(v) => onToggle("requireEmailVerification", v)}
      />

      <AuthToggleRow
        label="Verify Email on Signup"
        description="Send verification email immediately after signup."
        checked={settings.verifyOnSignup}
        onChange={(v) => onToggle("verifyOnSignup", v)}
      />

      <AuthSelectRow
        label="Verification Link Expiry"
        description="Require users to verify with a second factor during sign in."
        value={settings.verificationLinkExpiry}
        options={["1 Hour", "6 Hours", "12 Hours", "24 Hours", "48 Hours"]}
        onChange={(v) => onSelect("verificationLinkExpiry", v)}
      />
    </AuthSettingsCard>
  );
};

export default EmailVerification;