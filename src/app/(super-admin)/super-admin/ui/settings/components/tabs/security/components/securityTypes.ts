export interface SecuritySettings {
  enforceStrongPassword: boolean;
  minimumPasswordLength: string;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialCharacters: boolean;

  maximumFailedAttempts: string;
  accountLockoutDuration: string;
  notifySuspiciousLogin: boolean;

  sessionTimeout: string;
  forceLogoutOnPasswordChange: boolean;
  allowMultipleActiveSessions: boolean;
}