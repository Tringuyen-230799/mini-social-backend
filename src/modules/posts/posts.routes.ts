import { Router } from "express";
import { PostsController } from "./posts.controller";
import { wrapper } from "~/shared/utils/wrapper";
import { authMiddleware } from "~/middleware/auth.middleware";
import { upload } from "~/config/multer.config";
import { validate } from "~/middleware/validate.middleware";
import { CreatePostSchema } from "./schemas/posts.validator";

const router = Router();
const controller = new PostsController();

router.post(
  "/",
  authMiddleware,
  upload.single("images"),
  validate(CreatePostSchema),
  wrapper(controller.createPost.bind(controller)),
);

router.get(
  "/",
  authMiddleware,
  wrapper(controller.getAllPosts.bind(controller)),
);

router.get("/:id", wrapper(controller.getPost.bind(controller)));

router.delete(
  "/:id",
  authMiddleware,
  wrapper(controller.hardDeletePost.bind(controller)),
);

router.patch(
  "/:id",
  authMiddleware,
  upload.single("images"),
  wrapper(controller.updatePost.bind(controller)),
);

router.delete(
  "/trash/:id",
  authMiddleware,
  wrapper(controller.softDelete.bind(controller)),
);

router.post(
  "/restore/:id",
  authMiddleware,
  wrapper(controller.restorePost.bind(controller)),
);

router.post(
  "/like/:id",
  authMiddleware,
  wrapper(controller.likePost.bind(controller)),
);

router.post(
  "/unlike/:id",
  authMiddleware,
  wrapper(controller.unLikePost.bind(controller)),
);

export default router;
