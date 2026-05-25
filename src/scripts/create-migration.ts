import fs from "fs";
import path from "path";

const migrationsDir = path.join(__dirname, "../migrations");

// Get migration name from command line args
const migrationName = process.argv[2];

if (!migrationName) {
  console.error("❌ Error: Please provide a migration name");
  console.log("Usage: npm run migrate:create <migration_name>");
  console.log("Example: npm run migrate:create add_likes_table");
  process.exit(1);
}

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const hours = String(now.getHours()).padStart(2, "0");
const minutes = String(now.getMinutes()).padStart(2, "0");
const seconds = String(now.getSeconds()).padStart(2, "0");

const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
const filename = `${timestamp}_${migrationName}.sql`;
const filepath = path.join(migrationsDir, filename);

fs.writeFileSync(filepath, '');

console.log(`✅ Migration file created: ${filename}`);
console.log(`📁 Path: ${filepath}`);
