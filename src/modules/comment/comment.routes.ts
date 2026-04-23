import { Router } from "express";
import { CommentController } from "./comment.controller";
import { wrapper } from "~/shared/utils/wrapper";
import { authMiddleware } from "~/middleware/auth.middleware";

const router = Router();
const controller = new CommentController();

router.post(
  "/",
  authMiddleware,
  wrapper(controller.createComments.bind(controller)),
);

router.get("/:postId", wrapper(controller.getCommentsByPost.bind(controller)));

export default router;
