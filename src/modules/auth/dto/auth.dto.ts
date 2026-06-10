import { SignupInput, LoginInput } from "../schemas/auth.validator";

// Re-export for convenience
export type SignupDto = SignupInput;
export type LoginDto = LoginInput;

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
