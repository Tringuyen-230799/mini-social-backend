import { PoolClient } from "pg";
import pool from "~/config/database";
import { Post } from "~/modules/posts/posts.types";

export class PostRepository {
  async findPostByUser(
    id: string | number,
    userId: string | number,
    poolClient?: PoolClient,
  ): Promise<Post> {
    const db = poolClient ?? pool;

    const {
      rows: [post],
    } = await db.query(`SELECT * FROM posts WHERE id = $1 AND user_id = $2`, [
      id,
      userId,
    ]);

    return post;
  }

  async findPostById(postId: number, client?: PoolClient) {
    const db = client ?? pool;
    const findPostQuery = "SELECT * FROM posts WHERE id = $1";

    const {
      rows: [post],
    } = await db.query(findPostQuery, [postId]);

    return post;
  }
}
