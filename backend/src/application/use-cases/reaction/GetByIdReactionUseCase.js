class GetReactionByIdUseCase {
  constructor(reactionRepository) {
    this.reactionRepository = reactionRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Reaction ID is required');
    const result = await this.reactionRepository.findById(id);
    if (!result) throw new Error('Reaction not found');
    return result;
  }
}

module.exports = GetReactionByIdUseCase;
