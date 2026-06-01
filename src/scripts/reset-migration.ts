import pool from "../config/database";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

async function resetDatabase() {
  const client = await pool.connect();

  try {
    console.log("🗑️  Dropping all database objects...");

    await client.query("DROP SCHEMA public CASCADE");
    await client.query("CREATE SCHEMA public");
    await client.query("GRANT ALL ON SCHEMA public TO postgres");
    await client.query("GRANT ALL ON SCHEMA public TO public");

    console.log("✅ Database cleaned successfully");

    console.log("🔄 Running all migrations...");

    // Read and execute all migration files
    const migrationsDir = join(__dirname, "../migrations");
    const files = await readdir(migrationsDir);
    const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();

    if (!sqlFiles.length) {
      console.log("⚠️  No migration files found");
      return;
    }

    // Create migrations tracking table
    await client.query(`
      CREATE TABLE migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Run each migration
    for (const filename of sqlFiles) {
      const name = filename.replace(".sql", "");
      const filepath = join(migrationsDir, filename);
      const sql = await readFile(filepath, "utf-8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
        console.log(`✅ Executed: ${filename}`);
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`❌ Error in ${filename}:`, error);
        throw error;
      }
    }

    console.log(`\n✨ Successfully executed ${sqlFiles.length} migration(s)`);
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();
