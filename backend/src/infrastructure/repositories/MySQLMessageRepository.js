const IMessageRepository = require('../../domain/repositories/IMessageRepository');
const Message = require('../../domain/entities/Message');
const MessageModel = require('../../models/Message');

class MySQLMessageRepository extends IMessageRepository {
  async create(data) {
    const result = await MessageModel.create(data);
    return new Message(result);
  }

  async findById(id) {
    const result = await MessageModel.findById(id);
    return result ? new Message(result) : null;
  }

  async getAll(filters = {}) {
    const result = await MessageModel.getAll(filters);
    if (Array.isArray(result)) {
      return result.map(r => new Message(r));
    }
    return result;
  }

  async update(id, data) {
    const result = await MessageModel.update(id, data);
    return result ? new Message(result) : null;
  }

  async delete(id) {
    return await MessageModel.delete(id);
  }
}

module.exports = MySQLMessageRepository;
