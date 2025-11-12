const ICategoryRepository = require('../../domain/repositories/ICategoryRepository');
const Category = require('../../domain/entities/Category');
const CategoryModel = require('../../models/Category');

class MySQLCategoryRepository extends ICategoryRepository {
  async create(data) {
    const result = await CategoryModel.create(data);
    return new Category(result);
  }

  async findById(id) {
    const result = await CategoryModel.findById(id);
    return result ? new Category(result) : null;
  }

  async getAll(filters = {}) {
    const result = await CategoryModel.getAll(filters);
    if (Array.isArray(result)) {
      return result.map(r => new Category(r));
    }
    return result;
  }

  async update(id, data) {
    const result = await CategoryModel.update(id, data);
    return result ? new Category(result) : null;
  }

  async delete(id) {
    return await CategoryModel.delete(id);
  }
}

module.exports = MySQLCategoryRepository;
