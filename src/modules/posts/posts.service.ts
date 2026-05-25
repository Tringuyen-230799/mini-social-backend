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
import { PostRepository } from "~/repository/posts.repository";
import { Resources } from "~/shared/types/resources";

export class PostsService {
  private cloudinaryServices: CloudiaryService;
  private postRepository: PostRepository;
  constructor() {
    this.cloudinaryServices = cloudiary;
    this.postRepository = new PostRepository();
  }

  async createPost(
    userId: number,
    data: CreatePostDto,
    file?: Express.Multer.File,
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

      if (post && file) {
        const { public_id, secure_url, resource_type } =
          await this.cloudinaryServices.uploadFile(file);

        await client.query(
          `INSERT INTO resources (post_id, url, alt_text, created_at, public_id, resource_type)
           VALUES ($1, $2, $3, NOW(), $4, $5)`,
          [post.id, secure_url, null, public_id, resource_type],
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
          json_build_object('id', r.id, 'url', r.url, 'alt_text', r.alt_text, 'type', r.resource_type)
        ) FILTER (WHERE r.id IS NOT NULL) as resources,
        json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url) as user
      FROM posts p
      LEFT JOIN resources r ON p.id = r.post_id
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

  async updatePost(payload: UpdatePostDto, file?: Express.Multer.File) {
    const { content, id, userId, oldImageIds } = payload;

    return withTransaction(async (tx) => {
      const post = await this.postRepository.findPostByUser(id, userId, tx);

      if (!post) {
        throw new BadRequestException("Post not found");
      }

      if (oldImageIds) {
        const ids = oldImageIds.join(", ");

        const { rows: resources } = await tx.query<Resources>(
          "SELECT * FROM resources WHERE post_id = $1 AND id IN ($2)",
          [post.id, ids],
        );

        if (!resources.length) {
          throw new BadRequestException("Resources not found");
        }

        const resourceIds = resources.map((res) => res.id).join(", ");
        const publicIds = resources.map((res) => res.public_id);

        const deleteOldResources = await tx.query(
          `DELETE FROM resources WHERE id IN (${resourceIds})`,
        );

        await Promise.all([
          deleteOldResources,
          ...publicIds.map((id) => this.cloudinaryServices.deleteFile(id)),
        ]);
      }

      if (file) {
        const { public_id, secure_url, resource_type } =
          await this.cloudinaryServices.uploadFile(file);

        await tx.query(
          `INSERT INTO resources (post_id, url, alt_text, created_at, public_id, resource_type)
           VALUES ($1, $2, $3, NOW(), $4, $5)`,
          [post.id, secure_url, null, public_id, resource_type],
        );
      }

      if (post.content !== content) {
        await tx.query(
          `UPDATE posts SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
          [content, id, userId],
        );
      }

      return await this.getPostById(id);
    });
  }
}
