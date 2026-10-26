export type TicketPriority = "Critical" | "High" | "Medium" | "Low";
export type TicketStatus =
  | "Open"
  | "Acknowledged"
  | "In Progress"
  | "Resolved"
  | "Closed";

export type Ticket = {
  ticketId: string;
  tenantName: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  currentAssignedRole?: string;
  currentAssignedTo: string;
  createdOn: string;
  resolvedOn: string;
  description?: string;
  plan?: string;
  tenantMessages?: number;
  adminReplies?: number;
  firstMessage?: string;
  lastReply?: string;
};

export type AcknowledgementPayload = {
  ticketId: string;
  subject: string;
  message: string;
  timeline: string;
  notifyEmail: boolean;
  notifyInApp: boolean;
};

export type ResolvedPayload = {
  ticketId: string;
  subject: string;
  message: string;
  status: "Resolved" | "Closed";
  notifyEmail: boolean;
  notifyInApp: boolean;
};
