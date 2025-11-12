const container = require("../../container");
const { ApiError, ApiResponse } = require("../../utils/apiHelpers");

class ProjectController {
  constructor() {
    this.useCases = container.getProjectUseCases();
    this.projectRepository = container.getProjectRepository();
    // Bind methods
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.getMembers = this.getMembers.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  async getAll(req, res, next) {
    try {
      const { department_id, team_id, status, search, page, limit } = req.query;
      const result = await this.useCases.getAllProjects.execute({
        department_id,
        team_id,
        status,
        search,
        page,
        limit,
      });
      ApiResponse.paginated(
        res,
        result.projects,
        result.pagination,
        "Projects retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const project = await this.useCases.getProjectById.execute(id);
      ApiResponse.success(res, project, "Project retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req, res, next) {
    try {
      const { id } = req.params;
      const project = await this.useCases.getProjectById.execute(id);
      const members = await this.projectRepository.getMembers(id);
      ApiResponse.success(res, members, "Members retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const projectData = req.body;
      const project = await this.useCases.createProject.execute(projectData);
      ApiResponse.success(res, project, "Project created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const project = await this.useCases.updateProject.execute(id, req.body);
      ApiResponse.success(res, project, "Project updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const project = await this.useCases.getProjectById.execute(id);
      await this.projectRepository.delete(id);
      ApiResponse.success(res, null, "Project deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const { id } = req.params;
      const { user_id, role } = req.body;
      await this.projectRepository.addMember(id, user_id, role);
      ApiResponse.success(res, null, "Member added successfully");
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      const { id, userId } = req.params;
      await this.projectRepository.removeMember(id, userId);
      ApiResponse.success(res, null, "Member removed successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await this.projectRepository.updateStatus(id, status);
      const project = await this.useCases.getProjectById.execute(id);
      ApiResponse.success(res, project, "Status updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectController();
