import { Request } from "express";
import { AuthService } from "./auth.service";

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
    return req.user
  };
}
