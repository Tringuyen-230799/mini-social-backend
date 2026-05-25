// Extend Express Request type
declare namespace Express {
  export interface Request {
    user?: {
      userId: number;
      email?: string;
    };
  }
}
