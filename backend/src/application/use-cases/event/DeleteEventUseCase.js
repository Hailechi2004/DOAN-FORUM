class DeleteEventUseCase {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Event ID is required');
    return await this.eventRepository.delete(id);
  }
}

module.exports = DeleteEventUseCase;
