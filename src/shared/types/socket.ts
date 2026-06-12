export type SendCommentNotiPayload = {
  user: {
    id: number | string;
    username: string;
    avatar_url: string | null;
  };
  entityId: number;
  message: string;
};
