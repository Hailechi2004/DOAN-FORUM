const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams để lấy :projectId từ parent router
const { body } = require("express-validator");
const validate = require("../../utils/validator");
const authenticate = require("../middleware/authenticate");
const upload = require("../../config/upload");
const path = require("path");
const fs = require("fs");
const {
  ProjectTasksRepository,
  ProjectMilestonesRepository,
  ProjectCommentsRepository,
  ProjectFilesRepository,
  ProjectActivityLogsRepository,
} = require("../../infrastructure/repositories/ProjectExtensionsRepository");
const { ApiResponse } = require("../../utils/apiHelpers");

// ================== TASKS ==================

// Get all tasks for a project
router.get("/tasks", authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, assigned_to, priority } = req.query;
    const tasks = await ProjectTasksRepository.getProjectTasks(projectId, {
      status,
      assigned_to,
      priority,
    });
    ApiResponse.success(res, tasks, "Tasks retrieved successfully");
  } catch (error) {
    next(error);
  }
});

// Create task
router.post(
  "/tasks",
  authenticate,
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("assigned_to").optional().isInt(),
    body("status")
      .optional()
      .isIn(["todo", "in_progress", "review", "completed", "blocked"]),
    body("priority").optional().isIn(["low", "medium", "high", "critical"]),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const task = await ProjectTasksRepository.createTask(projectId, {
        ...req.body,
        created_by: req.user.id,
      });

      // Log activity
      await ProjectActivityLogsRepository.logActivity(projectId, req.user.id, {
        action: "create",
        entity_type: "task",
        entity_id: task.id,
        description: `Created task: ${task.title}`,
      });

      ApiResponse.success(res, task, "Task created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
);

// Update task
router.put("/tasks/:taskId", authenticate, async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    await ProjectTasksRepository.updateTask(taskId, req.body);
    const task = await ProjectTasksRepository.getTaskById(taskId);

    // Log activity
    await ProjectActivityLogsRepository.logActivity(projectId, req.user.id, {
      action: "update",
      entity_type: "task",
      entity_id: taskId,
      description: `Updated task: ${task.title}`,
    });

    ApiResponse.success(res, task, "Task updated successfully");
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete("/tasks/:taskId", authenticate, async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const task = await ProjectTasksRepository.getTaskById(taskId);
    await ProjectTasksRepository.deleteTask(taskId);

    // Log activity
    await ProjectActivityLogsRepository.logActivity(projectId, req.user.id, {
      action: "delete",
      entity_type: "task",
      entity_id: taskId,
      description: `Deleted task: ${task.title}`,
    });

    ApiResponse.success(res, null, "Task deleted successfully");
  } catch (error) {
    next(error);
  }
});

// ================== MILESTONES ==================

// Get milestones
router.get("/milestones", authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const milestones =
      await ProjectMilestonesRepository.getProjectMilestones(projectId);
    ApiResponse.success(res, milestones, "Milestones retrieved successfully");
  } catch (error) {
    next(error);
  }
});

