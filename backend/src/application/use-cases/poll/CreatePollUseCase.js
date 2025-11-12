class CreatePollUseCase {
  constructor(pollRepository) {
    this.pollRepository = pollRepository;
  }

  async execute(data) {
    return await this.pollRepository.create(data);
  }
}

module.exports = CreatePollUseCase;
