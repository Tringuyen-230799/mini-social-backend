import { z } from "zod/v3";

export const signupSchema = z
  .object({
    lastName: z.string().min(3).max(25),
    firstName: z.string().min(3).max(25),
    email: z.string().email(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(25, "Password must be at most 25 characters")
      .regex(/^(?=.*[A-Z])(?=.*@)(?=.*[0-9]).+$/, "Password invalid"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignupDto = z.infer<typeof signupSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

export interface User {
  id: number;
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  is_verify: boolean;
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
