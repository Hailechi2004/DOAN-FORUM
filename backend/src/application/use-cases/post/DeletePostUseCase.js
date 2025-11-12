class DeletePostUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(id, user) {
    if (!id) {
      throw new Error("Post ID is required");
    }

    // Get existing post
    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new Error("Post not found");
    }

    // Check permissions
    if (!post.canBeDeletedBy(user)) {
      throw new Error("You do not have permission to delete this post");
    }

    // Soft delete
    await this.postRepository.softDelete(id, user.id);

    return true;
  }
}

module.exports = DeletePostUseCase;
