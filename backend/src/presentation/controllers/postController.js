const { ApiResponse, ApiError } = require("../../utils/apiHelpers");
const container = require("../../container");
const ReactionModel = require("../../models/Reaction");
const NotificationModel = require("../../models/Notification");

class PostController {
  constructor() {
    this.useCases = container.getPostUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.react = this.react.bind(this);
    this.togglePin = this.togglePin.bind(this);
  }

  async create(req, res, next) {
    try {
      const {
        title,
        content,
        visibility,
        category_id,
        department_id,
        team_id,
      } = req.body;

      // Handle uploaded images
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = req.files.map((file) => `/uploads/posts/${file.filename}`);
      }

      const post = await this.useCases.createPost.execute({
        author_id: req.user.id,
        title,
        content,
        visibility,
        category_id,
        department_id,
        team_id,
        images: imageUrls, // Pass image URLs
      });

      ApiResponse.success(res, post, "Post created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, category_id, department_id, search } = req.query;

      const result = await this.useCases.getAllPosts.execute(
        {
          page,
          limit,
          category_id,
          department_id,
          search,
        },
        req.user.id
      );

      ApiResponse.paginated(res, result.posts, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const post = await this.useCases.getPostById.execute(id, req.user.id);

      ApiResponse.success(res, post);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, content, visibility } = req.body;

      const updatedPost = await this.useCases.updatePost.execute(
        id,
        { title, content, visibility },
        req.user
      );

      ApiResponse.success(res, updatedPost, "Post updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await this.useCases.deletePost.execute(id, req.user);

      ApiResponse.success(res, null, "Post deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async react(req, res, next) {
    try {
      const { id } = req.params;
      const { reaction_type } = req.body;

      const post = await this.useCases.getPostById.execute(id);

      const result = await ReactionModel.toggle(
        req.user.id,
        "post",
        id,
        reaction_type
      );

      // Create notification for post author
      if (result.action === "added" && post.author_id !== req.user.id) {
        await NotificationModel.create({
          user_id: post.author_id,
          actor_id: req.user.id,
          type: "post_reaction",
          target_type: "post",
          target_id: id,
          content: `reacted ${reaction_type} to your post`,
        });
      }

      ApiResponse.success(res, result, "Reaction updated");
    } catch (error) {
      next(error);
    }
  }

  async togglePin(req, res, next) {
    try {
      const { id } = req.params;

      const updatedPost = await this.useCases.togglePinPost.execute(
        id,
        req.user
      );

      ApiResponse.success(res, updatedPost, "Post pin status updated");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();
