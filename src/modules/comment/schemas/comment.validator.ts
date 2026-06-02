import { z } from "zod/v3";

export const createCommentSchema = z.object({
  postId: z.number(),
  content: z.string().min(1),
  parentId: z.number().optional(),
  mentions: z.array(z.number()).optional(),
});

// Inferred TypeScript types
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
