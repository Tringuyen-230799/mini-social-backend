import { PoolClient } from "pg";
import pool from "~/config/database";

class PostRepository {
  async findPostById(postId: number, client?: PoolClient) {
    const db = client ?? pool;
    const findPostQuery = "SELECT * FROM posts WHERE id = $1";

    const {
      rows: [post],
    } = await db.query(findPostQuery, [postId]);

    return post;
  }
}

export default PostRepository;
