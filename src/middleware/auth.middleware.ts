import { Request, Response, NextFunction } from "express";
import { User } from "~/modules/auth/auth.types";
import { UserRepository } from "~/repository/user.repository";
import { verifyToken } from "~/shared/utils/jwt";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userServices = new UserRepository();
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
        id: Number(process.env.userTestId),
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

    const user = (await userServices.findUserById(decoded.userId)) as User;

    if (!user) {
      res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url || undefined,
    };

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
