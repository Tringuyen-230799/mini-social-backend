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
      userId,
      postId,
      content,
      parentId,
    );

    return post;
  }
}
