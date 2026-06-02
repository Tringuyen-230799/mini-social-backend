import { CreateCommentInput } from "../schemas/comment.validator";

// Re-export for convenience
export type CreateCommentDto = CreateCommentInput;

export interface CreateCommentResDto {
  id: number;
  content: string;
  createdAt: Date;
  userId: number;
  postId: number;
  mentions?: number[];
  parentId?: number | null;
}