// Create milestone
router.post(
  "/milestones",
  authenticate,
  [
    body("title").trim().notEmpty().withMessage("Milestone title is required"),
    body("due_date").isISO8601().withMessage("Valid due date is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const milestone = await ProjectMilestonesRepository.createMilestone(
        projectId,
        req.body
      );

      // Log activity
      await ProjectActivityLogsRepository.logActivity(projectId, req.user.id, {
        action: "create",
        entity_type: "milestone",
        entity_id: milestone.id,
        description: `Created milestone: ${milestone.title}`,
      });

      ApiResponse.success(
        res,
        milestone,
        "Milestone created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// Update milestone
router.put("/milestones/:milestoneId", authenticate, async (req, res, next) => {
  try {
    const { projectId, milestoneId } = req.params;
    await ProjectMilestonesRepository.updateMilestone(milestoneId, req.body);
    const milestone =
      await ProjectMilestonesRepository.getMilestoneById(milestoneId);

    // Log activity
    await ProjectActivityLogsRepository.logActivity(projectId, req.user.id, {
      action: "update",
      entity_type: "milestone",
      entity_id: milestoneId,
      description: `Updated milestone: ${milestone.title}`,
    });

    ApiResponse.success(res, milestone, "Milestone updated successfully");
  } catch (error) {
    next(error);
  }
});

// Delete milestone
router.delete(
  "/milestones/:milestoneId",
  authenticate,
  async (req, res, next) => {
    try {
      const { projectId, milestoneId } = req.params;
      const milestone =
        await ProjectMilestonesRepository.getMilestoneById(milestoneId);
      await ProjectMilestonesRepository.deleteMilestone(milestoneId);

      // Log activity
      await ProjectActivityLogsRepository.logActivity(projectId, req.user.id, {
        action: "delete",
        entity_type: "milestone",
        entity_id: milestoneId,
        description: `Deleted milestone: ${milestone.title}`,
      });

      ApiResponse.success(res, null, "Milestone deleted successfully");
    } catch (error) {
      next(error);
    }
  }
);

// ================== COMMENTS ==================

// Get comments
router.get("/comments", authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const comments =
      await ProjectCommentsRepository.getProjectComments(projectId);
    ApiResponse.success(res, comments, "Comments retrieved successfully");
  } catch (error) {
    next(error);
  }
});

// Create comment
router.post(
  "/comments",
  authenticate,
  [body("comment").trim().notEmpty().withMessage("Comment is required")],
  validate,
  async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const comment = await ProjectCommentsRepository.createComment(
        projectId,
        req.user.id,
        req.body
      );
      ApiResponse.success(res, comment, "Comment created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
);

// Update comment
router.put("/comments/:commentId", authenticate, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    await ProjectCommentsRepository.updateComment(commentId, req.body.comment);
    const comment = await ProjectCommentsRepository.getCommentById(commentId);
    ApiResponse.success(res, comment, "Comment updated successfully");
  } catch (error) {
    next(error);
  }
});

// Delete comment
router.delete("/comments/:commentId", authenticate, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    await ProjectCommentsRepository.deleteComment(commentId);
    ApiResponse.success(res, null, "Comment deleted successfully");
  } catch (error) {
    next(error);
  }
});

// ================== FILES ==================

// Get files
router.get("/files", authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const files = await ProjectFilesRepository.getProjectFiles(projectId);
    ApiResponse.success(res, files, "Files retrieved successfully");
  } catch (error) {
    next(error);
  }
});

// Upload file
router.post(
  "/files",
  authenticate,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const { projectId } = req.params;

      if (!req.file) {
        return ApiResponse.error(res, "No file uploaded", 400);
      }

      const fileData = {
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        description: req.body.description || null,
      };

      const file = await ProjectFilesRepository.uploadFile(
        projectId,
        req.user.id,
        fileData
      );

      // Log activity
      await ProjectActivityLogsRepository.logActivity(projectId, req.user.id, {
        action: "upload",
        entity_type: "file",
        entity_id: file.id,
        description: `Uploaded file: ${file.file_name}`,
      });

      ApiResponse.success(res, file, "File uploaded successfully", 201);
    } catch (error) {
      // Delete uploaded file if database insert fails
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Failed to delete file:", err);
        });
      }
      next(error);
    }
  }
);

// Download file
router.get("/files/:fileId/download", authenticate, async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await ProjectFilesRepository.getFileById(fileId);

    if (!file) {
      return ApiResponse.error(res, "File not found", 404);
    }

    const filePath = path.resolve(file.file_path);

    if (!fs.existsSync(filePath)) {
      return ApiResponse.error(res, "File not found on server", 404);
    }

    res.download(filePath, file.file_name, (err) => {
      if (err) {
        console.error("File download error:", err);
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete file
router.delete("/files/:fileId", authenticate, async (req, res, next) => {
  try {
    const { projectId, fileId } = req.params;
    const file = await ProjectFilesRepository.getFileById(fileId);

    if (!file) {
      return ApiResponse.error(res, "File not found", 404);
    }

    await ProjectFilesRepository.deleteFile(fileId);

    // Delete physical file
    const filePath = path.resolve(file.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete physical file:", err);
      });
    }

    // Log activity
    await ProjectActivityLogsRepository.logActivity(projectId, req.user.id, {
      action: "delete",
      entity_type: "file",
      entity_id: fileId,
      description: `Deleted file: ${file.file_name}`,
    });

    ApiResponse.success(res, null, "File deleted successfully");
  } catch (error) {
    next(error);
  }
});

// ================== ACTIVITY LOGS ==================

// Get activity logs
router.get("/activities", authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { limit } = req.query;
    const activities = await ProjectActivityLogsRepository.getProjectActivities(
      projectId,
      parseInt(limit) || 50
    );
    ApiResponse.success(res, activities, "Activities retrieved successfully");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
