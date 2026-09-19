// Frontend API client for the "api-portal-module" plugin (src/api/portalModule).
// Two independent hierarchies, both Portal -> Parent Module -> (Features | Children -> Features):
//   - Global (Default): portalmodules collection - full CRUD, type is Default|Custom.
//   - Tenant (Custom): tenantPortalConfig collection - the document is seeded with a
//     Default snapshot of Global when a tenant subscribes; these calls only add/update
//     a Custom entry inside that SAME document, or enable/disable any existing entry
//     (Default or Custom). They never create a second tenantPortalConfig document, and
//     PUT/update calls reject Default entries (edit those via the Global endpoints instead).

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

let baseUrl = "http://localhost:5001";

export const setPortalModuleApiBaseUrl = (url: string): void => {
  baseUrl = url;
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: number;
}

class PortalModuleApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "PortalModuleApiError";
  }
}

const request = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new PortalModuleApiError(json.message, json.errorCode ?? res.status);
  }

  return json.data as T;
};

const query = (params: Record<string, string>): string =>
  "?" + new URLSearchParams(params).toString();

// ---------------------------------------------------------------------------
// Shared enums (mirror src/shared/enum.ts)
// ---------------------------------------------------------------------------

export type Status =
  | "Active"
  | "Inactive"
  | "Deleted"
  | "Archived"
  | "New"
  | "Trial"
  | "Completed";

export type PortalType = "DEFAULT" | "CUSTOM";

export type PortalStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

// ---------------------------------------------------------------------------
// Global (Default) - models
// ---------------------------------------------------------------------------

