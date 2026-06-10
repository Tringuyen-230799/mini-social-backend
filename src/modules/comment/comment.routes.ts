import { Router } from "express";
import { CommentController } from "./comment.controller";
import { wrapper } from "~/shared/utils/wrapper";
import { authMiddleware } from "~/middleware/auth.middleware";
import { validate } from "~/middleware/validate.middleware";
import { createCommentSchema } from "./schemas/comment.validator";

const router = Router();
const controller = new CommentController();

router.post(
  "/",
  authMiddleware,
  validate(createCommentSchema),
  wrapper(controller.createComments.bind(controller)),
);

router.get("/:postId", wrapper(controller.getCommentsByPost.bind(controller)));
router.get(
  "/replies/:commentId",
  wrapper(controller.getRepliesByComment.bind(controller)),
);

export default router;
