class GetAllTeamsUseCase {
  constructor(teamRepository) {
    this.teamRepository = teamRepository;
  }

  async execute(filters = {}) {
    return await this.teamRepository.getAll(filters);
  }
}

module.exports = GetAllTeamsUseCase;
