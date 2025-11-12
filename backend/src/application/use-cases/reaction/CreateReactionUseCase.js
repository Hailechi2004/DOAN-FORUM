class CreateReactionUseCase {
  constructor(reactionRepository) {
    this.reactionRepository = reactionRepository;
  }

  async execute(data) {
    return await this.reactionRepository.create(data);
  }
}

module.exports = CreateReactionUseCase;
