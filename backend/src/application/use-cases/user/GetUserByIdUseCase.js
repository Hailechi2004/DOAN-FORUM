const User = require("../../../domain/entities/User");

class GetUserByIdUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return new User(user);
  }
}

module.exports = GetUserByIdUseCase;
