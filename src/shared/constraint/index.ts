export const SALT_ROUNDS = 10;
export const JWT_SECRET: string =
  process.env.JWT_SECRET || "default-secret-key";
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";
