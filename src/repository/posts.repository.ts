import { PoolClient } from "pg";
import pool from "~/config/database";
import { Post } from "~/modules/posts/posts.types";
import { BadRequestException } from "~/shared/utils/error-exception";

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

  async getPostById(postId: number, poolClient?: PoolClient): Promise<Post> {
    const db = poolClient ?? pool;

    const result = await db.query(
      `
      SELECT 
        p.id,
        p.content,
        p.created_at,
        p.updated_at,
        json_agg(
          json_build_object('id', r.id, 'url', r.url, 'alt_text', r.alt_text, 'type', r.resource_type)
        ) FILTER (WHERE r.id IS NOT NULL) as resources,
        json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url) as user
      FROM posts p
      LEFT JOIN resources r ON p.id = r.post_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
      GROUP BY p.id, u.id
    `,
      [postId],
    );

    if (result.rows.length === 0) {
      throw new BadRequestException("Post not found");
    }

    return result.rows[0];
  }
}
