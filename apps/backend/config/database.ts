import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not defined");
  if (process.env.NODE_ENV === "production") {
    throw new Error("MongoDB connection string is required in production");
  }
}

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (!MONGODB_URI) {
    console.log("⚠️ Skipping database connection - MONGODB_URI not set");
    return;
  }

  if (isConnected) {
    console.log("⚡ Using existing MongoDB connection");
    return;
  }

  const connect = async () => {
    try {
      const conn = await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      isConnected = true;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      console.log("⏳ Retrying in 5s...");
      setTimeout(connect, 5000); // Retry after 5 seconds
    }
  };

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
    isConnected = false;
  });

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected");
    isConnected = false;
    // try to reconnect
    connect();
  });

  await connect();
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      console.log("🔄 Database disconnected successfully");
      isConnected = false;
    } catch (error) {
      console.error("❌ Error disconnecting from database:", error);
    }
  }
};

// Graceful shutdown (works on Render/Docker too)
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`🛑 Received ${signal}, closing DB connection...`);
    await disconnectDatabase();
    process.exit(0);
  });
});