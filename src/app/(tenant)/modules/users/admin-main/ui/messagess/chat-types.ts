export type CategoryKey = string;

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  short: string;
  rawRole: string;
}

export interface DirectoryMember {
  userId: string;
  name: string;
  role: string;
  planName: string;
  planId: string;
  avatarLetter: string;
}

export type RoomType = "TENANT" | "SEGMENT" | "GLOBAL";

export interface IMessage {
  _id: string;
  messages: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  createdDate: string;
  dateLabel?: string;
  time: string;
  notificationStatus: "Unseen" | "Seen";
  isRead: boolean;
  status: "Active" | "Inactive";
  deliveredAt?: string;
  isDeleted: boolean;
  seenAt?: string;
  replyTo?: { messageId: string; messages: string; senderName: string; senderId: string };
  attachment?: { name: string; size: number; type: string; url?: string };
  side?: "left" | "right";
  canReply?: boolean;
}

export interface IUser {
  profileImage: string | null;
  _id: string;
  userName: any;
  email: string;
  role: string[];
  roleKey: string;
  status: string;
  lastSeen: string;
  isGroup: boolean;
  roomType: RoomType;
  plan: any;
  members: { name: string; plan: any; tenantId?: string; isSelected?: boolean }[];
  groupSettings: "everyone" | "admins";
  lastMessage?: { text: string; time: string; senderName?: string };
  unreadCount: number;
  isUnread: boolean;
  roomId?: string;
  roomCode?: string;
  description?: string;
  planName?: string;
  planId?: string;
  sendAccess?: "EVERYONE" | "ADMIN_ONLY";
}
