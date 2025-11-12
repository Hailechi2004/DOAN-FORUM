/**
 * Interface for Task Repository
 */
class ITaskRepository {
  async create(taskData) {
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

  async updateStatus(taskId, status) {
    throw new Error("Method 'updateStatus' must be implemented");
  }

  async assignTo(taskId, userId) {
    throw new Error("Method 'assignTo' must be implemented");
  }

  async getComments(taskId) {
    throw new Error("Method 'getComments' must be implemented");
  }
}

module.exports = ITaskRepository;
