class CreateNotificationUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(data) {
    return await this.notificationRepository.create(data);
  }
}

module.exports = CreateNotificationUseCase;
