class GetAllEventsUseCase {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async execute(filters = {}) {
    return await this.eventRepository.getAll(filters);
  }
}

module.exports = GetAllEventsUseCase;
