import { Request } from "express";
import { CommentServices } from "./comment.service";

export class CommentController {
  private commentService: CommentServices;
  constructor() {
    this.commentService = new CommentServices();
  }

  async getCommentsByPost(req: Request) {
    const { postId } = req.params;
    const { cursor } = req.query;

    if (!postId || isNaN(Number(postId))) {
      throw new Error("Post ID is required");
    }

    const comments = await this.commentService.getCommentsByPost(
      Number(postId),
      cursor as string,
    );

    return comments;
  }

  async createComments(req: Request) {
    const { postId, content, parentId } = req.body;

    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const userId = req.user.userId;

    const post = await this.commentService.createComment(
      postId,
      userId,
      content,
      parentId,
    );

    return post;
  }

  async getRepliesByComment(req: Request) {
    const { commentId } = req.params;

    const { page = 1, limit = 5 } = req.query;

    if (!commentId || isNaN(Number(commentId))) {
      throw new Error("Comment ID is required");
    }

    const replies = await this.commentService.getRepliesByComment(
      Number(commentId),
      Number(page),
      Number(limit),
    );

    return replies;
  }
}
