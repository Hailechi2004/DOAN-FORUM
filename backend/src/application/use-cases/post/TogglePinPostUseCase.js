class TogglePinPostUseCase {
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
    if (!post.canBePinnedBy(user)) {
      throw new Error("You do not have permission to pin/unpin posts");
    }

    // Toggle pin
    const updatedPost = await this.postRepository.togglePin(id, user.id);

    return updatedPost;
  }
}

module.exports = TogglePinPostUseCase;
