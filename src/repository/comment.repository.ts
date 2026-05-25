import { PoolClient } from "pg";
import pool from "~/config/database";
import { CommentEntity } from "../modules/comment/comment.entity";

export class CommentRepository {
  async createComment(
    postId: number,
    userId: number,
    content: string,
    parentId?: number,
    client?: PoolClient,
  ): Promise<CommentEntity> {
    const db = client ?? pool;

    const insertCommentQuery =
      "INSERT INTO comments (post_id, user_id, content, parent_comment_id) VALUES ($1, $2, $3, $4) RETURNING*";

    const {
      rows: [comment],
    } = await db
      .query(insertCommentQuery, [postId, userId, content, parentId || null])
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

    const { rows } = await db.query(findParentId, [parentId, postId]);

    return rows;
  }
}
