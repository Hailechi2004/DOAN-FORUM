class DeleteBookmarkUseCase {
  constructor(bookmarkRepository) {
    this.bookmarkRepository = bookmarkRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Bookmark ID is required');
    return await this.bookmarkRepository.delete(id);
  }
}

module.exports = DeleteBookmarkUseCase;
