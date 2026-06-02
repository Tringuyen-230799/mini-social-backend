import { faker } from "@faker-js/faker";
import { PoolClient } from "pg";
import { User } from "~/modules/auth/dto/auth.dto";
import { Post } from "~/modules/posts/posts.types";

async function seedPosts(numOfRecord: number = 100, client: PoolClient) {
  try {
    const { rows: users } = await client.query<User>(
      "SELECT id FROM users LIMIT 25",
    );

    if (!users.length) {
      console.error("No users found in database. Please create a user first.");
      return;
    }

    const userIds = users.map((u) => u.id);

    for (let i = 0; i < numOfRecord; i++) {
      const index = Math.ceil(Math.random() * (userIds.length - 1));
      const userId = userIds[index];

      const content = faker.lorem.text();
      const hasResource = i % 2 == 0;

      const {
        rows: [post],
      } = await client.query<Post>(
        `INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *`,
        [userId, content],
      );

      if (hasResource) {
        await client.query(
          `INSERT INTO resources (post_id, url, alt_text, public_id, resource_type, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            post.id,
            `https://res.cloudinary.com/cld-docs/image/upload/v1719307544/gotjephlnz2jgiu20zni.jpg`,
            "Test image",
            "",
            "image",
          ],
        );
      }
    }
    console.log(`✅ Successfully seeded ${numOfRecord} posts`);
  } catch (error) {
    console.error("Seed failed:", error);
    return error as Error;
  }
}

export default seedPosts;
