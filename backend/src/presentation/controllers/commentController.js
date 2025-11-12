const { ApiResponse, ApiError } = require("../../utils/apiHelpers");
const container = require("../../container");
const NotificationModel = require("../../models/Notification");

class CommentController {
  constructor() {
    this.useCases = container.getCommentUseCases();
    this.postUseCases = container.getPostUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getByPostId = this.getByPostId.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.react = this.react.bind(this);
  }

  async create(req, res, next) {
    try {
      const { post_id, content, parent_id } = req.body;

      // Check if post exists
      const post = await this.postUseCases.getPostById.execute(post_id);

      const comment = await this.useCases.createComment.execute(
        {
          post_id,
          author_id: req.user.id,
          parent_id: parent_id || null,
          content,
        },
        req.user.id
      );

      // Create notification for post author
      if (post.author_id !== req.user.id) {
        await NotificationModel.create({
          user_id: post.author_id,
          actor_id: req.user.id,
          type: "comment",
          target_type: "post",
          target_id: post_id,
          content: parent_id
            ? "replied to your comment"
            : "commented on your post",
        });
      }

      ApiResponse.success(res, comment, "Comment created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getByPostId(req, res, next) {
    try {
      const post_id = req.params.post_id || req.query.post_id;

      if (!post_id) {
        throw new ApiError(400, "Post ID is required");
      }

      const comments = await this.useCases.getAllComments.execute(
        { post_id },
        req.user?.id
      );

      ApiResponse.success(res, comments);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const updatedComment = await this.useCases.updateComment.execute(
        id,
        { content },
        req.user
      );

      ApiResponse.success(res, updatedComment, "Comment updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await this.useCases.deleteComment.execute(id, req.user);

      ApiResponse.success(res, null, "Comment deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async react(req, res, next) {
    try {
      // TODO: Implement reaction to comment (similar to post reaction)
      ApiResponse.success(res, null, "Not implemented yet");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
