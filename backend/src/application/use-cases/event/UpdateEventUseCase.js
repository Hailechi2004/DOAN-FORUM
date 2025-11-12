class UpdateEventUseCase {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async execute(id, data) {
    if (!id) throw new Error('Event ID is required');
    return await this.eventRepository.update(id, data);
  }
}

module.exports = UpdateEventUseCase;
