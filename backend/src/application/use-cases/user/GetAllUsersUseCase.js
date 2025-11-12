const User = require("../../../domain/entities/User");

class GetAllUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(filters = {}) {
    const result = await this.userRepository.getAll(filters);

    return {
      users: result.users.map((u) => new User(u)),
      pagination: result.pagination,
    };
  }
}

module.exports = GetAllUsersUseCase;
