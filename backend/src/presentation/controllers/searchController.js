const Search = require("../../models/Search");
const { ApiError, ApiResponse } = require("../../utils/apiHelpers");

class SearchController {
  async globalSearch(req, res, next) {
    try {
      const { q, type, limit } = req.query;

      if (!q || q.trim().length < 2) {
        throw new ApiError(400, "Search query must be at least 2 characters");
      }

      const results = await Search.globalSearch(q, { type, limit });
      ApiResponse.success(res, results, "Search completed successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController();
