const IMeetingRepository = require('../../domain/repositories/IMeetingRepository');
const Meeting = require('../../domain/entities/Meeting');
const MeetingModel = require('../../models/Meeting');

class MySQLMeetingRepository extends IMeetingRepository {
  async create(data) {
    const result = await MeetingModel.create(data);
    return new Meeting(result);
  }

  async findById(id) {
    const result = await MeetingModel.findById(id);
    return result ? new Meeting(result) : null;
  }

  async getAll(filters = {}) {
    const result = await MeetingModel.getAll(filters);
    if (Array.isArray(result)) {
      return result.map(r => new Meeting(r));
    }
    return result;
  }

  async update(id, data) {
    const result = await MeetingModel.update(id, data);
    return result ? new Meeting(result) : null;
  }

  async delete(id) {
    return await MeetingModel.delete(id);
  }
}

module.exports = MySQLMeetingRepository;
