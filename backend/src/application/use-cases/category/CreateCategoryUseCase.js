class CreateCategoryUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(data) {
    return await this.categoryRepository.create(data);
  }
}

module.exports = CreateCategoryUseCase;
