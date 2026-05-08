import { PoolClient } from "pg";
import pool from "~/config/database";
import { decodeBase64, encodeBase64 } from "~/shared/utils/common";
import { NotFoundException } from "~/shared/utils/error-exception";

export class CommentServices {
  async createComment(
    postId: number,
    userId: number,
    content: string,
    parentId?: number,
  ) {
    const client: PoolClient = await pool.connect();
    try {
      await client.query("BEGIN");
      const findPostQuery = "SELECT * FROM posts WHERE id = $1";
      const { rows: post } = await client.query(findPostQuery, [postId]);

      if (!post?.length) {
        throw new NotFoundException("No Post Found");
      }

      if (parentId) {
        const findParentId =
          "SELECT * FROM comments c, posts p WHERE c.id = $1 AND c.post_id = $2 AND p.id = c.post_id";
        const { rows } = await client.query(findParentId, [parentId, postId]);

        if (!rows?.length) {
          throw new NotFoundException("No Parent Comment Found");
        }
      }

      const insertCommentQuery =
        "INSERT INTO comments (post_id, user_id, content, parent_comment_id) VALUES ($1, $2, $3, $4) RETURNING*";

      const { rows } = await client
        .query(insertCommentQuery, [
          postId,
          userId,
          content,
          parentId || null,
        ])
        .catch((error) => {
          console.error("Error inserting comment:", error);
          throw new Error("Failed to create comment");
        });

      await client.query("COMMIT");

      return rows;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getCommentsByPost(postId: number, cursor?: string, limit: number = 10) {
    const client: PoolClient = await pool.connect();
    const parseCursor = decodeBase64(cursor) as {
      id: number;
      createdAt: string;
    } | null;

    const whereClause = parseCursor
      ? `AND (c.created_at < $3::timestamptz OR (c.created_at = $3::timestamptz AND c.id < $4))`
      : "";

    const params = parseCursor
      ? [postId, limit, parseCursor.createdAt, parseCursor.id]
      : [postId, limit];

    const query = `SELECT
      c.*,
      json_build_object('id', u.id, 'username', u.username, 'avatar', u.avatar_url) AS user
    FROM comments c 
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1 AND c.parent_comment_id IS NULL ${whereClause} 
    ORDER BY c.created_at DESC, c.id DESC 
    LIMIT $2`;

    const totalCountQuery =
      "SELECT COUNT(*) FROM comments WHERE post_id = $1 AND parent_comment_id IS NULL";

    const { rows } = await client.query(query, params);

    const { rows: rowCount } = await client.query(totalCountQuery, [postId]);

    if (!rows?.length || !rowCount[0]?.count) {
      return {
        content: [],
        nextCursor: null,
        totalCount: 0,
        hasMore: false,
      };
    }

    const lastValue = rows[rows.length - 1];

    const stringifiedCursor = encodeBase64({
      id: lastValue.id,
      createdAt: lastValue.created_at.toISOString(),
    });

    const nextCursor = rows.length === limit ? stringifiedCursor : null;

    const totalCount = parseInt(rowCount[0].count, 10);

    client.release();

    return {
      content: rows,
      nextCursor,
      totalCount,
      hasMore: nextCursor !== null,
    };
  }

  async getRepliesByComment(
    commentId: number,
    page: number = 1,
    limit: number = 5,
  ) {
    const client: PoolClient = await pool.connect();

    const offset = (page - 1) * limit;
    const query = `SELECT
        c.*,
        json_build_object('id', u.id, 'username', u.username, 'avatar', u.avatar_url) AS user
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_comment_id = $1
      ORDER BY c.created_at ASC 
      OFFSET $2 LIMIT $3`;

    const totalCountQuery =
      "SELECT COUNT(*) FROM comments WHERE parent_comment_id = $1";

    const { rows } = await client.query(query, [commentId, offset, limit]);

    const { rows: rowCount } = await client.query(totalCountQuery, [commentId]);

    const totalCount = parseInt(rowCount[0].count, 10);

    client.release();

    return {
      content: rows,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}
