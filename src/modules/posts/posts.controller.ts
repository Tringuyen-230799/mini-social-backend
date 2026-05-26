import { Request } from "express";
import { PostsService } from "./posts.service";
import { BadRequestException } from "~/shared/utils/error-exception";
import cloudiary from "~/config/cloudiary";

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
    const file = req.file as Express.Multer.File;

    const post = await this.postsService.createPost(
      req.user.id,
      { content },
      file,
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
    const { content, oldImageIds: imgIds } = req.body;

    const file = req.file as Express.Multer.File;

    const oldImageIds = Array.isArray(imgIds)
      ? req.body.oldImageIds
      : req.body.oldImageIds?.split(",");

    return await this.postsService.updatePost(
      {
        content,
        id: postId,
        userId: req.user.id,
        oldImageIds,
      },
      file,
    );
  };
}
