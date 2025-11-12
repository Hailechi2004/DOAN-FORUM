class GetMessageByIdUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Message ID is required');
    const result = await this.messageRepository.findById(id);
    if (!result) throw new Error('Message not found');
    return result;
  }
}

module.exports = GetMessageByIdUseCase;
