const IEventRepository = require('../../domain/repositories/IEventRepository');
const Event = require('../../domain/entities/Event');
const EventModel = require('../../models/Event');

class MySQLEventRepository extends IEventRepository {
  async create(data) {
    const result = await EventModel.create(data);
    return new Event(result);
  }

  async findById(id) {
    const result = await EventModel.findById(id);
    return result ? new Event(result) : null;
  }

  async getAll(filters = {}) {
    const result = await EventModel.getAll(filters);
    if (Array.isArray(result)) {
      return result.map(r => new Event(r));
    }
    return result;
  }

  async update(id, data) {
    const result = await EventModel.update(id, data);
    return result ? new Event(result) : null;
  }

  async delete(id) {
    return await EventModel.delete(id);
  }
}

module.exports = MySQLEventRepository;
