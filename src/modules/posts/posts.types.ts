import { z } from "zod/v3";

export const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;

export interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
  images: Array<{
    id: number;
    url: string;
    alt_text: string | null;
  }>;
  user: {
    id: number;
    username: string;
    avatar_url: string | null;
  };
}

export interface AllPostsResponse {
  totalCount: number;
  content: Post[];
  page: number;
  totalPages: number;
}
