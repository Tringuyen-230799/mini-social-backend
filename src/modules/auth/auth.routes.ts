import { Router } from "express";
import { AuthController } from "./auth.controller";
import { wrapper } from "~/shared/utils/wrapper";
import { validate } from "~/middleware/validate.middleware";
import { signupSchema, loginSchema } from "./auth.types";

const router = Router();
const controller = new AuthController();

router.post(
  "/signup",
  validate(signupSchema),
  wrapper(controller.signup.bind(controller)),
);
router.post(
  "/login",
  validate(loginSchema),
  wrapper(controller.login.bind(controller)),
);
router.post("/logout", wrapper(controller.logout.bind(controller)));
router.get("/me", wrapper(controller.me.bind(controller)));

export default router;
