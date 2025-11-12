class IPostRepository {
  async create(postData) {
    throw new Error("Method create() must be implemented");
  }

  async findById(id, userId = null) {
    throw new Error("Method findById() must be implemented");
  }

  async getAll(filters = {}, userId = null) {
    throw new Error("Method getAll() must be implemented");
  }

  async update(id, updateData) {
    throw new Error("Method update() must be implemented");
  }

  async softDelete(id, deletedBy) {
    throw new Error("Method softDelete() must be implemented");
  }

  async togglePin(id, pinnedBy) {
    throw new Error("Method togglePin() must be implemented");
  }

  async incrementViewCount(postId, userId) {
    throw new Error("Method incrementViewCount() must be implemented");
  }

  async getCount(filters = {}) {
    throw new Error("Method getCount() must be implemented");
  }
}

module.exports = IPostRepository;
