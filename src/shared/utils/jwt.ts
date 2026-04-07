import { JwtPayload } from "~/modules/auth/auth.types";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../constraint";

 export function verifyToken(token: string): JwtPayload | undefined {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      return undefined;
    }
  }

export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d',
    });
  }