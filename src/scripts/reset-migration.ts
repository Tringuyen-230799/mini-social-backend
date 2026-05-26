import pool from "../config/database";
import fs from "fs";
import path from "path";

async function resetDatabase() {
  const client = await pool.connect();

  try {
    await client.query("DROP TABLE IF EXISTS mentions CASCADE");

    await client.query("DROP TABLE IF EXISTS comments CASCADE");

    await client.query("DROP TABLE IF EXISTS resources CASCADE");

    await client.query("DROP TABLE IF EXISTS images CASCADE");

    await client.query("DROP TABLE IF EXISTS posts CASCADE");

    await client.query("DROP TABLE IF EXISTS users CASCADE");

    await client.query(
      "DROP FUNCTION IF EXISTS update_updated_at_column CASCADE",
    );
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();