export interface Feature {
  featureId: string;
  featureName: string;
  type?: PortalType;
  description?: string | null;
  status: Status;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChildModule {
  childModuleId: string;
  childModuleName: string;
  type: PortalType;
  description?: string | null;
  status: Status;
  isEnabled: boolean;
  features: Feature[];
}

export interface ParentModule {
  _id: string;
  portal: string;
  parentModuleId: string;
  parentModuleName: string;
  order: number;
  type: PortalType;
  description?: string | null;
  status: Status;
  isEnabled: boolean;
  children: ChildModule[];
  features: Feature[];
  createdBy: string;
  updatedBy?: string | null;
}

// ---------------------------------------------------------------------------
// Global (Default) - request payloads
// ---------------------------------------------------------------------------

export interface CreateParentModulePayload {
  portal: string;
  parentModuleName: string;
  order?: number;
  type?: PortalType; // defaults to DEFAULT
  description?: string;
  status: Status;
  isEnabled: boolean;
  // Optional: create features directly under this parent module in the same call.
  features?: {
    featureId: string;
    featureName: string;
    description?: string;
    status: Status;
    isEnabled: boolean;
  }[];
  createdBy: string;
}

export interface UpdateParentModulePayload {
  parentModuleName?: string;
  order?: number;
  type?: PortalType;
  description?: string;
  status: Status; // required even on update
  isEnabled?: boolean;
  updatedBy: string;
}

export interface CreateChildModulePayload {
  childModuleName: string;
  type?: PortalType; // defaults to DEFAULT
  description?: string;
  status: Status;
  isEnabled: boolean;
  createdBy: string;
}

export interface UpdateChildModulePayload {
  childModuleName?: string;
  type?: PortalType;
  description?: string;
  status: Status; // required even on update
  isEnabled?: boolean;
  updatedBy: string;
}

export interface CreateFeaturePayload {
  featureName: string;
  type?: PortalType; // defaults to DEFAULT
  description?: string;
  status: Status;
  isEnabled: boolean;
  createdBy: string;
}

export interface UpdateFeaturePayload {
  featureName?: string;
  type?: PortalType;
  description?: string;
  status: Status; // required even on update
  isEnabled?: boolean;
  updatedBy: string;
}

export interface UpdateAccessPayload {
  isEnabled: boolean;
  updatedBy: string;
}

export interface FeatureCard {
  totalFeatures: { count: number; previousMonthCount: number; percentageChange: number; trend: string };
  addedFeatures: { count: number; previousMonthCount: number; percentageChange: number; trend: string };
  activeFeatures: { count: number; previousMonthCount: number; percentageChange: number; trend: string };
  inactiveFeatures: { count: number; previousMonthCount: number; percentageChange: number; trend: string };
}

// ---------------------------------------------------------------------------
// Global (Default) - endpoints
// ---------------------------------------------------------------------------

// POST /modules
export const createParentModule = (payload: CreateParentModulePayload) =>
  request<ParentModule>("POST", "/modules", payload);

// GET /modules
export const getParentModules = () => request<ParentModule[]>("GET", "/modules");

// PUT /modules/{parentModuleId}
export const updateParentModule = (parentModuleId: string, payload: UpdateParentModulePayload) =>
  request<ParentModule>("PUT", `/modules/${parentModuleId}`, payload);

// PATCH /modules/{parentModuleId}/enable
export const updateParentModuleAccess = (parentModuleId: string, payload: UpdateAccessPayload) =>
  request<ParentModule>("PATCH", `/modules/${parentModuleId}/enable`, payload);

// POST /modules/{parentModuleId}/children
export const createChildModule = (parentModuleId: string, payload: CreateChildModulePayload) =>
  request<ParentModule>("POST", `/modules/${parentModuleId}/children`, payload);

// GET /modules/{parentModuleId}/children
export const getChildModules = (parentModuleId: string) =>
  request<ChildModule[]>("GET", `/modules/${parentModuleId}/children`);

// PUT /modules/{parentModuleId}/children/{childModuleId}
export const updateChildModule = (
  parentModuleId: string,
  childModuleId: string,
  payload: UpdateChildModulePayload
) => request<ParentModule>("PUT", `/modules/${parentModuleId}/children/${childModuleId}`, payload);

// PATCH /modules/{parentModuleId}/children/{childModuleId}/enable
export const updateChildModuleAccess = (
  parentModuleId: string,
  childModuleId: string,
  payload: UpdateAccessPayload
) =>
  request<ParentModule>(
    "PATCH",
    `/modules/${parentModuleId}/children/${childModuleId}/enable`,
    payload
  );

// POST /modules/{parentModuleId}/children/{childModuleId}/features
export const createFeature = (
  parentModuleId: string,
  childModuleId: string,
  payload: CreateFeaturePayload
) =>
  request<ParentModule>(
    "POST",
    `/modules/${parentModuleId}/children/${childModuleId}/features`,
    payload
  );

// GET /modules/{parentModuleId}/children/{childModuleId}/features
export const getFeatures = (parentModuleId: string, childModuleId: string) =>
  request<Feature[]>("GET", `/modules/${parentModuleId}/children/${childModuleId}/features`);

// PUT /modules/{parentModuleId}/children/{childModuleId}/features/{featureId}
export const updateFeature = (
  parentModuleId: string,
  childModuleId: string,
  featureId: string,
  payload: UpdateFeaturePayload
) =>
  request<ParentModule>(
    "PUT",
    `/modules/${parentModuleId}/children/${childModuleId}/features/${featureId}`,
    payload
  );

// PATCH /modules/{parentModuleId}/children/{childModuleId}/features/{featureId}/enable
export const updateFeatureAccess = (
  parentModuleId: string,
  childModuleId: string,
  featureId: string,
  payload: UpdateAccessPayload
) =>
  request<ParentModule>(
    "PATCH",
    `/modules/${parentModuleId}/children/${childModuleId}/features/${featureId}/enable`,
    payload
  );

// POST /modules/{parentModuleId}/features (feature directly under the parent, no child module)
export const createParentFeature = (parentModuleId: string, payload: CreateFeaturePayload) =>
  request<ParentModule>("POST", `/modules/${parentModuleId}/features`, payload);

// GET /modules/{parentModuleId}/features
export const getParentFeatures = (parentModuleId: string) =>
  request<Feature[]>("GET", `/modules/${parentModuleId}/features`);

// PUT /modules/{parentModuleId}/features/{featureId}
export const updateParentFeature = (
  parentModuleId: string,
  featureId: string,
  payload: UpdateFeaturePayload
) => request<ParentModule>("PUT", `/modules/${parentModuleId}/features/${featureId}`, payload);

// PATCH /modules/{parentModuleId}/features/{featureId}/enable
export const updateParentFeatureAccess = (
  parentModuleId: string,
  featureId: string,
  payload: UpdateAccessPayload
) =>
  request<ParentModule>(
    "PATCH",
    `/modules/${parentModuleId}/features/${featureId}/enable`,
    payload
  );

// GET /features/card
export const getFeatureCard = () => request<FeatureCard>("GET", "/features/card");

// ---------------------------------------------------------------------------
// Tenant (Custom) - models
// ---------------------------------------------------------------------------

export interface TenantFeature {
  featureId: string;
  featureName: string;
  description?: string | null;
  featureStatus: PortalStatus;
  featuretype: PortalType; // note: lowercase "t" - matches the backend field name as-is
  isEnabled: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantChildModule {
  childModuleId: string;
  childModuleName: string;
  description?: string | null;
  childModuleStatus: PortalStatus;
  childModuleType: PortalType;
  isEnabled: boolean;
  features: TenantFeature[];
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantModule {
  moduleId: string;
  moduleName: string;
  description?: string | null;
  orderNo: number;
  moduleStatus: PortalStatus;
  moduleType: PortalType;
  isEnabled: boolean;
  features: TenantFeature[];
  children: TenantChildModule[];
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantPortalConfig {
  _id: string;
  tenantId: string;
  portalId: string;
  tenantPortalId: string;
  modules: TenantModule[];
  createdBy: string;
  updatedBy?: string | null;
}

// ---------------------------------------------------------------------------
// Tenant (Custom) - request payloads
// ---------------------------------------------------------------------------

export interface AddTenantModulePayload {
  tenantId: string;
  portalId: string;
  moduleName: string;
  description?: string;
  orderNo?: number;
  moduleStatus: PortalStatus;
  createdBy: string;
}

export interface UpdateTenantModulePayload {
  tenantId: string;
  portalId: string;
  moduleName?: string;
  orderNo?: number;
  moduleStatus?: PortalStatus;
  updatedBy: string;
}

export interface AddTenantChildModulePayload {
  tenantId: string;
  portalId: string;
  childModuleName: string;
  description?: string;
  childModuleStatus: PortalStatus;
  createdBy: string;
}

export interface UpdateTenantChildModulePayload {
  tenantId: string;
  portalId: string;
  childModuleName?: string;
  childModuleStatus?: PortalStatus;
  updatedBy: string;
}

export interface AddTenantFeaturePayload {
  tenantId: string;
  portalId: string;
  featureName: string;
  description?: string;
  featureStatus: PortalStatus;
  createdBy: string;
}

export interface UpdateTenantFeaturePayload {
  tenantId: string;
  portalId: string;
  featureName?: string;
  featureStatus?: PortalStatus;
  updatedBy: string;
}

export interface TenantAccessPayload {
  tenantId: string;
  portalId: string;
  isEnabled: boolean;
  updatedBy: string;
}

// ---------------------------------------------------------------------------
// Tenant (Custom) - endpoints
// ---------------------------------------------------------------------------

// GET /modules/tenant/config?tenantId=&portalId=
export const getTenantConfig = (tenantId: string, portalId: string) =>
  request<TenantPortalConfig>("GET", `/modules/tenant/config${query({ tenantId, portalId })}`);

// POST /modules/tenant
export const addTenantModule = (payload: AddTenantModulePayload) =>
  request<TenantPortalConfig>("POST", "/modules/tenant", payload);

// GET /modules/tenant?tenantId=&portalId=
export const getTenantModules = (tenantId: string, portalId: string) =>
  request<TenantModule[]>("GET", `/modules/tenant${query({ tenantId, portalId })}`);

// PUT /modules/tenant/{moduleId} - CUSTOM modules only (Default -> MODULE_NOT_CUSTOM error)
export const updateTenantModule = (moduleId: string, payload: UpdateTenantModulePayload) =>
  request<TenantPortalConfig>("PUT", `/modules/tenant/${moduleId}`, payload);

// PATCH /modules/tenant/{moduleId}/enable - works on Default or Custom
export const updateTenantModuleAccess = (moduleId: string, payload: TenantAccessPayload) =>
  request<TenantPortalConfig>("PATCH", `/modules/tenant/${moduleId}/enable`, payload);

// POST /modules/tenant/{moduleId}/children
export const addTenantChildModule = (moduleId: string, payload: AddTenantChildModulePayload) =>
  request<TenantPortalConfig>("POST", `/modules/tenant/${moduleId}/children`, payload);

// GET /modules/tenant/{moduleId}/children?tenantId=&portalId=
export const getTenantChildModules = (moduleId: string, tenantId: string, portalId: string) =>
  request<TenantChildModule[]>(
    "GET",
    `/modules/tenant/${moduleId}/children${query({ tenantId, portalId })}`
  );

// PUT /modules/tenant/{moduleId}/children/{childModuleId} - CUSTOM child modules only
export const updateTenantChildModule = (
  moduleId: string,
  childModuleId: string,
  payload: UpdateTenantChildModulePayload
) =>
  request<TenantPortalConfig>(
    "PUT",
    `/modules/tenant/${moduleId}/children/${childModuleId}`,
    payload
  );

// PATCH /modules/tenant/{moduleId}/children/{childModuleId}/enable
export const updateTenantChildModuleAccess = (
  moduleId: string,
  childModuleId: string,
  payload: TenantAccessPayload
) =>
  request<TenantPortalConfig>(
    "PATCH",
    `/modules/tenant/${moduleId}/children/${childModuleId}/enable`,
    payload
  );

// POST /modules/tenant/{moduleId}/features (feature directly under a tenant module)
export const addTenantModuleFeature = (moduleId: string, payload: AddTenantFeaturePayload) =>
  request<TenantPortalConfig>("POST", `/modules/tenant/${moduleId}/features`, payload);

// GET /modules/tenant/{moduleId}/features?tenantId=&portalId=
export const getTenantModuleFeatures = (moduleId: string, tenantId: string, portalId: string) =>
  request<TenantFeature[]>(
    "GET",
    `/modules/tenant/${moduleId}/features${query({ tenantId, portalId })}`
  );

// PUT /modules/tenant/{moduleId}/features/{featureId} - CUSTOM features only
export const updateTenantModuleFeature = (
  moduleId: string,
  featureId: string,
  payload: UpdateTenantFeaturePayload
) =>
  request<TenantPortalConfig>(
    "PUT",
    `/modules/tenant/${moduleId}/features/${featureId}`,
    payload
  );

// PATCH /modules/tenant/{moduleId}/features/{featureId}/enable
export const updateTenantModuleFeatureAccess = (
  moduleId: string,
  featureId: string,
  payload: TenantAccessPayload
) =>
  request<TenantPortalConfig>(
    "PATCH",
    `/modules/tenant/${moduleId}/features/${featureId}/enable`,
    payload
  );

// POST /modules/tenant/{moduleId}/children/{childModuleId}/features
export const addTenantChildFeature = (
  moduleId: string,
  childModuleId: string,
  payload: AddTenantFeaturePayload
) =>
  request<TenantPortalConfig>(
    "POST",
    `/modules/tenant/${moduleId}/children/${childModuleId}/features`,
    payload
  );

// GET /modules/tenant/{moduleId}/children/{childModuleId}/features?tenantId=&portalId=
export const getTenantChildFeatures = (
  moduleId: string,
  childModuleId: string,
  tenantId: string,
  portalId: string
) =>
  request<TenantFeature[]>(
    "GET",
    `/modules/tenant/${moduleId}/children/${childModuleId}/features${query({ tenantId, portalId })}`
  );

// PUT /modules/tenant/{moduleId}/children/{childModuleId}/features/{featureId} - CUSTOM only
export const updateTenantChildFeature = (
  moduleId: string,
  childModuleId: string,
  featureId: string,
  payload: UpdateTenantFeaturePayload
) =>
  request<TenantPortalConfig>(
    "PUT",
    `/modules/tenant/${moduleId}/children/${childModuleId}/features/${featureId}`,
    payload
  );

// PATCH /modules/tenant/{moduleId}/children/{childModuleId}/features/{featureId}/enable
export const updateTenantChildFeatureAccess = (
  moduleId: string,
  childModuleId: string,
  featureId: string,
  payload: TenantAccessPayload
) =>
  request<TenantPortalConfig>(
    "PATCH",
    `/modules/tenant/${moduleId}/children/${childModuleId}/features/${featureId}/enable`,
    payload
  );
