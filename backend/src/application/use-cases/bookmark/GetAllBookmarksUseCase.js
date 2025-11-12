class GetAllBookmarksUseCase {
  constructor(bookmarkRepository) {
    this.bookmarkRepository = bookmarkRepository;
  }

  async execute(filters = {}) {
    return await this.bookmarkRepository.getAll(filters);
  }
}

module.exports = GetAllBookmarksUseCase;
