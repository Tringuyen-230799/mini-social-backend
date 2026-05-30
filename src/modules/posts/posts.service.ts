import pool from "~/config/database";
import {
  AllPostsResponse,
  CreatePostDto,
  Post,
  Resource,
  UpdatePostDto,
} from "./posts.types";
import { BadRequestException } from "~/shared/utils/error-exception";
import { withTransaction } from "~/shared/utils/transaction";
import cloudiary, { CloudiaryService } from "~/config/cloudiary";
import { PostRepository } from "~/repository/posts.repository";
import { Resources } from "~/shared/types/resources";
import { ResourcesRepository } from "~/repository/resources.repository";
import PostLikesRepository from "~/repository/postLikes.repository";
import { UserRepository } from "~/repository/user.repository";

export class PostsService {
  private cloudinaryServices: CloudiaryService;
  private postRepository: PostRepository;
  private resourcesRepository: ResourcesRepository;
  private postLikesRepository: PostLikesRepository;
  private userRepository: UserRepository;
  constructor() {
    this.cloudinaryServices = cloudiary;
    this.postRepository = new PostRepository();
    this.resourcesRepository = new ResourcesRepository();
    this.postLikesRepository = new PostLikesRepository();
    this.userRepository = new UserRepository();
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
    return await this.postRepository.getPostById(postId);
  }

  async getAllPosts(
    limit: number = 20,
    page: number,
    userId?: number,
  ): Promise<AllPostsResponse> {
    const offset = ((page || 1) - 1) * limit;

    const totalCount = await pool.query(`SELECT COUNT(*) FROM posts`);

    const { rows: posts } = await pool.query(
      `
      SELECT 
        p.id,
        p.content,
        p.created_at,
        p.updated_at,
        json_agg(
          json_build_object('id', r.id, 'url', r.url, 'alt_text', r.alt_text, 'type', r.resource_type)
        ) FILTER (WHERE r.id IS NOT NULL) as resources,
        json_build_object('id', u.id, 'username', CONCAT(u.last_name, ' ', u.first_name), 'avatar_url', u.avatar_url) as user
      FROM posts p
      LEFT JOIN resources r ON p.id = r.post_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.is_deleted = false
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset],
    );

    return {
      totalCount: parseInt(totalCount.rows[0].count, 10),
      content: posts,
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

      if (file) {
        const { public_id, secure_url, resource_type } =
          await this.cloudinaryServices.uploadFile(file);

        await tx.query(
          `INSERT INTO resources (post_id, url, alt_text, created_at, public_id, resource_type)
           VALUES ($1, $2, $3, NOW(), $4, $5)`,
          [post.id, secure_url, null, public_id, resource_type],
        );
      }

      if (content !== undefined && post.content !== content) {
        await tx.query(
          `UPDATE posts SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
          [content, id, userId],
        );
      }

      if (oldImageIds) {
        const { rows: resources } = await tx.query<Resources>(
          "SELECT * FROM resources WHERE post_id = $1 AND id = ANY($2)",
          [post.id, oldImageIds],
        );

        if (!resources?.length) {
          throw new BadRequestException("Resources not found");
        }

        const resourceIds = resources.map((res) => res.id);
        const publicIds = resources.map((res) => res.public_id);

        const deleteOldResources = await tx.query(
          `DELETE FROM resources WHERE id = ANY($1)`,
          [resourceIds],
        );

        await Promise.all([
          deleteOldResources,
          ...publicIds.map((id) => this.cloudinaryServices.deleteFile(id)),
        ]);
      }

      return await this.postRepository.getPostById(id, tx);
    });
  }

  async softDelete(id: number, userId: number) {
    const post = await this.postRepository.findPostByUser(id, userId);
    if (!post) {
      throw new BadRequestException("User is not the owner of the post");
    }

    if (post.is_deleted) {
      throw new BadRequestException("The post have been move to the trash");
    }

    return await this.postRepository.softDeletePost(post.id);
  }

  async restorePost(id: number, userId: number) {
    return await this.postRepository.restorePost(id, userId);
  }

  async cleanupDeletedPosts(): Promise<number | null> {
    const posts = await this.postRepository.findPostsToDelete();
    if (!posts.length) {
      return null;
    }
    const resources = posts
      .flatMap((post) => post.resources)
      .filter((res) => res !== null) as Resource[];

    const postIds = posts.map((post) => post.id);
    try {
      const numOfPostDelete = await withTransaction(async (tx) => {
        if (resources.length > 0) {
          const resourceIds = resources.map((res) => res.id);
          await this.resourcesRepository.deleteResources(resourceIds);
        }
        return await this.postRepository.deletePermanently(postIds, tx);
      });

      if (resources.length > 0) {
        const cloudDeletions = resources
          .filter((res) => res.public_id)
          .map((res) =>
            this.cloudinaryServices.deleteFile(res.public_id!).catch((err) => {
              console.error(
                `Failed to delete Cloudinary image ${res.public_id}:`,
                err,
              );
              return null;
            }),
          );

        await Promise.all(cloudDeletions);
      }

      return numOfPostDelete;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deletePost(id: number, userId: number) {
    return withTransaction(async (tx) => {
      const post = await this.postRepository.findPostByUser(id, userId, tx);

      if (!post) {
        throw new BadRequestException("Post Not Found");
      }

      const resource = await this.resourcesRepository.findResourceByPost(
        post.id,
      );

      if (resource) {
        await this.resourcesRepository.deleteResource(resource.id, tx);
      }

      const postCount = await this.postRepository.hardDelete(post.id, tx);

      if (resource?.public_id) {
        await this.cloudinaryServices.deleteFile(resource.public_id);
      }

      return postCount;
    });
  }

  async likePost(postId: number, userId: number) {
    return withTransaction(async (tx) => {
      const post = await this.postRepository.findPostById(postId, tx);

      if (!post) {
        throw new BadRequestException("Post not found");
      }

      if (post.is_deleted) {
        throw new BadRequestException("The post has been move to the trash");
      }

      const isUserLikedPost = await this.postLikesRepository.findUserLikePost(
        userId,
        post.id,
        tx,
      );

      if (isUserLikedPost) {
        throw new BadRequestException("You have liked this post");
      }

      await this.postRepository.increasePostLike(post.id, tx);

      await this.postLikesRepository.create(post.id, userId, tx);
    });
  }

  async unlikePost(postId: number, userId: number) {
    return withTransaction(async (tx) => {
      const post = await this.postRepository.findPostById(postId, tx);

      if (!post) {
        throw new BadRequestException("Post not found");
      }

      if (post.is_deleted) {
        throw new BadRequestException("The post has been move to the trash");
      }

      const postLike = await this.postLikesRepository.findUserLikePost(
        userId,
        post.id,
      );

      if (!postLike) {
        throw new BadRequestException("You have not like this post yet");
      }

      await this.postRepository.decreasePostLike(post.id, tx);
      await this.postLikesRepository.remove(postLike.id, tx);
    });
  }
}
