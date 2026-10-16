// utils/chat-events.ts

export const CHAT_EVENTS = {
  JOIN: "chat:join",
  LEAVE: "chat:leave",
  JOINED: "chat:joined",
  LEFT: "chat:left",
  ERROR: "socket:error",

  ROOM_CREATED: "chat:roomCreated",
  NEW_MESSAGE: "chat:newMessage",
  UNREAD_COUNT_UPDATED: "chat:unreadCountUpdated",
  MESSAGE_SEEN: "chat:messageSeen",
  MESSAGE_DELETED: "chat:messageDeleted",
  ROOM_UPDATED: "chat:roomUpdated",
  MEMBER_ADDED: "chat:memberAdded",
  MEMBER_REMOVED: "chat:memberRemoved",
  CLEARED: "chat:cleared",
} as const;

export type ChatSource = "TENANT" | "SUPER_ADMIN";

export interface ChatRoomPayload {
  source: ChatSource;
  roomId: string;
}

export interface ChatSocketEvent<T = unknown> {
  source: ChatSource;
  roomId: string;
  [key: string]: unknown;
}