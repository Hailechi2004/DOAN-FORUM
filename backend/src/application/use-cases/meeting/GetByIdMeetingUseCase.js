class GetMeetingByIdUseCase {
  constructor(meetingRepository) {
    this.meetingRepository = meetingRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Meeting ID is required');
    const result = await this.meetingRepository.findById(id);
    if (!result) throw new Error('Meeting not found');
    return result;
  }
}

module.exports = GetMeetingByIdUseCase;
