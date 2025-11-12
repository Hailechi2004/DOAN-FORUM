class GetAllPostsUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(filters = {}, userId = null) {
    // Validate pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;

    if (page < 1) {
      throw new Error("Page must be greater than 0");
    }

    if (limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    const offset = (page - 1) * limit;

    // Get posts
    const posts = await this.postRepository.getAll(
      {
        ...filters,
        limit,
        offset,
      },
      userId
    );

    // Get total count
    const total = await this.postRepository.getCount(filters);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = GetAllPostsUseCase;
