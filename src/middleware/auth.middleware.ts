import { Request, Response, NextFunction } from "express";
import { User } from "~/modules/auth/auth.types";
import { UserRepository } from "~/repository/user.repository";
import { verifyToken } from "~/shared/utils/jwt";
import { handleExcludeRoute } from "./helpers/excludeRoute";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userServices = new UserRepository();
    const authHeader = req.headers.authorization;

    const path = req.path;
    const method = req.method;

    if (handleExcludeRoute(path, method) && !authHeader) {
      next();
      return;
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "No token provided",
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        message: "No token provided",
      });
      return;
    }

    const user = (await userServices.findUserById(decoded?.userId)) as User;

    if (!user) {
      res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    req.user = {
      id: user?.id,
      username: user.first_name + " " + user.last_name,
      email: user.email,
      avatar_url: user.avatar_url || undefined,
    };

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
