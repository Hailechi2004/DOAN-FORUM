class GetAllMessagesUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(filters = {}) {
    return await this.messageRepository.getAll(filters);
  }
}

module.exports = GetAllMessagesUseCase;
