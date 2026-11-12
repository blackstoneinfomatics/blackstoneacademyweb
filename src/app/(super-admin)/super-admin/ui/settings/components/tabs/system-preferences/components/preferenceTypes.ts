export interface SystemPreferenceSettings {
  allowNewTenantRegistration: boolean;
  allowTrialSignups: boolean;
  enableMaintenanceMode: boolean;

  defaultTrialPeriod: string;
  defaultSubscriptionPlan: string;
  defaultUserLimit: string;

  dateFormat: string;
  timeFormat: string;
  defaultLanguage: string;

  activityLogsRetention: string;
  inactiveTenantArchive: string;
  deletedDataRetention: string;
}