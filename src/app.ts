import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import plaidRoutes from './routes/plaid.routes';
import portfolioRoutes from './routes/portfolio.routes';
import webhookRoutes from './routes/webhook.routes';
import manualAssetRoutes from './routes/manual-asset.routes';
import marketRoutes from './routes/market.routes';
import analyticsRoutes from './routes/analytics.routes';
import walletRoutes from './routes/wallet.routes';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/connections/plaid', plaidRoutes);
app.use('/v1/portfolio', portfolioRoutes);
app.use('/v1/webhooks', webhookRoutes);
app.use('/v1/assets/manual', manualAssetRoutes);
app.use('/v1/market', marketRoutes);
app.use('/v1/analytics', analyticsRoutes);
app.use('/v1/connections/wallet', walletRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
