import { Router } from "express";
import authRoutes from "~/modules/auth/auth.routes";
import postsRoutes from "~/modules/posts/posts.routes";

const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/posts", postsRoutes);

export { router };
