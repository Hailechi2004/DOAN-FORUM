class GetAllNotificationsUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(filters = {}) {
    return await this.notificationRepository.getAll(filters);
  }
}

module.exports = GetAllNotificationsUseCase;
