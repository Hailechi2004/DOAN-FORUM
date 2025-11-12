const container = require("../../container");
const { ApiError, ApiResponse } = require("../../utils/apiHelpers");

class TaskController {
  constructor() {
    this.useCases = container.getTaskUseCases();
    this.taskRepository = container.getTaskRepository();
    // Bind methods
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getComments = this.getComments.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.assignTo = this.assignTo.bind(this);
  }

  async getAll(req, res, next) {
    try {
      const {
        project_id,
        assigned_to,
        created_by,
        status,
        priority,
        search,
        page,
        limit,
      } = req.query;
      const result = await this.useCases.getAllTasks.execute({
        project_id,
        assigned_to,
        created_by,
        status,
        priority,
        search,
        page,
        limit,
      });
      ApiResponse.paginated(
        res,
        result.tasks,
        result.pagination,
        "Tasks retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const task = await this.useCases.getTaskById.execute(id);
      ApiResponse.success(res, task, "Task retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const taskData = {
        ...req.body,
        created_by: req.user.id,
      };
      const task = await this.useCases.createTask.execute(taskData);
      ApiResponse.success(res, task, "Task created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const task = await this.useCases.updateTask.execute(id, req.body);
      ApiResponse.success(res, task, "Task updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const task = await this.useCases.getTaskById.execute(id);
      await this.taskRepository.delete(id);
      ApiResponse.success(res, null, "Task deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getComments(req, res, next) {
    try {
      const { id } = req.params;
      const comments = await this.taskRepository.getComments(id);
      ApiResponse.success(res, comments, "Comments retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await this.taskRepository.updateStatus(id, status);
      const task = await this.useCases.getTaskById.execute(id);
      ApiResponse.success(res, task, "Status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async assignTo(req, res, next) {
    try {
      const { id } = req.params;
      const { user_id } = req.body;
      await this.taskRepository.assignTo(id, user_id);
      const task = await this.useCases.getTaskById.execute(id);
      ApiResponse.success(res, task, "Task assigned successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
