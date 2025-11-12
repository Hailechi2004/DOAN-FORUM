class GetAllMeetingsUseCase {
  constructor(meetingRepository) {
    this.meetingRepository = meetingRepository;
  }

  async execute(filters = {}) {
    return await this.meetingRepository.getAll(filters);
  }
}

module.exports = GetAllMeetingsUseCase;
