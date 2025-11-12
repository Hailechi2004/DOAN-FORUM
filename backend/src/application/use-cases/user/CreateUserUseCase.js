const User = require("../../../domain/entities/User");

class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
    // Validate email không trùng
    const existingEmail = await this.userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Validate username không trùng
    const existingUsername = await this.userRepository.findByUsername(
      userData.username
    );
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    // Create user
    const userId = await this.userRepository.create(userData);
    const user = await this.userRepository.findById(userId);

    return new User(user);
  }
}

module.exports = CreateUserUseCase;
