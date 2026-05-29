import pool from "~/config/database";

async function seedUsers(numOfRecord?: number = 100): Promise<void> {
  const client = await pool.connect();

  
}
