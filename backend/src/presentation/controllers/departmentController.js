const { ApiResponse, ApiError } = require("../../utils/apiHelpers");
const container = require("../../container");
const Department = require("../../models/Department");

class DepartmentController {
  constructor() {
    this.useCases = container.getDepartmentUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getMembers = this.getMembers.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  async create(req, res, next) {
    try {
      const department = await this.useCases.createDepartment.execute(req.body);
      ApiResponse.success(
        res,
        department,
        "Department created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const departments = await this.useCases.getAllDepartments.execute(
        req.query
      );
      ApiResponse.success(res, departments);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const department = await this.useCases.getDepartmentById.execute(
        req.params.id
      );
      ApiResponse.success(res, department);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const department = await this.useCases.updateDepartment.execute(
        req.params.id,
        req.body
      );
      ApiResponse.success(res, department, "Department updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deleteDepartment.execute(req.params.id);
      ApiResponse.success(res, null, "Department deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req, res, next) {
    try {
      const members = await Department.getMembers(req.params.id);
      ApiResponse.success(res, members);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await Department.getStats(req.params.id);
      ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepartmentController();
