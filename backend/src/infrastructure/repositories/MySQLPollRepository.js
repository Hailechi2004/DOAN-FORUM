const IPollRepository = require('../../domain/repositories/IPollRepository');
const Poll = require('../../domain/entities/Poll');
const PollModel = require('../../models/Poll');

class MySQLPollRepository extends IPollRepository {
  async create(data) {
    const result = await PollModel.create(data);
    return new Poll(result);
  }

  async findById(id) {
    const result = await PollModel.findById(id);
    return result ? new Poll(result) : null;
  }

  async getAll(filters = {}) {
    const result = await PollModel.getAll(filters);
    if (Array.isArray(result)) {
      return result.map(r => new Poll(r));
    }
    return result;
  }

  async update(id, data) {
    const result = await PollModel.update(id, data);
    return result ? new Poll(result) : null;
  }

  async delete(id) {
    return await PollModel.delete(id);
  }
}

module.exports = MySQLPollRepository;
