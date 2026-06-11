import { CreatePostInput, UpdatePostInput } from "../schemas/posts.validator";

// Re-export for convenience
export type CreatePostDto = CreatePostInput;
export type UpdatePostDto = UpdatePostInput;

export interface Post {
  id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  delete_at: Date;
  total_likes: number;
  isliked: boolean;
  total_comment: number;
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
