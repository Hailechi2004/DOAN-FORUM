class GetAllCommentsUseCase {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(filters = {}, userId = null) {
    if (!filters.post_id) {
      throw new Error("Post ID is required");
    }

    return await this.commentRepository.getAll(filters, userId);
  }
}

module.exports = GetAllCommentsUseCase;
