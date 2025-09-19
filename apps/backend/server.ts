// server.ts
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { connectDatabase, disconnectDatabase } from "./config/database";

// ----------------- Fix __dirname in ES Modules -----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------- Load Environment -----------------
// Only load dotenv in local dev. On Render, env vars come from dashboard.
if (process.env.NODE_ENV !== "production") {
  const envFile =
    process.env.NODE_ENV === "production" ? ".env.production" : ".env";
  dotenv.config({ path: path.join(__dirname, "..", envFile) });
  console.log(`🛠 Loaded environment from ${envFile}`);
}

// Debugging logs
console.log("🔎 NODE_ENV:", process.env.NODE_ENV);
console.log(
  "🔎 MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Loaded" : "❌ Not Loaded"
);

// ----------------- App Setup -----------------
const app = express();
const PORT = process.env.PORT || 5000;

// ----------------- Middleware -----------------
let corsConfig: cors.CorsOptions;
if (process.env.NODE_ENV === "production") {
  corsConfig = {
    origin:
      process.env.FRONTEND_URL || "https://flashscore-study-app.vercel.app",
    credentials: true,
  };
} else {
  corsConfig = {
    origin: ["http://localhost:3000"],
    credentials: true,
  };
}

app.use(cors(corsConfig));
app.use(express.json());

// ----------------- Routes -----------------
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API all set champion 🏆 🚀" });
});

// ----------------- Error Handler -----------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({ error: "Bad Belle Ma Village people!" });
});

// ----------------- Start Server -----------------
const server = app.listen(PORT, async () => {
  await connectDatabase();
  console.log(
    `✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});

// ----------------- Graceful Shutdown -----------------
const shutdown = async (signal: string) => {
  console.log(`🛑 Received ${signal}. Shutting down...`);
  server.close(async () => {
    await disconnectDatabase();
    console.log("🏆 Shutdown complete. Goodbye!");
    process.exit(0);
  });
};

["SIGINT", "SIGTERM"].forEach((signal) =>
  process.on(signal, () => shutdown(signal))
);

process.on("uncaughtException", (err) => {
  console.error(`💥 Uncaught Exception:`, err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error(`💥 Unhandled Rejection:`, reason);
});