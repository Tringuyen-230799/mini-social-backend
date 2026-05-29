import pool from "~/config/database";
import seedUsers from "./user.seed";
import seedPosts from "./posts.seed";
import seedDeletedPosts from "./posts-delete.seed";

async function seed() {
  const client = await pool.connect();

  await client.query(`TRUNCATE TABLE resources RESTART IDENTITY CASCADE`);
  await client.query(`TRUNCATE TABLE comments RESTART IDENTITY CASCADE`);
  await client.query(`TRUNCATE TABLE posts RESTART IDENTITY CASCADE`);
  await client.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);

  try {
    await client.query("BEGIN");
    await seedUsers(100, client);
    await seedPosts(100, client);
    await seedDeletedPosts(client);
    await client.query("COMMIT");
  } catch (error) {
    console.error("Error on seed file index: ", error);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

seed();
