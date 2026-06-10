export type CommentEntity = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  parentId?: number | null;
  depth: number;
  createdAt: Date;
  mentions?: number[];
};
