import { z } from "zod/v3";

export const signupSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignupDto = z.infer<typeof signupSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    avatar_url: string | null;
  };
  token: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
}
