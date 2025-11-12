class DeleteReactionUseCase {
  constructor(reactionRepository) {
    this.reactionRepository = reactionRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Reaction ID is required');
    return await this.reactionRepository.delete(id);
  }
}

module.exports = DeleteReactionUseCase;
