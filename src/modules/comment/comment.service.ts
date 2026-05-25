import { PoolClient } from "pg";
import pool from "~/config/database";
import { decodeBase64, encodeBase64 } from "~/shared/utils/common";
import { NotFoundException } from "~/shared/utils/error-exception";
import { withTransaction } from "~/shared/utils/transaction";
import { CommentRepository } from "../../repository/comment.repository";
import PostRepository from "~/shared/repository/posts.repo";
import { MentionsRepository } from "~/shared/repository/mentions.repo";
import { CommentEntity } from "./comment.entity";
import { MentionEntity } from "~/shared/entity/mentions.entity";
import { CreateCommentResDto } from "./dto/createCommentSchemas";

export class CommentServices {
  private commentRepository: CommentRepository;
  private postRepository: PostRepository;
  private mentionsRepository: MentionsRepository;
  constructor() {
    this.commentRepository = new CommentRepository();
    this.postRepository = new PostRepository();
    this.mentionsRepository = new MentionsRepository();
  }

  private async createCommentWithMentions(
    postId: number,
    userId: number,
    content: string,
    mentions: number[] | undefined,
    tx: PoolClient,
    parentId?: number | undefined,
  ): Promise<CommentEntity> {
    const result = await this.commentRepository.createComment(
      postId,
      userId,
      content,
      parentId,
      tx,
    );

    if (mentions?.length) {
      const mentionsResult = await this.mentionsRepository.createMentions(
        result.id,
        mentions,
        tx,
      );

      return {
        ...result,
        mentions: mentionsResult.map(
          (mention: MentionEntity) => mention.mentioned_user_id,
        ),
      };
    }

    return result;
  }

  async createComment(
    postId: number,
    userId: number,
    content: string,
    parentId?: number,
    mentions?: number[],
  ): Promise<CreateCommentResDto> {
    return withTransaction(async (tx) => {
      const post = await this.postRepository.findPostById(postId, tx);

      if (!post) {
        throw new NotFoundException("No Post Found");
      }

      if (parentId) {
        const parentComments =
          await this.commentRepository.getParentCommentsByPost(
            postId,
            parentId,
            tx,
          );

        if (!parentComments?.length) {
          throw new NotFoundException("No Parent Comment Found");
        }
      }

      const result = await this.createCommentWithMentions(
        postId,
        userId,
        content,
        mentions,
        tx,
        parentId,
      );

      return result;
    });
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

    const query = `
      SELECT
      c.*,
      json_build_object('id', u.id, 'username', u.username, 'avatar', u.avatar_url) AS user,
      (SELECT COUNT(*)::int FROM comments WHERE parent_comment_id = c.id) AS total_replies,
        (SELECT json_agg(json_build_object('id', m.id, 'username', u2.username, 'avatar', u2.avatar_url)) 
         FROM mentions m
         JOIN users u2 ON m.mentioned_user_id = u2.id
         WHERE m.comment_id = c.id
        ) AS mentions
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
        json_build_object('id', u.id, 'username', u.username, 'avatar', u.avatar_url) AS user,
        (SELECT json_agg(json_build_object('id', m.id, 'username', u2.username, 'avatar', u2.avatar_url)) 
         FROM mentions m
         JOIN users u2 ON m.mentioned_user_id = u2.id
         WHERE m.comment_id = c.id
        ) AS mentions
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
