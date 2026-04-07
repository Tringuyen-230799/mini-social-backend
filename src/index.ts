import express from "express";
import bodyParser from "body-parser";
import { router } from "./routes";
import "dotenv/config";
import pool from "./config/database";
import cors from "cors";

function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  app.use(
    cors({
      origin: process.env.ORIGIN || "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/uploads", express.static("uploads"));

  app.get("/health-check", (req, res) => {
    res.send("Health check");
  });

  app.use(router);

  app.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
  });

  process.on("SIGINT", async () => {
    await pool.end();
    console.log("Pool has ended");
    process.exit(0);
  });
}

startServer();
