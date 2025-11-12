const IBookmarkRepository = require("../../domain/repositories/IBookmarkRepository");
const Bookmark = require("../../domain/entities/Bookmark");
const BookmarkModel = require("../../models/Bookmark");

class MySQLBookmarkRepository extends IBookmarkRepository {
  async create(data) {
    const { user_id, ...bookmarkData } = data;
    const result = await BookmarkModel.create(user_id, bookmarkData);
    return new Bookmark(result);
  }

  async findById(id) {
    const result = await BookmarkModel.findById(id);
    return result ? new Bookmark(result) : null;
  }

  async getAll(filters = {}) {
    const { user_id, ...otherFilters } = filters;
    if (!user_id) {
      throw new Error("user_id is required");
    }
    const result = await BookmarkModel.getAll(user_id, otherFilters);
    if (Array.isArray(result)) {
      return result.map((r) => new Bookmark(r));
    }
    return result;
  }

  async update(id, data) {
    const result = await BookmarkModel.update(id, data);
    return result ? new Bookmark(result) : null;
  }

  async delete(id) {
    return await BookmarkModel.delete(id);
  }
}

module.exports = MySQLBookmarkRepository;
