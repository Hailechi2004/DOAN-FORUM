class CreateCommentUseCase {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(data, userId = null) {
    // Validate required fields
    if (!data.post_id) {
      throw new Error("Post ID is required");
    }

    if (!data.author_id) {
      throw new Error("Author ID is required");
    }

    if (!data.content || data.content.trim().length === 0) {
      throw new Error("Content is required");
    }

    if (data.content.length > 2000) {
      throw new Error("Content is too long (max 2000 characters)");
    }

    return await this.commentRepository.create(
      {
        post_id: data.post_id,
        author_id: data.author_id,
        parent_id: data.parent_id || null,
        content: data.content.trim(),
        path: "",
      },
      userId
    );
  }
}

module.exports = CreateCommentUseCase;
