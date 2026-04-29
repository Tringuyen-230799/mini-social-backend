import { Request } from "express";
import { AuthService } from "./auth.service";
import { verifyToken } from "~/shared/utils/jwt";
import { BadRequestException } from "~/shared/utils/error-exception";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = async (req: Request) => {
    const result = await this.authService.signup(req.body);

    return result;
  };

  login = async (req: Request) => {
    const result = await this.authService.login(req.body);

    return result;
  };

  logout = async () => {
    return true;
  };

  me = async (req: Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new BadRequestException("No token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    if (!decoded) {
      throw new BadRequestException("Error verifying token");
    }

    const user = await this.authService.getUserById(decoded.userId);

    if (!user) {
      throw new BadRequestException("User not found");
    }

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    };
  };
}
