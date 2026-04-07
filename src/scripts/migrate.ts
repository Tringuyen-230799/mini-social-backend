import { readdir, readFile } from "fs/promises";
import { join } from "path";
import pool from "~/config/database";

interface Migration {
  id: number;
  name: string;
  filename: string;
  sql: string;
}

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Step 2: Read all migration files
    const migrationsDir = join(__dirname, "../migrations");
    const files = await readdir(migrationsDir);
    const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();

    if (!sqlFiles.length) {
      throw new Error("No migration files found");
    }

    const { rows: executed } = await client.query(
      "SELECT name FROM migrations ORDER BY id",
    );

    const executedNames = new Set(executed.map((r) => r.name));

    const migrations: Migration[] = [];
    for (const filename of sqlFiles) {
      const name = filename.replace(".sql", "");

      if (executedNames.has(name)) continue;

      const filepath = join(migrationsDir, filename);
      const sql = await readFile(filepath, "utf-8");

      migrations.push({
        id: migrations.length,
        name,
        filename,
        sql,
      });
    }

    if (!migrations.length) {
      console.log("✓ All migrations up to date");
      return;
    }

    for (const migration of migrations) {
      await client.query("BEGIN");
      try {
        await client.query(migration.sql);
        await client.query("INSERT INTO migrations (name) VALUES ($1)", [
          migration.name,
        ]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`Error in ${migration.filename}: `, error);
        throw error;
      }
    }

    console.log(`Successfully ran ${migrations.length} migration(s)`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
