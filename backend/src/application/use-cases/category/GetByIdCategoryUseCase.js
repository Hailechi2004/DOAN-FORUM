class GetCategoryByIdUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Category ID is required');
    const result = await this.categoryRepository.findById(id);
    if (!result) throw new Error('Category not found');
    return result;
  }
}

module.exports = GetCategoryByIdUseCase;
