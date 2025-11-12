class DeleteMessageUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Message ID is required');
    return await this.messageRepository.delete(id);
  }
}

module.exports = DeleteMessageUseCase;
