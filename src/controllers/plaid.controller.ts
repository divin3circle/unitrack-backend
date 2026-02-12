import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { PlaidService } from "../services/plaid.service";

export class PlaidController {
  static async createLinkToken(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId)
        return res.status(401).json({ error: "User not authenticated" });

      const linkToken = await PlaidService.createLinkToken(userId);
      res.json({ linkToken });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async exchangePublicToken(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId)
        return res.status(401).json({ error: "User not authenticated" });

      const publicToken = req.body.publicToken || req.body.public_token;
      const metadata = req.body.metadata;

      if (!publicToken)
        return res.status(400).json({ error: "publicToken is required" });

      await PlaidService.exchangePublicToken(userId, publicToken, metadata);

      res.json({ status: "connected" });
    } catch (error: any) {
      console.error(
        "[Plaid Exchange Error]:",
        error.response?.data || error.message,
      );
      const message = error.response?.data?.error_message || error.message;
      res
        .status(error.response?.status || 500)
        .json({ error: message, details: error.response?.data });
    }
  }

  static async createUpdateLinkToken(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId)
        return res.status(401).json({ error: "User not authenticated" });

      const { portfolioId } = req.params;
      const linkToken = await PlaidService.createUpdateLinkToken(
        userId,
        portfolioId,
      );

      res.json({ linkToken });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
