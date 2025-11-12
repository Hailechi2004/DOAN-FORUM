class UpdateMessageUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(id, data) {
    if (!id) throw new Error('Message ID is required');
    return await this.messageRepository.update(id, data);
  }
}

module.exports = UpdateMessageUseCase;
