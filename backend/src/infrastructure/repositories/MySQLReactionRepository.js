const IReactionRepository = require('../../domain/repositories/IReactionRepository');
const Reaction = require('../../domain/entities/Reaction');
const ReactionModel = require('../../models/Reaction');

class MySQLReactionRepository extends IReactionRepository {
  async create(data) {
    const result = await ReactionModel.create(data);
    return new Reaction(result);
  }

  async findById(id) {
    const result = await ReactionModel.findById(id);
    return result ? new Reaction(result) : null;
  }

  async getAll(filters = {}) {
    const result = await ReactionModel.getAll(filters);
    if (Array.isArray(result)) {
      return result.map(r => new Reaction(r));
    }
    return result;
  }

  async update(id, data) {
    const result = await ReactionModel.update(id, data);
    return result ? new Reaction(result) : null;
  }

  async delete(id) {
    return await ReactionModel.delete(id);
  }
}

module.exports = MySQLReactionRepository;
