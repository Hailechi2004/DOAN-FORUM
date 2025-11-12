class GetNotificationByIdUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Notification ID is required');
    const result = await this.notificationRepository.findById(id);
    if (!result) throw new Error('Notification not found');
    return result;
  }
}

module.exports = GetNotificationByIdUseCase;
