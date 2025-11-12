class GetPostByIdUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(id, userId = null) {
    if (!id) {
      throw new Error("Post ID is required");
    }

    const post = await this.postRepository.findById(id, userId);

    if (!post) {
      throw new Error("Post not found");
    }

    // Increment view count if userId provided
    if (userId) {
      await this.postRepository.incrementViewCount(id, userId);
    }

    return post;
  }
}

module.exports = GetPostByIdUseCase;
