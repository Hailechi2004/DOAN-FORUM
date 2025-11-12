class UpdateCommentUseCase {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(id, data, user) {
    if (!id) {
      throw new Error("Comment ID is required");
    }

    // Check if exists
    const existing = await this.commentRepository.findById(id);
    if (!existing) {
      throw new Error("Comment not found");
    }

    // Check permissions
    if (existing.author_id !== user.id && user.role !== "admin") {
      throw new Error("You do not have permission to edit this comment");
    }

    if (data.content && data.content.trim().length === 0) {
      throw new Error("Content cannot be empty");
    }

    if (data.content && data.content.length > 2000) {
      throw new Error("Content is too long (max 2000 characters)");
    }

    return await this.commentRepository.update(id, data);
  }
}

module.exports = UpdateCommentUseCase;
