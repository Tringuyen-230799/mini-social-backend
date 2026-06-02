import { z } from "zod/v3";

export const CreatePostSchema = z.object({
  content: z.string().min(1).max(255),
});

export const UpdatePostSchema = z.object({
  content: z.string().min(1).max(255).optional(),
  userId: z.number(),
  oldImageIds: z.array(z.string()).optional(),
  id: z.number(),
});

// Inferred TypeScript types
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
