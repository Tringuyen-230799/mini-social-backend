import { Pool, PoolClient } from "pg";
import pool from "~/config/database";
import {
  DeletePostDto,
  Post,
  PostRespone,
} from "~/modules/posts/dto/posts.dto";
import { TIME_DELETE_PERMANENT } from "~/shared/constraint";
import { BadRequestException } from "~/shared/utils/error-exception";

export class PostRepository {
  async findPostByUser(
    id: string | number,
    userId: string | number,
    poolClient?: PoolClient | Pool,
  ): Promise<Post> {
    const db = poolClient ?? pool;

    const {
      rows: [post],
    } = await db.query<Post>(
      `SELECT * 
       FROM posts p
       WHERE p.id = $1
       AND p.user_id = $2`,
      [id, userId],
    );

    return post;
  }

  async findPostById(
    postId: number,
    poolClient?: PoolClient | Pool,
  ): Promise<Post> {
    const db = poolClient ?? pool;

    const findPostQuery = `SELECT * FROM posts WHERE id = $1`;

    const {
      rows: [post],
    } = await db.query<Post>(findPostQuery, [postId]);

    return post;
  }

  async getPostById(
    postId: number,
    poolClient?: PoolClient,
  ): Promise<PostRespone> {
    const db = poolClient ?? pool;

    const result = await db.query<PostRespone>(
      `
      SELECT 
        p.id,
        p.content,
        p.created_at,
        p.updated_at,
        p.total_likes,
        json_agg(
          json_build_object('id', r.id, 'url', r.url, 'alt_text', r.alt_text, 'type', r.resource_type)
        ) FILTER (WHERE r.id IS NOT NULL) as resources,
        json_build_object('id', u.id, 'username', CONCAT(u.last_name, ' ', u.first_name), 'avatar_url', u.avatar_url) as user
      FROM posts p
      LEFT JOIN resources r ON p.id = r.post_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.is_deleted = false
      GROUP BY p.id, u.id
    `,
      [postId],
    );

    if (result.rows.length === 0) {
      throw new BadRequestException("Post not found");
    }

    return result.rows[0];
  }

  async softDeletePost(id: number, poolClient?: PoolClient) {
    const db = poolClient ?? pool;
    const deleteAt = new Date();
    deleteAt.setDate(deleteAt.getDate() + TIME_DELETE_PERMANENT);

    const { rowCount } = await db.query(
      `UPDATE posts
       SET is_deleted = true,
       delete_at = $1
       WHERE id = $2
      `,
      [deleteAt, id],
    );

    return rowCount;
  }

  async restorePost(id: number, userId: number, poolClient?: PoolClient) {
    const db = poolClient ?? pool;
    const {
      rows: [post],
    } = await db.query(
      `SELECT * FROM posts WHERE id = $1 AND user_id = $2 AND is_deleted = true`,
      [id, userId],
    );

    if (!post) {
      throw new BadRequestException("The post is not found");
    }

    const {
      rows: [newPost],
    } = await db.query(
      `UPDATE posts SET is_deleted = false, delete_at = null WHERE id = $1`,
      [id],
    );

    return newPost;
  }

  async findPostsToDelete(poolClient?: PoolClient): Promise<DeletePostDto[]> {
    const db = poolClient ?? pool;
    const { rows: posts } = await db.query<DeletePostDto>(
      `
      SELECT p.id, p.user_id, p.content, p.created_at, p.updated_at, p.is_deleted, p.delete_at,
      json_agg(
        json_build_object('id', r.id, 'url', r.url, 'public_id', r.public_id, 'alt_text', r.alt_text, 'type', r.resource_type)
      ) FILTER (WHERE r.id IS NOT NULL) as resources
      FROM posts p
      LEFT JOIN resources r ON p.id = r.post_id
      WHERE p.is_deleted = true 
      AND p.delete_at <= NOW()
      GROUP BY p.id
      `,
    );
    return posts;
  }

  async deletePermanently(postIds: number[], poolClient?: PoolClient) {
    const db = poolClient ?? pool;

    const { rowCount } = await db.query(
      `DELETE FROM posts WHERE id = ANY($1)`,
      [postIds],
    );

    return rowCount;
  }

  async hardDelete(id: number, poolClient?: PoolClient) {
    const db = poolClient ?? pool;

    const { rowCount } = await db.query(`DELETE FROM posts WHERE id = $1`, [
      id,
    ]);

    return rowCount;
  }

  async increasePostLike(postId: number, poolClient?: PoolClient) {
    const db = poolClient ?? pool;

    const result = await db.query(
      "UPDATE posts SET total_likes = total_likes + 1 WHERE id = $1 RETURNING *",
      [postId],
    );

    return result;
  }

  async decreasePostLike(postId: number, poolClient?: PoolClient) {
    const db = poolClient ?? pool;

    const result = await db.query(
      "UPDATE posts SET total_likes = total_likes - 1 WHERE id = $1 RETURNING *",
      [postId],
    );

    return result;
  }
}
