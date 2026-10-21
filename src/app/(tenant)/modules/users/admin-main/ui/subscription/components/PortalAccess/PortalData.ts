export type PortalRole =
  | "Student"
  | "Teacher"
  | "Academic Coach"
  | "Supervisor"
  | "Admin";

export type Feature = {
  id: number;
  name: string;
  parentModule: string;
  childModule: string;
  description: string;
  addedOn: string;
  enabled: boolean;
};

export const portalRoles: PortalRole[] = [
  "Student",
  "Teacher",
  "Academic Coach",
  "Supervisor",
  "Admin",
];

export const initialFeatures: Feature[] = [
  ["Billing", "Finance", "-", true],
  ["group chat", "Chat & Support", "-", true],
  ["class", "Subscriptions", "-", true],
  ["Finance", "Finance", "-", true],
  ["Users & Roles", "Users & Roles", "-", true],
  ["Feature Control", "Feature Control", "-", true],
  ["Analytics", "Analytics", "-", true],
  ["Chat & Support", "Chat & Support", "-", true],
  ["Chat & Support", "Chat & Support", "Tickets", true],
  ["Settings", "Settings", "-", true],
  ["Backup & Restore", "Backup & Restore", "-", true],
  ["Attendance", "Academics", "Attendance", true],
  ["Timetable", "Academics", "Timetable", true],
  ["Assignments", "Academics", "Assignments", true],
  ["Notifications", "Communication", "Alerts", true],
].map(([name, parentModule, childModule, enabled], index) => ({
  id: index + 1,
  name: name as string,
  parentModule: parentModule as string,
  childModule: childModule as string,
  description: "Access designed for students.",
  addedOn: "Sep 12, 2023",
  enabled: enabled as boolean,
}));