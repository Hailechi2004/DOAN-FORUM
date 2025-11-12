const { ApiResponse, ApiError } = require("../../utils/apiHelpers");
const container = require("../../container");
const Team = require("../../models/Team");

class TeamController {
  constructor() {
    this.useCases = container.getTeamUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getMembers = this.getMembers.bind(this);
    this.getStats = this.getStats.bind(this);
    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.updateMemberRole = this.updateMemberRole.bind(this);
  }

  async create(req, res, next) {
    try {
      const team = await this.useCases.createTeam.execute(req.body);
      ApiResponse.success(res, team, "Team created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await this.useCases.getAllTeams.execute(req.query);
      ApiResponse.paginated(res, result.teams, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const team = await this.useCases.getTeamById.execute(req.params.id);
      ApiResponse.success(res, team);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const team = await this.useCases.updateTeam.execute(
        req.params.id,
        req.body
      );
      ApiResponse.success(res, team, "Team updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deleteTeam.execute(req.params.id);
      ApiResponse.success(res, null, "Team deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req, res, next) {
    try {
      const members = await Team.getMembers(req.params.id);
      ApiResponse.success(res, members);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await Team.getStats(req.params.id);
      ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      await Team.addMember(req.params.id, req.body);
      ApiResponse.success(res, null, "Member added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      await Team.removeMember(req.params.id, req.params.userId);
      ApiResponse.success(res, null, "Member removed successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req, res, next) {
    try {
      await Team.updateMemberRole(
        req.params.id,
        req.params.userId,
        req.body.role
      );
      ApiResponse.success(res, null, "Member role updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeamController();
