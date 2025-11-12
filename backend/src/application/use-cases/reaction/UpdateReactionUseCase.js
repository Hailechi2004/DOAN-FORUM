class UpdateReactionUseCase {
  constructor(reactionRepository) {
    this.reactionRepository = reactionRepository;
  }

  async execute(id, data) {
    if (!id) throw new Error('Reaction ID is required');
    return await this.reactionRepository.update(id, data);
  }
}

module.exports = UpdateReactionUseCase;
