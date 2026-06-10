import { User } from "~/shared/types/users";
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

export interface AllCommentDto {
  id: number;
  post_id: number;
  user_id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: Date;
  updated_at: Date;
  reply_user_id: number | null;
  user: User;
}
