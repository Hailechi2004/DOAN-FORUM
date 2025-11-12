class UpdateMeetingUseCase {
  constructor(meetingRepository) {
    this.meetingRepository = meetingRepository;
  }

  async execute(id, data) {
    if (!id) throw new Error('Meeting ID is required');
    return await this.meetingRepository.update(id, data);
  }
}

module.exports = UpdateMeetingUseCase;
