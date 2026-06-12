export const NOTIFICATION_EVENT = {
  COMMENT: "notification:comment",
  LIKE: "notification:like",
  FOLLOW: "notification:follow",
  MENTION: "notification:mention",
} as const;

export const NOTIFICATION_TYPE = {
  COMMENT: "comment",
  LIKE: "like",
  FOLLOW: "follow",
  MENTION: "mention",
} as const;