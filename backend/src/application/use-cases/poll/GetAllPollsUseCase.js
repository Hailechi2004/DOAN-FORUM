class GetAllPollsUseCase {
  constructor(pollRepository) {
    this.pollRepository = pollRepository;
  }

  async execute(filters = {}) {
    return await this.pollRepository.getAll(filters);
  }
}

module.exports = GetAllPollsUseCase;
