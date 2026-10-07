export type UpdatePriority = "Low" | "Medium" | "High";
export type UpdateStatus = "Draft" | "Scheduled" | "Published" | "Archived";

export interface ProductUpdate {
  updateId: string;
  title: string;
  description: string;
  category: string;
  priority: UpdatePriority;
  audience: string;
  releaseDate: string;
  status: UpdateStatus;
  affectedTenants?: number;
  rawAudience?: string[];
  rawSelectedTenants?: string[];
  attachments?: string[];
  sendNotification?: { email: boolean; inApp: boolean };
  publishDate?: string;
}

export interface Plan {
  planId: string;
  planName: string;
}

export interface Tenant {
  tenantId: string;
  tenantName: string;
}

export interface UpdateFeaturePayload {
  updateId: string;
  title: string;
  category: string;
  description: string;
  publishDate: string;
  priority: UpdatePriority;
  audience: string;
  sendEmail: boolean;
  sendInApp: boolean;
}