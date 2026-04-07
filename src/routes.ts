import { Router } from "express";
import authRoutes from "~/modules/auth/auth.routes";

const router = Router();

// Auth routes
router.use("/api/auth", authRoutes);

export { router };
