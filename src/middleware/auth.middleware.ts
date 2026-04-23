import { Request, Response, NextFunction } from "express";
import { verifyToken } from "~/shared/utils/jwt";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "No token provided",
      });
      return;
    }

    const token = authHeader.substring(7);

    if (token === process.env.TEST_TOKEN) {
      req.user = {
        userId: Number(process.env.userTestId),
      };
      next();
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        message: "No token provided",
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
