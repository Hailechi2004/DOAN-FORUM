class UpdateNotificationUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(id, data) {
    if (!id) throw new Error('Notification ID is required');
    return await this.notificationRepository.update(id, data);
  }
}

module.exports = UpdateNotificationUseCase;
