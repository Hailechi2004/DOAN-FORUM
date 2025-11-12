const DepartmentTask = require("../../models/DepartmentTask");
const ProjectDepartment = require("../../models/ProjectDepartment");
const { validationResult } = require("express-validator");

class DepartmentTaskController {
  // Admin: Assign task to department
  async assignTaskToDepartment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { projectId } = req.params;
      const {
        department_id,
        title,
        description,
        priority,
        deadline,
        estimated_hours,
      } = req.body;

      // Check if department is assigned to project
      const departments =
        await ProjectDepartment.getProjectDepartments(projectId);
      const isDepartmentAssigned = departments.some(
        (d) => d.department_id == department_id
      );

      if (!isDepartmentAssigned) {
        return res.status(400).json({
          success: false,
          message: "Department is not assigned to this project",
        });
      }

      // Create task
      const taskId = await DepartmentTask.create({
        project_id: projectId,
        department_id,
        title,
        description,
        assigned_by: req.user.id,
        priority,
        deadline,
        estimated_hours,
      });

      // TODO: Send notification to department manager

      res.status(201).json({
        success: true,
        message: "Task assigned to department successfully",
        data: { taskId },
      });
    } catch (error) {
      console.error("Error assigning task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign task to department",
        error: error.message,
      });
    }
  }

  // Get all tasks for a project
  async getProjectTasks(req, res) {
    try {
      const { projectId } = req.params;

      const tasks = await DepartmentTask.getByProject(projectId);

      res.json({
        success: true,
        message: "Project tasks retrieved successfully",
        data: tasks,
      });
    } catch (error) {
      console.error("Error getting project tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve project tasks",
        error: error.message,
      });
    }
  }

  // Get tasks by department
  async getDepartmentTasks(req, res) {
    try {
      const { departmentId } = req.params;
      const { status } = req.query;

      const tasks = await DepartmentTask.getByDepartment(departmentId, status);

      res.json({
        success: true,
        message: "Department tasks retrieved successfully",
        data: tasks,
      });
    } catch (error) {
      console.error("Error getting department tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve department tasks",
        error: error.message,
      });
    }
  }

  // Get task details
  async getTaskById(req, res) {
    try {
      const { taskId } = req.params;

      const task = await DepartmentTask.getById(taskId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.json({
        success: true,
        message: "Task retrieved successfully",
        data: task,
      });
    } catch (error) {
      console.error("Error getting task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve task",
        error: error.message,
      });
    }
  }

  // Manager: Accept task
  async acceptTask(req, res) {
    try {
      const { taskId } = req.params;

      const task = await DepartmentTask.getById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (task.status !== "assigned") {
        return res.status(400).json({
          success: false,
          message: "Task can only be accepted when in 'assigned' status",
        });
      }

      await DepartmentTask.accept(taskId, req.user.id);

      res.json({
        success: true,
        message: "Task accepted successfully",
      });
    } catch (error) {
      console.error("Error accepting task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to accept task",
        error: error.message,
      });
    }
  }

  // Manager: Reject task
  async rejectTask(req, res) {
    try {
      const { taskId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      const task = await DepartmentTask.getById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      await DepartmentTask.reject(taskId, req.user.id, reason);

      res.json({
        success: true,
        message: "Task rejected successfully",
      });
    } catch (error) {
      console.error("Error rejecting task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject task",
        error: error.message,
      });
    }
  }

  // Manager: Update task progress
  async updateProgress(req, res) {
    try {
      const { taskId } = req.params;
      const { progress, actual_hours } = req.body;

      if (progress < 0 || progress > 100) {
        return res.status(400).json({
          success: false,
          message: "Progress must be between 0 and 100",
        });
      }

      await DepartmentTask.updateProgress(taskId, progress, actual_hours);

      res.json({
        success: true,
        message: "Task progress updated successfully",
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update task progress",
        error: error.message,
      });
    }
  }

  // Manager: Submit task for approval
  async submitTask(req, res) {
    try {
      const { taskId } = req.params;
      const { notes } = req.body;

      const task = await DepartmentTask.getById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (task.status !== "in_progress") {
        return res.status(400).json({
          success: false,
          message: "Only in-progress tasks can be submitted",
        });
      }

      await DepartmentTask.submit(taskId, req.user.id, notes);

      // TODO: Notify admin for approval

      res.json({
        success: true,
        message: "Task submitted for approval successfully",
      });
    } catch (error) {
      console.error("Error submitting task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit task",
        error: error.message,
      });
    }
  }

  // Admin: Approve submitted task
  async approveTask(req, res) {
    try {
      const { taskId } = req.params;
      const { notes } = req.body;

      const task = await DepartmentTask.getById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (task.status !== "submitted") {
        return res.status(400).json({
          success: false,
          message: "Only submitted tasks can be approved",
        });
      }

      await DepartmentTask.approve(taskId, req.user.id, notes);

      res.json({
        success: true,
        message: "Task approved successfully",
      });
    } catch (error) {
      console.error("Error approving task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve task",
        error: error.message,
      });
    }
  }

  // Admin: Reject submitted task (send back for revision)
  async rejectSubmission(req, res) {
    try {
      const { taskId } = req.params;
      const { notes } = req.body;

      if (!notes) {
        return res.status(400).json({
          success: false,
          message: "Rejection notes are required",
        });
      }

      const task = await DepartmentTask.getById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      await DepartmentTask.rejectSubmission(taskId, req.user.id, notes);

      res.json({
        success: true,
        message: "Task sent back for revision",
      });
    } catch (error) {
      console.error("Error rejecting submission:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject submission",
        error: error.message,
      });
    }
  }

  // Admin: Update task details
  async updateTask(req, res) {
    try {
      const { taskId } = req.params;
      const updates = req.body;

      await DepartmentTask.update(taskId, updates);

      res.json({
        success: true,
        message: "Task updated successfully",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update task",
        error: error.message,
      });
    }
  }

  // Admin: Delete task
  async deleteTask(req, res) {
    try {
      const { taskId } = req.params;

      await DepartmentTask.delete(taskId);

      res.json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete task",
        error: error.message,
      });
    }
  }

  // Get overdue tasks
  async getOverdueTasks(req, res) {
    try {
      const { departmentId } = req.query;

      const tasks = await DepartmentTask.getOverdue(departmentId);

      res.json({
        success: true,
        message: "Overdue tasks retrieved successfully",
        data: tasks,
      });
    } catch (error) {
      console.error("Error getting overdue tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve overdue tasks",
        error: error.message,
      });
    }
  }
}

module.exports = new DepartmentTaskController();
