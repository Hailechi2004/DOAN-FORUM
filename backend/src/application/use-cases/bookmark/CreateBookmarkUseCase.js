class CreateBookmarkUseCase {
  constructor(bookmarkRepository) {
    this.bookmarkRepository = bookmarkRepository;
  }

  async execute(data) {
    return await this.bookmarkRepository.create(data);
  }
}

module.exports = CreateBookmarkUseCase;
