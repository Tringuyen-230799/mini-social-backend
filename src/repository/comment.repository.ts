import { PoolClient } from "pg";
import pool from "~/config/database";
import { CommentEntity } from "../modules/comment/comment.entity";

export class CommentRepository {
  async createComment(
    postId: number,
    userId: number,
    content: string,
    depth: number,
    parentId?: number,
    client?: PoolClient,
  ): Promise<CommentEntity> {
    const db = client ?? pool;

    const insertCommentQuery =
      "INSERT INTO comments (post_id, user_id, content, parent_comment_id, depth) VALUES ($1, $2, $3, $4, $5) RETURNING*";

    const {
      rows: [comment],
    } = await db
      .query(insertCommentQuery, [
        postId,
        userId,
        content,
        parentId || null,
        depth,
      ])
      .catch((error) => {
        console.error("Error inserting comment:", error);
        throw new Error("Failed to create comment");
      });

    return comment;
  }

  async getParentCommentsByPost(
    postId: number,
    parentId: number,
    client?: PoolClient,
  ) {
    const db = client ?? pool;
    const findParentId =
      "SELECT * FROM comments c, posts p WHERE c.id = $1 AND c.post_id = $2 AND p.id = c.post_id";

    const { rows } = await db.query<CommentEntity>(findParentId, [
      parentId,
      postId,
    ]);

    return rows;
  }
}
