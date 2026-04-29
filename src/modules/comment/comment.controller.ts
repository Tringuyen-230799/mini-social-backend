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

    if (!postId) {
      throw new Error("Post ID is required");
    }

    const comments = await this.commentService.getCommentsByPost(
      Number(postId),
      cursor as string,
    );

    return comments;
  }

  async createComments(req: Request) {
    const { postId, content, parentId, replyUserId } = req.body;

    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const userId = req.user.userId;

    const post = await this.commentService.createComment(
      postId,
      userId,
      content,
      replyUserId,
      parentId,
    );

    return post;
  }
}
