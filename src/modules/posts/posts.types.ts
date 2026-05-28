import { z } from "zod/v3";

export const createPostSchema = z.object({
  content: z.string().min(1).max(255),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(255).optional(),
  userId: z.number(),
  oldImageIds: z.array(z.string()).optional(),
  id: z.number(),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;

export interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  delete_at: Date;
}
export interface PostRespone extends Post {
  resources: Resource[];
  user: {
    id: number;
    username: string;
    avatar_url: string | null;
  };
}

export interface AllPostsResponse {
  totalCount: number;
  content: PostRespone[];
  page: number;
  totalPages: number;
}

export interface DeletePostDto extends Post {
  resources?: Resource[];
}

export interface Resource {
  id: number;
  url: string;
  alt_text: string | null;
  public_id?: string;
}
