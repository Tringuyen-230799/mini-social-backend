// Extend Express Request type
declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      email?: string;
      username?: string;
      avatar_url?: string;
    };
  }
}
