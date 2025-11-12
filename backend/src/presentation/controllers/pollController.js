const { ApiResponse } = require("../../utils/apiHelpers");
const container = require("../../container");
const Poll = require("../../models/Poll");

class PollController {
  constructor() {
    this.useCases = container.getPollUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getResults = this.getResults.bind(this);
    this.vote = this.vote.bind(this);
  }

  async create(req, res, next) {
    try {
      const poll = await this.useCases.createPoll.execute({
        ...req.body,
        created_by: req.user.id,
      });
      ApiResponse.success(res, poll, "Poll created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const polls = await this.useCases.getAllPolls.execute(req.query);
      ApiResponse.success(res, polls);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const poll = await this.useCases.getPollById.execute(req.params.id);
      ApiResponse.success(res, poll);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const poll = await this.useCases.updatePoll.execute(
        req.params.id,
        req.body
      );
      ApiResponse.success(res, poll, "Poll updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deletePoll.execute(req.params.id);
      ApiResponse.success(res, null, "Poll deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getResults(req, res, next) {
    try {
      const results = await Poll.getResults(req.params.id);
      ApiResponse.success(res, results);
    } catch (error) {
      next(error);
    }
  }

  async vote(req, res, next) {
    try {
      await Poll.vote(req.params.id, req.body);
      ApiResponse.success(res, null, "Vote recorded successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PollController();
