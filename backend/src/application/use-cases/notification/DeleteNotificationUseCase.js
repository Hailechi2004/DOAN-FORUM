class DeleteNotificationUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Notification ID is required');
    return await this.notificationRepository.delete(id);
  }
}

module.exports = DeleteNotificationUseCase;
