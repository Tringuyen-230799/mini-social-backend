import { z } from "zod/v3";

export const CreateCommentSchema = z.object({
  postId: z.number(),
  content: z.string().min(1),
  parentId: z.number().optional(),
  mentions: z.array(z.number()).optional(),
});

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;

export type CreateCommentResDto = {
  id: number;
  content: string;
  createdAt: Date;
  userId: number;
  postId: number;
  mentions?: number[];
  parentId?: number | null;
};
