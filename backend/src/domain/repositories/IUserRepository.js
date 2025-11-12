/**
 * Interface for User Repository
 * Định nghĩa contract cho tất cả operations liên quan đến User
 */
class IUserRepository {
  async create(userData) {
    throw new Error("Method 'create' must be implemented");
  }

  async findById(id) {
    throw new Error("Method 'findById' must be implemented");
  }

  async findByEmail(email) {
    throw new Error("Method 'findByEmail' must be implemented");
  }

  async findByUsername(username) {
    throw new Error("Method 'findByUsername' must be implemented");
  }

  async updateOnlineStatus(userId, isOnline) {
    throw new Error("Method 'updateOnlineStatus' must be implemented");
  }

  async updateProfile(userId, profileData) {
    throw new Error("Method 'updateProfile' must be implemented");
  }

  async getAll(filters) {
    throw new Error("Method 'getAll' must be implemented");
  }

  async update(userId, data) {
    throw new Error("Method 'update' must be implemented");
  }

  async delete(userId) {
    throw new Error("Method 'delete' must be implemented");
  }

  async search(searchTerm, filters) {
    throw new Error("Method 'search' must be implemented");
  }
}

module.exports = IUserRepository;
