class UpdateBookmarkUseCase {
  constructor(bookmarkRepository) {
    this.bookmarkRepository = bookmarkRepository;
  }

  async execute(id, data) {
    if (!id) throw new Error('Bookmark ID is required');
    return await this.bookmarkRepository.update(id, data);
  }
}

module.exports = UpdateBookmarkUseCase;
