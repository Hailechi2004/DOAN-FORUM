class DeleteCategoryUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Category ID is required');
    return await this.categoryRepository.delete(id);
  }
}

module.exports = DeleteCategoryUseCase;
