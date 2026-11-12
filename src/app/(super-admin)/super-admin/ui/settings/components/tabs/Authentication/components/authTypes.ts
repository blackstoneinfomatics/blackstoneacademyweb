export interface AuthSettings {
  enableEmailPassword: boolean;
  enableTwoFactor: boolean;
  enforceAdmin2FA: boolean;
  rememberDevice: boolean;
  maxLoginAttempts: number;
  lockoutDuration: string;

  requireEmailVerification: boolean;
  verifyOnSignup: boolean;
  verificationLinkExpiry: string;

  sessionTimeout: string;
  idleWarning: string;
  sessionRememberDevice: boolean;
}

export type BooleanSettingKey = {
  [K in keyof AuthSettings]: AuthSettings[K] extends boolean ? K : never;
}[keyof AuthSettings];

export type SelectSettingKey =
  | "lockoutDuration"
  | "verificationLinkExpiry"
  | "sessionTimeout"
  | "idleWarning";