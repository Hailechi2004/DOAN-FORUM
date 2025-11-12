class UpdatePostUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(id, updateData, user) {
    if (!id) {
      throw new Error("Post ID is required");
    }

    // Get existing post
    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new Error("Post not found");
    }

    // Check permissions
    if (!post.canBeEditedBy(user)) {
      throw new Error("You do not have permission to edit this post");
    }

    // Validate update data
    if (updateData.title !== undefined) {
      if (updateData.title.trim().length === 0) {
        throw new Error("Title cannot be empty");
      }
      if (updateData.title.length > 255) {
        throw new Error("Title is too long (max 255 characters)");
      }
    }

    if (updateData.content !== undefined) {
      if (updateData.content.trim().length === 0) {
        throw new Error("Content cannot be empty");
      }
    }

    if (updateData.visibility !== undefined) {
      const validVisibilities = ["company", "department", "team", "private"];
      if (!validVisibilities.includes(updateData.visibility)) {
        throw new Error("Invalid visibility value");
      }
    }

    // Update post
    const updatedPost = await this.postRepository.update(id, updateData);

    return updatedPost;
  }
}

module.exports = UpdatePostUseCase;
