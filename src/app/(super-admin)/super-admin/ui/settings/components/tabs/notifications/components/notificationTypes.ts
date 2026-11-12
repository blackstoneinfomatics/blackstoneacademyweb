export type NotificationCategory = "Institute" | "School" | "College";

export interface NotificationEvent {
  id: string;
  title: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  supportEmail: string;
  country: string;
  emailSignature: string;
  events: Record<NotificationCategory, NotificationEvent[]>;
}