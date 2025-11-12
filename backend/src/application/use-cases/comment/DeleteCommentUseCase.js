class DeleteCommentUseCase {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(id, user) {
    if (!id) {
      throw new Error("Comment ID is required");
    }

    const existing = await this.commentRepository.findById(id);
    if (!existing) {
      throw new Error("Comment not found");
    }

    // Check permissions
    if (
      existing.author_id !== user.id &&
      user.role !== "admin" &&
      user.role !== "manager"
    ) {
      throw new Error("You do not have permission to delete this comment");
    }

    return await this.commentRepository.delete(id, user.id);
  }
}

module.exports = DeleteCommentUseCase;
