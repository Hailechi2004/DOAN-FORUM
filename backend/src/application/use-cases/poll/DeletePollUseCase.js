class DeletePollUseCase {
  constructor(pollRepository) {
    this.pollRepository = pollRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Poll ID is required');
    return await this.pollRepository.delete(id);
  }
}

module.exports = DeletePollUseCase;
