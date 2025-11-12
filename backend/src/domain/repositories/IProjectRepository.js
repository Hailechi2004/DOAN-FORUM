/**
 * Interface for Project Repository
 */
class IProjectRepository {
  async create(projectData) {
    throw new Error("Method 'create' must be implemented");
  }

  async findById(id) {
    throw new Error("Method 'findById' must be implemented");
  }

  async getAll(filters) {
    throw new Error("Method 'getAll' must be implemented");
  }

  async update(id, data) {
    throw new Error("Method 'update' must be implemented");
  }

  async delete(id) {
    throw new Error("Method 'delete' must be implemented");
  }

  async addMember(projectId, userId, role) {
    throw new Error("Method 'addMember' must be implemented");
  }

  async removeMember(projectId, userId) {
    throw new Error("Method 'removeMember' must be implemented");
  }

  async getMembers(projectId) {
    throw new Error("Method 'getMembers' must be implemented");
  }

  async updateStatus(projectId, status) {
    throw new Error("Method 'updateStatus' must be implemented");
  }
}

module.exports = IProjectRepository;
