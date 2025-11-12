const { ApiResponse, ApiError } = require("../../utils/apiHelpers");
const container = require("../../container");
const File = require("../../models/File");

class FileController {
  constructor() {
    this.useCases = container.getFileUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.upload = this.upload.bind(this);
    this.download = this.download.bind(this);
  }

  async create(req, res, next) {
    try {
      const file = await this.useCases.createFile.execute(req.body);
      ApiResponse.success(res, file, "File created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const files = await this.useCases.getAllFiles.execute(req.query);
      ApiResponse.success(res, files);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const file = await this.useCases.getFileById.execute(req.params.id);
      ApiResponse.success(res, file);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const file = await this.useCases.updateFile.execute(
        req.params.id,
        req.body
      );
      ApiResponse.success(res, file, "File updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deleteFile.execute(req.params.id);
      ApiResponse.success(res, null, "File deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async upload(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError(400, "No file uploaded");
      }

      const { related_type, related_id } = req.body;

      const fileData = {
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        uploader_id: req.user.id,
        related_type,
        related_id,
      };

      const file = await File.create(fileData);

      ApiResponse.success(res, file, "File uploaded successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async download(req, res, next) {
    try {
      const { id } = req.params;
      const file = await File.findById(id);

      if (!file) {
        throw new ApiError(404, "File not found");
      }

      // Increment download count
      await File.incrementDownload(id);

      // Send file
      res.download(file.file_path, file.original_name);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileController();
