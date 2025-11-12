class CreateEventUseCase {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async execute(data) {
    return await this.eventRepository.create(data);
  }
}

module.exports = CreateEventUseCase;
