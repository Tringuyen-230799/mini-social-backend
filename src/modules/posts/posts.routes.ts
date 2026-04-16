import { Router } from "express";
import { PostsController } from "./posts.controller";
import { wrapper } from "~/shared/utils/wrapper";
import { authMiddleware } from "~/middleware/auth.middleware";
import { upload } from "~/config/multer.config";
import { validate } from "~/middleware/validate.middleware";
import { createPostSchema } from "./posts.types";

const router = Router();
const controller = new PostsController();

router.post(
  "/",
  authMiddleware,
  upload.array("images", 5),
  validate(createPostSchema),
  wrapper(controller.createPost.bind(controller)),
);

router.get("/", wrapper(controller.getAllPosts.bind(controller)));

router.get("/:id", wrapper(controller.getPost.bind(controller)));

export default router;
