import { Router } from "express";
import authRoutes from "~/modules/auth/auth.routes";
import postsRoutes from "~/modules/posts/posts.routes";
import commentsRoutes from "~/modules/comment/comment.routes";

const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/posts", postsRoutes);
router.use("/api/comments", commentsRoutes);

export { router };
