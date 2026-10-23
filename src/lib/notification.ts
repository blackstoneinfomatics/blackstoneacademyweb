export const NOTIFICATION_TYPES = {
  BACKUP_REQUEST_SUBMITTED: "BACKUP_REQUEST_SUBMITTED",
  PLAN_CHANGE_REQUEST_SUBMITTED: "PLAN_CHANGE_REQUEST_SUBMITTED",
  PORTAL_REQUEST_SUBMITTED: "PORTAL_REQUEST_SUBMITTED",
  REFUND_REQUEST_SUBMITTED: "REFUND_REQUEST_SUBMITTED",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_TYPE_ROUTES: Record<NotificationType, string> = {
  [NOTIFICATION_TYPES.BACKUP_REQUEST_SUBMITTED]:
    "/super-admin/ui/backuprestore",
  [NOTIFICATION_TYPES.PLAN_CHANGE_REQUEST_SUBMITTED]:
    "/super-admin/ui/subscriptions",
  [NOTIFICATION_TYPES.PORTAL_REQUEST_SUBMITTED]:
    "/super-admin/ui/users&roles",
  [NOTIFICATION_TYPES.REFUND_REQUEST_SUBMITTED]:
    "/super-admin/ui/finance?tab=refunds",
};

export function getNotificationTypeRoute(category: string): string | undefined {
  const normalizedCategory = category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (normalizedCategory.includes("backup request")) {
    return NOTIFICATION_TYPE_ROUTES[
      NOTIFICATION_TYPES.BACKUP_REQUEST_SUBMITTED
    ];
  }

  if (
    normalizedCategory.includes("plan change") &&
    normalizedCategory.includes("request")
  ) {
    return NOTIFICATION_TYPE_ROUTES[
      NOTIFICATION_TYPES.PLAN_CHANGE_REQUEST_SUBMITTED
    ];
  }

  if (normalizedCategory.includes("portal request")) {
    return NOTIFICATION_TYPE_ROUTES[
      NOTIFICATION_TYPES.PORTAL_REQUEST_SUBMITTED
    ];
  }

  if (normalizedCategory.includes("refund request")) {
    return NOTIFICATION_TYPE_ROUTES[
      NOTIFICATION_TYPES.REFUND_REQUEST_SUBMITTED
    ];
  }

  return undefined;
}