export type UpdatePriority = "High" | "Medium" | "Low";
export type UpdateStatus = "Draft" | "Scheduled" | "Published" | "Archived";

export type ProductUpdate = {
  updateId: string;
  title: string;
  description: string;
  category: string;
  priority: UpdatePriority;
  audience: string;
  releaseDate: string;
  status: UpdateStatus;
  // Extended field shown on the details view - optional until the API
  // provides it, so dummy data doesn't need to fill every field.
  affectedTenants?: number;
};

export type Plan = {
  planId: string;
  planName: string;
};

export type Tenant = {
  tenantId: string;
  tenantName: string;
};

export type UpdateFeaturePayload = {
  updateId: string;
  title: string;
  category: string;
  description: string;
  publishDate: string;
  priority: UpdatePriority;
  audience: string;
  sendEmail: boolean;
  sendInApp: boolean;
};
