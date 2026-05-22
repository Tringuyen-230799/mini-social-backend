import { Request } from "express";
import { PostsService } from "./posts.service";
import { BadRequestException } from "~/shared/utils/error-exception";

export class PostsController {
  private postsService: PostsService;

  constructor() {
    this.postsService = new PostsService();
  }

  createPost = async (req: Request) => {
    if (!req.user) {
      throw new BadRequestException("Unauthorized");
    }

    const { content } = req.body;
    const files = req.files as Express.Multer.File[];
    const imagePaths = files
      ? files.map((file) => `${process.env.BASE_URL}/uploads/${file.filename}`)
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
  };

  getPost = async (req: Request) => {
    const postId = parseInt(req.params?.id as string);
    const post = await this.postsService.getPostById(postId);

    return post;
  };

  getAllPosts = async (req: Request) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;

    const result = await this.postsService.getAllPosts(limit, page);

    return result;
  };

  updatePost = async (req: Request) => {
    if (!req.user) {
      throw new BadRequestException("Unauthorized");
    }

    const postId = parseInt(req.params?.id as string);
    const { content } = req.body;

    const files = req.files as Express.Multer.File[];
    const imagePaths = files.map(
      (file) => `${process.env.BASE_URL}/uploads/${file.filename}`,
    );

    return await this.postsService.updatePost({
      content,
      newImages: imagePaths,
      id: postId,
      userId: req.user.userId
    });
  };
}
