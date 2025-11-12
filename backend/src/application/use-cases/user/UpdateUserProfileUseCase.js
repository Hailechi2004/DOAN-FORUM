const User = require("../../../domain/entities/User");

class UpdateUserProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, profileData) {
    // Kiểm tra user tồn tại
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update profile
    await this.userRepository.updateProfile(userId, profileData);

    // Return updated user
    const updatedUser = await this.userRepository.findById(userId);
    return new User(updatedUser);
  }
}

module.exports = UpdateUserProfileUseCase;
