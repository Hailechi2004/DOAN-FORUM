class DeleteTeamUseCase {
  constructor(teamRepository) {
    this.teamRepository = teamRepository;
  }

  async execute(id) {
    if (!id) {
      throw new Error('Team ID is required');
    }

    const existing = await this.teamRepository.findById(id);
    if (!existing) {
      throw new Error('Team not found');
    }

    return await this.teamRepository.delete(id);
  }
}

module.exports = DeleteTeamUseCase;
