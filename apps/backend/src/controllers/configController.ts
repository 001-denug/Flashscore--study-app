import { Request, Response } from 'express';

export class ConfigController {
  // Get sanitized config for frontend
  static getConfig = (req: Request, res: Response) => {
    try {
      const config = {
        nodeEnv: process.env.NODE_ENV || "unknown",
        frontendUrl: process.env.FRONTEND_URL || "not set",
        hasDatabase: (process.env.MONGODB_URI || process.env.DATABASE_URL) ? "🟢" : "🔴",
        hasSportsApi: process.env.SPORTS_API_KEY ? "⚽🟢" : "⚽🔴",
      };

      res.json({
        success: true,
        config,
        message: "Configuration loaded successfully"
      });
    } catch (error) {
      console.error("❌ Error getting config:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load configuration"
      });
    }
  };

  // Health check with emoji
  static healthCheck = (req: Request, res: Response) => {
    const health = {
      status: '✅ healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      checks: {
        database: (process.env.MONGODB_URI || process.env.DATABASE_URL) ? "🟢" : "🔴",
        admin: (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) ? "👤🟢" : "👤🔴",
        sportsApi: process.env.SPORTS_API_KEY ? "⚽🟢" : "⚽🔴",
      }
    };

    res.json(health);
  };
}