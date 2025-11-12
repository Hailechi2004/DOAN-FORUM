class GetBookmarkByIdUseCase {
  constructor(bookmarkRepository) {
    this.bookmarkRepository = bookmarkRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Bookmark ID is required');
    const result = await this.bookmarkRepository.findById(id);
    if (!result) throw new Error('Bookmark not found');
    return result;
  }
}

module.exports = GetBookmarkByIdUseCase;
