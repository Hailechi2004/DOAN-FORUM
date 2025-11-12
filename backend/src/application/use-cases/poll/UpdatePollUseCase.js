class UpdatePollUseCase {
  constructor(pollRepository) {
    this.pollRepository = pollRepository;
  }

  async execute(id, data) {
    if (!id) throw new Error('Poll ID is required');
    return await this.pollRepository.update(id, data);
  }
}

module.exports = UpdatePollUseCase;
