class CreatePostUseCase {
  constructor(postRepository, db) {
    this.postRepository = postRepository;
    this.db = db;
  }

  async execute(postData) {
    // Validate required fields
    if (!postData.author_id) {
      throw new Error("Author ID is required");
    }

    if (!postData.title || postData.title.trim().length === 0) {
      throw new Error("Title is required");
    }

    if (postData.title.length > 255) {
      throw new Error("Title is too long (max 255 characters)");
    }

    if (!postData.content || postData.content.trim().length === 0) {
      throw new Error("Content is required");
    }

    // Validate visibility
    const validVisibilities = ["company", "department", "team", "private"];
    if (
      postData.visibility &&
      !validVisibilities.includes(postData.visibility)
    ) {
      throw new Error("Invalid visibility value");
    }

    // Create post
    const post = await this.postRepository.create({
      author_id: postData.author_id,
      title: postData.title.trim(),
      content: postData.content.trim(),
      visibility: postData.visibility || "company",
      category_id: postData.category_id || null,
      department_id: postData.department_id || null,
      team_id: postData.team_id || null,
      allowed_group_id: postData.allowed_group_id || null,
    });

    // Handle image attachments
    if (postData.images && postData.images.length > 0) {
      for (let i = 0; i < postData.images.length; i++) {
        const imagePath = postData.images[i];
        const fileName = imagePath.split("/").pop();

        // Insert into files table
        const [fileResult] = await this.db.execute(
          `INSERT INTO files (uploader_id, storage_path, original_name, mime_type, size_bytes, is_private, created_at)
           VALUES (?, ?, ?, 'image/jpeg', 0, 0, NOW())`,
          [postData.author_id, imagePath, fileName]
        );

        // Insert into post_attachments table
        await this.db.execute(
          `INSERT INTO post_attachments (post_id, file_id, attachment_type, sort_order)
           VALUES (?, ?, 'image', ?)`,
          [post.id, fileResult.insertId, i]
        );
      }
    }

    return post;
  }
}

module.exports = CreatePostUseCase;
