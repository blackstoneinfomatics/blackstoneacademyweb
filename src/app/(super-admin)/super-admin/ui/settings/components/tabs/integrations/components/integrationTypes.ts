import type { IconType } from "react-icons";

export type IntegrationStatus =
  | "Published"
  | "Connected"
  | "Active"
  | "Not Connected"
  | "Disabled";

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  icon: string | IconType;
  account?: string;
  bucket?: string;
  path?: string;
  fullWidth?: boolean;
}

export interface IntegrationCategory {
  title: string;
  description: string;
  columns?: 1 | 2 | 3;
  integrations: Integration[];
}