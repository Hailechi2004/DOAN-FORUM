class UpdateTeamUseCase {
  constructor(teamRepository) {
    this.teamRepository = teamRepository;
  }

  async execute(id, data) {
    if (!id) {
      throw new Error('Team ID is required');
    }

    // Check if exists
    const existing = await this.teamRepository.findById(id);
    if (!existing) {
      throw new Error('Team not found');
    }

    return await this.teamRepository.update(id, data);
  }
}

module.exports = UpdateTeamUseCase;
