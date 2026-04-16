import { Request } from "express";
import { PostsService } from "./posts.service";
import {
  BadRequestException,
  InternalException,
} from "~/shared/utils/error-exception";

export class PostsController {
  private postsService: PostsService;

  constructor() {
    this.postsService = new PostsService();
  }

  createPost = async (req: Request) => {
    try {
      if (!req.user) {
        throw new BadRequestException("Unauthorized");
      }

      const { content } = req.body;
      const files = req.files as Express.Multer.File[];
      const imagePaths = files
        ? files.map((file) => `/uploads/${file.filename}`)
        : [];

      const post = await this.postsService.createPost(
        req.user.userId,
        { content },
        imagePaths,
      );

      return {
        success: true,
        message: "Post created successfully",
        data: post,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new InternalException("Internal server error");
    }
  };

  getPost = async (req: Request) => {
    try {
      const postId = parseInt(req.params?.id as string);
      const post = await this.postsService.getPostById(postId);

      return {
        success: true,
        data: post,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new InternalException("Internal server error");
    }
  };

  getAllPosts = async (req: Request) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const page = parseInt(req.query.page as string) || 1;

      const result = await this.postsService.getAllPosts(limit, page);

      return result;
    } catch (error) {
      throw new InternalException("Internal server error");
    }
  };
}
