class UpdateCategoryUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id, data) {
    if (!id) throw new Error('Category ID is required');
    return await this.categoryRepository.update(id, data);
  }
}

module.exports = UpdateCategoryUseCase;
