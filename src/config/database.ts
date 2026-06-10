// db.js
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
});

pool.on("error", (err, client) => {
  throw err
});

pool.on("connect", (client) => {
  console.log("New client connected to the pool");
});

pool.on("remove", (client) => {
  console.log("Client removed from the pool");
});

export default pool;
