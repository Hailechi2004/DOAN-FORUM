class GetEventByIdUseCase {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Event ID is required');
    const result = await this.eventRepository.findById(id);
    if (!result) throw new Error('Event not found');
    return result;
  }
}

module.exports = GetEventByIdUseCase;
