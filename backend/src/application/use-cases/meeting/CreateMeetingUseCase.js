class CreateMeetingUseCase {
  constructor(meetingRepository) {
    this.meetingRepository = meetingRepository;
  }

  async execute(data) {
    return await this.meetingRepository.create(data);
  }
}

module.exports = CreateMeetingUseCase;
