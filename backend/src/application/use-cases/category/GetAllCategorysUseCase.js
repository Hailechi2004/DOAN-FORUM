class GetAllCategorysUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(filters = {}) {
    return await this.categoryRepository.getAll(filters);
  }
}

module.exports = GetAllCategorysUseCase;
