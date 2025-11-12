const { ApiResponse } = require("../../utils/apiHelpers");
const container = require("../../container");

class CategoryController {
  constructor() {
    this.useCases = container.getCategoryUseCases();
    
    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req, res, next) {
    try {
      const category = await this.useCases.createCategory.execute(req.body);
      ApiResponse.success(res, category, "Category created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const categorys = await this.useCases.getAllCategorys.execute(req.query);
      ApiResponse.success(res, categorys);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await this.useCases.getCategoryById.execute(req.params.id);
      ApiResponse.success(res, category);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const category = await this.useCases.updateCategory.execute(
        req.params.id,
        req.body
      );
      ApiResponse.success(res, category, "Category updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deleteCategory.execute(req.params.id);
      ApiResponse.success(res, null, "Category deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
