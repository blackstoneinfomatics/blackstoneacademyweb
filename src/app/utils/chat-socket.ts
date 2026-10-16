
import type { Socket } from "socket.io-client";
import { getSocket } from "./socket";
import { CHAT_EVENTS } from "./chat-events";
import type {
  ChatRoomPayload,
  ChatSource,
} from "./chat-events";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ChatEventPayload = {
  source: ChatSource;
  roomId: string;
  [key: string]: unknown;
};

type ChatSocketError = {
  message: string;
  details?: unknown;
};

type ChatEventHandlers = {
  [CHAT_EVENTS.ROOM_CREATED]: ChatEventPayload;
  [CHAT_EVENTS.NEW_MESSAGE]: ChatEventPayload;
  [CHAT_EVENTS.UNREAD_COUNT_UPDATED]: ChatEventPayload;
  [CHAT_EVENTS.MESSAGE_SEEN]: ChatEventPayload;
  [CHAT_EVENTS.MESSAGE_DELETED]: ChatEventPayload;
  [CHAT_EVENTS.ROOM_UPDATED]: ChatEventPayload;
  [CHAT_EVENTS.MEMBER_ADDED]: ChatEventPayload;
  [CHAT_EVENTS.MEMBER_REMOVED]: ChatEventPayload;
  [CHAT_EVENTS.CLEARED]: ChatEventPayload;
  [CHAT_EVENTS.JOINED]: ChatEventPayload;
  [CHAT_EVENTS.LEFT]: ChatEventPayload;
  [CHAT_EVENTS.ERROR]: ChatSocketError;
};

export type ChatEventName = keyof ChatEventHandlers;

type ChatEventHandler<E extends ChatEventName> = (
  payload: ChatEventHandlers[E],
) => void;

type ChatSocket = Socket;

const isValidRoomPayload = (
  payload: ChatRoomPayload,
): boolean =>
  Boolean(
    payload &&
      (payload.source === "TENANT" ||
        payload.source === "SUPER_ADMIN") &&
      typeof payload.roomId === "string" &&
      payload.roomId.trim(),
  );

/* -------------------------------------------------------------------------- */
/* Connection                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Returns the existing application socket.
 * Does not create a separate connection for chat.
 */
export const getChatSocket = (userId: string): ChatSocket => {
  if (!userId?.trim()) {
    throw new Error("A valid userId is required for chat");
  }

  return getSocket(userId);
};

/* -------------------------------------------------------------------------- */
/* Event Subscription                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Registers a chat event listener.
 * Returns an unsubscribe function for React cleanup.
 */

export const onChatEvent = <E extends ChatEventName>(
  userId: string,
  event: E,
  handler: ChatEventHandler<E>,
): (() => void) => {
  const socket = getChatSocket(userId);

  // Keep the listener signature compatible with Socket.IO.
  const listener = (payload: ChatEventHandlers[E]) => {
    handler(payload);
  };

  socket.on(
    event as never,
    listener as never,
  );

  return () => {
    socket.off(
      event as never,
      listener as never,
    );
  };
};


/* -------------------------------------------------------------------------- */
/* Room Lifecycle                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Requests to join a chat room.
 *
 * The backend must authorize membership and emit chat:joined.
 * The returned promise resolves when the server confirms the join.
 */
export const joinChatRoom = (
  userId: string,
  payload: ChatRoomPayload,
  timeoutMs = 10000,
): Promise<void> => {
  if (!isValidRoomPayload(payload)) {
    return Promise.reject(
      new Error("Invalid chat source or roomId"),
    );
  }

  const socket = getChatSocket(userId);

  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      socket.off(CHAT_EVENTS.JOINED, onJoined);
      socket.off(CHAT_EVENTS.ERROR, onError);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };

    const finish = (error?: Error) => {
      if (settled) return;

      settled = true;
      cleanup();

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };

    const matchesRoom = (data: {
      source?: string;
      roomId?: string;
    }) =>
      data?.source === payload.source &&
      data?.roomId === payload.roomId;

    const onJoined = (data: ChatEventPayload) => {
      if (matchesRoom(data)) {
        finish();
      }
    };

    const onError = (data: ChatSocketError) => {
      finish(
        new Error(data?.message ?? "Unable to join chat room"),
      );
    };

    const onDisconnect = () => {
      finish(new Error("Socket disconnected while joining chat"));
    };

    const emitJoin = () => {
      socket.emit(CHAT_EVENTS.JOIN, payload);
    };

    const onConnect = () => {
      emitJoin();
    };

    const timer = setTimeout(() => {
      finish(new Error("Timed out waiting for chat:joined"));
    }, timeoutMs);

    socket.on(CHAT_EVENTS.JOINED, onJoined);
    socket.on(CHAT_EVENTS.ERROR, onError);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      emitJoin();
    } else {
      socket.once("connect", onConnect);
    }
  });
};

/**
 * Leaves a chat room.
 * The server removes only this socket from the room.
 */
export const leaveChatRoom = (
  userId: string,
  payload: ChatRoomPayload,
): void => {
  if (!isValidRoomPayload(payload)) {
    throw new Error("Invalid chat source or roomId");
  }

  const socket = getChatSocket(userId);

  if (!socket.connected) {
    return;
  }

  socket.emit(CHAT_EVENTS.LEAVE, payload);
};

/* -------------------------------------------------------------------------- */
/* Convenience Listeners                                                      */
/* -------------------------------------------------------------------------- */

export const onNewMessage = (
  userId: string,
  handler: ChatEventHandler<typeof CHAT_EVENTS.NEW_MESSAGE>,
) => onChatEvent(userId, CHAT_EVENTS.NEW_MESSAGE, handler);

export const onChatRoomCreated = (
  userId: string,
  handler: ChatEventHandler<typeof CHAT_EVENTS.ROOM_CREATED>,
) => onChatEvent(userId, CHAT_EVENTS.ROOM_CREATED, handler);

export const onUnreadCountUpdated = (
  userId: string,
  handler: ChatEventHandler<
    typeof CHAT_EVENTS.UNREAD_COUNT_UPDATED
  >,
) =>
  onChatEvent(
    userId,
    CHAT_EVENTS.UNREAD_COUNT_UPDATED,
    handler,
  );

export const onMessageSeen = (
  userId: string,
  handler: ChatEventHandler<typeof CHAT_EVENTS.MESSAGE_SEEN>,
) => onChatEvent(userId, CHAT_EVENTS.MESSAGE_SEEN, handler);

export const onMessageDeleted = (
  userId: string,
  handler: ChatEventHandler<
    typeof CHAT_EVENTS.MESSAGE_DELETED
  >,
) =>
  onChatEvent(
    userId,
    CHAT_EVENTS.MESSAGE_DELETED,
    handler,
  );

export const onChatSocketError = (
  userId: string,
  handler: ChatEventHandler<typeof CHAT_EVENTS.ERROR>,
) => onChatEvent(userId, CHAT_EVENTS.ERROR, handler);
