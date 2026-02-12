import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { AnalyticsService } from "../services/analytics.service";

export class AnalyticsController {
  static async getHealth(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId)
        return res.status(401).json({ error: "User not authenticated" });

      const health = await AnalyticsService.getHealthScore(userId);
      res.json(health);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async chat(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId)
        return res.status(401).json({ error: "User not authenticated" });

      const { message } = req.body;
      if (!message)
        return res.status(400).json({ error: "Message is required" });

      const response = await AnalyticsService.chat(userId, message);
      res.json({ response });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getExposure(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId)
        return res.status(401).json({ error: "User not authenticated" });

      const exposure = await AnalyticsService.getGeographicExposure(userId);
      res.json(exposure);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAmortization(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId)
        return res.status(401).json({ error: "User not authenticated" });

      const { id } = req.params;
      const amortization = await AnalyticsService.getAmortization(userId, id);
      res.json(amortization);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
