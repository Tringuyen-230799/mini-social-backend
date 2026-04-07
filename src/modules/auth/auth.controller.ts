import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { verifyToken } from "~/shared/utils/jwt";
import {
  BadRequestException,
  InternalException,
} from "~/shared/utils/error-exception";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = async (req: Request) => {
    try {
      const result = await this.authService.signup(req.body);

      return {
        success: true,
        message: "User registered successfully",
        data: result,
      }; 
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalException("Internal server error");
      }
    }
  };

  login = async (req: Request) => {
    try {
      const result = await this.authService.login(req.body);

      return {
        success: true,
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalException("Internal server error");
      }
    }
  };

  logout = async () => {
    try {
      return {
        success: true,
        message: "Logout successful",
      };
    } catch (error) {
      throw new InternalException("Internal server error");
    }
  };

  me = async (req: Request) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new BadRequestException("No token provided");
      }

      const token = authHeader.split(" ")[1];

      console.log(token)
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
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalException("Internal server error");
      }
    }
  };
}
