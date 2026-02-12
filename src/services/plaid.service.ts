import { CountryCode, Products } from "plaid";
import plaidClient from "../config/plaid";
import prisma from "../config/database";
import { encrypt, decrypt } from "../utils/encryption";

import { SyncService } from "./sync.service";

export class PlaidService {
  static async createLinkToken(userId: string): Promise<string> {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "Unitrack",
      products: [Products.Investments],
      country_codes: [CountryCode.Us, CountryCode.Es], // Support US and Spain as requested
      language: "en",
    });

    return response.data.link_token;
  }

  static async exchangePublicToken(
    userId: string,
    publicToken: string,
    metadata: any,
  ): Promise<void> {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token, item_id } = response.data;
    const encryptedToken = encrypt(access_token);

    // Save Plaid Item and metadata - handle missing metadata gracefully
    const institutionId = metadata?.institution?.institution_id || "unknown";
    const institutionName =
      metadata?.institution?.name || "Unknown Institution";

    const plaidPortfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: institutionName,
        type: "PLAID",
        plaidItemId: item_id,
        accessToken: encryptedToken,
        institutionId,
        institutionName,
        status: "ACTIVE",
      },
    });

    // Trigger initial sync job (async)
    SyncService.syncPlaidItem(plaidPortfolio.id).catch(console.error);
  }

  static async createUpdateLinkToken(
    userId: string,
    portfolioId: string,
  ): Promise<string> {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId, userId, type: "PLAID" },
    });

    if (!portfolio || !portfolio.accessToken) {
      throw new Error("Plaid portfolio not found or missing access token");
    }

    const decryptedToken = decrypt(portfolio.accessToken);

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "Unitrack",
      access_token: decryptedToken, // This triggers update mode
      country_codes: [CountryCode.Us, CountryCode.Es],
      language: "en",
    });

    return response.data.link_token;
  }
}
