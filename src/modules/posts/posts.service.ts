import pool from "~/config/database";
import { AllPostsResponse, CreatePostDto, Post } from "./posts.types";

export class PostsService {
  async createPost(
    userId: number,
    data: CreatePostDto,
    imagePaths?: string[],
  ): Promise<Post> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const postResult = await client.query(
        "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *",
        [userId, data.content],
      );

      const post = postResult.rows[0];

      if (imagePaths && imagePaths.length > 0) {
        for (const path of imagePaths) {
          await client.query(
            "INSERT INTO images (post_id, url) VALUES ($1, $2)",
            [post.id, path],
          );
        }
      }

      await client.query("COMMIT");

      return this.getPostById(post.id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getPostById(postId: number): Promise<Post> {
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.content,
        p.created_at,
        p.updated_at,
        json_agg(
          json_build_object('id', i.id, 'url', i.url, 'alt_text', i.alt_text)
        ) FILTER (WHERE i.id IS NOT NULL) as images,
        json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url) as user
      FROM posts p
      LEFT JOIN images i ON p.id = i.post_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
      GROUP BY p.id, u.id
    `,
      [postId],
    );

    if (result.rows.length === 0) {
      throw new Error("Post not found");
    }

    return result.rows[0];
  }

  async getAllPosts(
    limit: number = 20,
    page: number,
  ): Promise<AllPostsResponse> {
    const offset = ((page || 1) - 1) * limit;

    const totalCount = await pool.query(`SELECT COUNT(*) FROM posts`);

    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.content,
        p.created_at,
        p.updated_at,
        json_agg(
          json_build_object('id', i.id, 'url', i.url, 'alt_text', i.alt_text)
        ) FILTER (WHERE i.id IS NOT NULL) as images,
        json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url) as user
      FROM posts p
      LEFT JOIN images i ON p.id = i.post_id
      LEFT JOIN users u ON p.user_id = u.id
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset],
    );

    return {
      totalCount: parseInt(totalCount.rows[0].count, 10),
      content: result.rows,
      page: page || 1,
      totalPages: Math.ceil(totalCount.rows[0].count / limit),
    };
  }
}
