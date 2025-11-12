const IFileRepository = require('../../domain/repositories/IFileRepository');
const File = require('../../domain/entities/File');
const FileModel = require('../../models/File');

class MySQLFileRepository extends IFileRepository {
  async create(data) {
    const result = await FileModel.create(data);
    return new File(result);
  }

  async findById(id) {
    const result = await FileModel.findById(id);
    return result ? new File(result) : null;
  }

  async getAll(filters = {}) {
    const result = await FileModel.getAll(filters);
    if (Array.isArray(result)) {
      return result.map(r => new File(r));
    }
    return result;
  }

  async update(id, data) {
    const result = await FileModel.update(id, data);
    return result ? new File(result) : null;
  }

  async delete(id) {
    return await FileModel.delete(id);
  }
}

module.exports = MySQLFileRepository;
