import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/health", authMiddleware, AnalyticsController.getHealth);
router.post("/chat", authMiddleware, AnalyticsController.chat);
router.get("/exposure", authMiddleware, AnalyticsController.getExposure);
router.get(
  "/amortization/:id",
  authMiddleware,
  AnalyticsController.getAmortization,
);

export default router;
