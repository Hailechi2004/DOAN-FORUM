class GetPollByIdUseCase {
  constructor(pollRepository) {
    this.pollRepository = pollRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Poll ID is required');
    const result = await this.pollRepository.findById(id);
    if (!result) throw new Error('Poll not found');
    return result;
  }
}

module.exports = GetPollByIdUseCase;
