import { Pool, PoolClient } from "pg";
import pool from "~/config/database";
import { PostLikes } from "~/shared/types/postLike";

class PostLikesRepository {
  async create(
    postId: number,
    userId: number,
    poolClient?: PoolClient | Pool,
  ): Promise<PostLikes> {
    const db = poolClient ?? pool;

    const {
      rows: [record],
    } = await db.query<PostLikes>(
      "INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) RETURNING * ",
      [postId, userId],
    );

    return record;
  }

  async findUserLikePost(
    userId: number,
    postId: number,
    poolClient?: PoolClient | Pool,
  ): Promise<PostLikes> {
    const db = poolClient ?? pool;
    const {
      rows: [record],
    } = await db.query<PostLikes>(
      "SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2",
      [postId, userId],
    );

    return record;
  }

  async remove(id: number, poolClient?: PoolClient | Pool) {
    const db = poolClient ?? pool;
    return await db.query("DELETE FROM post_likes WHERE id = $1", [id]);
  }
}

export default PostLikesRepository;
