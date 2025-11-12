const { ApiResponse } = require("../../utils/apiHelpers");
const container = require("../../container");

class BookmarkController {
  constructor() {
    this.useCases = container.getBookmarkUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req, res, next) {
    try {
      // Convert resource_type + resource_id to post_id for legacy model
      const { resource_type, resource_id, ...otherData } = req.body;
      const bookmarkData = {
        ...otherData,
        post_id: resource_type === "post" ? resource_id : req.body.post_id,
        user_id: req.user.id,
      };

      const bookmark = await this.useCases.createBookmark.execute(bookmarkData);
      ApiResponse.success(res, bookmark, "Bookmark created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const bookmarks = await this.useCases.getAllBookmarks.execute({
        ...req.query,
        user_id: req.user.id,
      });
      ApiResponse.success(res, bookmarks);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const bookmark = await this.useCases.getBookmarkById.execute(
        req.params.id
      );
      ApiResponse.success(res, bookmark);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const bookmark = await this.useCases.updateBookmark.execute(
        req.params.id,
        req.body
      );
      ApiResponse.success(res, bookmark, "Bookmark updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deleteBookmark.execute(req.params.id);
      ApiResponse.success(res, null, "Bookmark deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookmarkController();
