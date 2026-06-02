import { PoolClient } from "pg";
import { User } from "~/modules/auth/dto/auth.dto";

async function seedDeletedPosts(client: PoolClient) {
  try {
    const { rows: users } = await client.query<User>(
      "SELECT id FROM users LIMIT 25",
    );

    if (users.length === 0) {
      throw Error("No user found");
    }

    const userIds = users.map((u) => u.id);

    const postsData = [
      {
        content: "Post deleted 35 days ago - should be cleaned up",
        daysAgo: 35,
        hasResource: true,
      },
      {
        content: "Post deleted 31 days ago - should be cleaned up",
        daysAgo: 31,
        hasResource: true,
      },
      {
        content: "Post deleted 30 days ago - right at threshold",
        daysAgo: 30,
        hasResource: false,
      },
      {
        content: "Post deleted 25 days ago - not old enough yet",
        daysAgo: 25,
        hasResource: true,
      },
      {
        content: "Post deleted 10 days ago - recent, should stay",
        daysAgo: 10,
        hasResource: false,
      },
      {
        content: "Post deleted 1 day ago - very recent",
        daysAgo: 1,
        hasResource: true,
      },
    ];

    let insertedCount = 0;

    for (const postData of postsData) {
      const deleteAt = new Date();
      deleteAt.setDate(deleteAt.getDate() - postData.daysAgo);

      const index = Math.ceil(Math.random() * (userIds.length - 1));
      const userId = userIds[index];

      const { rows } = await client.query(
        `INSERT INTO posts (user_id, content, is_deleted, delete_at, created_at, updated_at)
         VALUES ($1, $2, true, $3, NOW(), NOW())
         RETURNING id, content, delete_at`,
        [userId, postData.content, deleteAt],
      );

      const postId = rows[0].id;

      if (postData.hasResource) {
        await client.query(
          `INSERT INTO resources (post_id, url, alt_text, public_id, resource_type, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            postId,
            `https://res.cloudinary.com/demo/image/upload/sample_${postId}.jpg`,
            "Test image",
            `test_image_${postId}`,
            "image",
          ],
        );
      }

      insertedCount++;
    }

    console.log(`Successfully seeded ${insertedCount} deleted posts!`);
  } catch (error) {
    console.error("Seed failed:", error);
    return error as Error;
  }
}

export default seedDeletedPosts;
