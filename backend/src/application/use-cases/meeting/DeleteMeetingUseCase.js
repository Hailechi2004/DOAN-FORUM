class DeleteMeetingUseCase {
  constructor(meetingRepository) {
    this.meetingRepository = meetingRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Meeting ID is required');
    return await this.meetingRepository.delete(id);
  }
}

module.exports = DeleteMeetingUseCase;
