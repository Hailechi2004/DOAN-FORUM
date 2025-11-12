class CreateMessageUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(data) {
    return await this.messageRepository.create(data);
  }
}

module.exports = CreateMessageUseCase;
