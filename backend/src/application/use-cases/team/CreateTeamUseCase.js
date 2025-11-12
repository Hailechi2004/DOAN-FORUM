class CreateTeamUseCase {
  constructor(teamRepository) {
    this.teamRepository = teamRepository;
  }

  async execute(data) {
    // TODO: Add validation logic
    return await this.teamRepository.create(data);
  }
}

module.exports = CreateTeamUseCase;
