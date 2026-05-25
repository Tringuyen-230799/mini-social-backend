import pool from "~/config/database";
import {
  AllPostsResponse,
  CreatePostDto,
  Post,
  UpdatePostDto,
} from "./posts.types";
import { BadRequestException } from "~/shared/utils/error-exception";
import { withTransaction } from "~/shared/utils/transaction";
import cloudiary, { CloudiaryService } from "~/config/cloudiary";

export class PostsService {
  private cloudinaryServices: CloudiaryService;
  constructor() {
    this.cloudinaryServices = cloudiary;
  }

  async createPost(
    userId: number,
    data: CreatePostDto,
    file: Express.Multer.File,
  ): Promise<Post> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const {
        rows: [post],
      } = await client.query(
        "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *",
        [userId, data.content],
      );

      if (post) {
        const { public_id, secure_url } =
          await this.cloudinaryServices.uploadFile(file);

        await client.query(
          `INSERT INTO images (post_id, url, alt_text, created_at, public_id)
           VALUES ($1, $2, $3, NOW(), $4)`,
          [post.id, secure_url, null, public_id],
        );
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
      throw new BadRequestException("Post not found");
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

  async updatePost(payload: UpdatePostDto) {
    const { id, content, userId, newImages } = payload;

    return withTransaction(async (tx) => {
      const {
        rows: [post],
      } = await tx.query(
        `SELECT * FROM posts WHERE id = ${id} AND user_id = ${userId}`,
      );

      if (!post) {
        throw new BadRequestException("No post found");
      }

      if (newImages) {
        if (newImages && newImages.length > 0) {
          for (const path of newImages) {
            await tx.query(
              "INSERT INTO images (post_id, url) VALUES ($1, $2)",
              [id, path],
            );
          }
        }
      }

      if (post?.content !== content) {
        const updateQuery = `
          UPDATE posts 
          SET content = $1
          WHERE id = $2
          RETURNING *
        `;
        const {
          rows: [post],
        } = await tx.query(updateQuery, [content, id]);

        return post;
      }
    });
  }
}
