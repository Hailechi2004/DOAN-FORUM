class GetTeamByIdUseCase {
  constructor(teamRepository) {
    this.teamRepository = teamRepository;
  }

  async execute(id) {
    if (!id) {
      throw new Error('Team ID is required');
    }

    const team = await this.teamRepository.findById(id);

    if (!team) {
      throw new Error('Team not found');
    }

    return team;
  }
}

module.exports = GetTeamByIdUseCase;
