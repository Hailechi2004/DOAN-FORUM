class GetAllReactionsUseCase {
  constructor(reactionRepository) {
    this.reactionRepository = reactionRepository;
  }

  async execute(filters = {}) {
    return await this.reactionRepository.getAll(filters);
  }
}

module.exports = GetAllReactionsUseCase;
