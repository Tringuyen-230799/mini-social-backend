export type CommentEntity = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  parentId?: number | null;
  createdAt: Date;
  mentions?: number[];
};
