const MemberTask = require("../../models/MemberTask");
const DepartmentTask = require("../../models/DepartmentTask");
const { validationResult } = require("express-validator");

class MemberTaskController {
  // Manager: Assign task to member
  async assignTaskToMember(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { departmentTaskId } = req.params;
      const {
        user_id,
        title,
        description,
        priority,
        deadline,
        estimated_hours,
      } = req.body;

      // Verify department task exists
      const deptTask = await DepartmentTask.getById(departmentTaskId);
      if (!deptTask) {
        return res.status(404).json({
          success: false,
          message: "Department task not found",
        });
      }

      // Create member task
      const taskId = await MemberTask.create({
        department_task_id: departmentTaskId,
        user_id,
        title,
        description,
        assigned_by: req.user.id,
        priority,
        deadline,
        estimated_hours,
      });

      // TODO: Send notification to member

      res.status(201).json({
        success: true,
        message: "Task assigned to member successfully",
        data: { taskId },
      });
    } catch (error) {
      console.error("Error assigning task to member:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign task to member",
        error: error.message,
      });
    }
  }

  // Get tasks by department task
  async getDepartmentTaskMembers(req, res) {
    try {
      const { departmentTaskId } = req.params;

      const tasks = await MemberTask.getByDepartmentTask(departmentTaskId);

      res.json({
        success: true,
        message: "Member tasks retrieved successfully",
        data: tasks,
      });
    } catch (error) {
      console.error("Error getting member tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve member tasks",
        error: error.message,
      });
    }
  }

  // Get tasks by user
  async getUserTasks(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      const tasks = await MemberTask.getByUser(userId, status);

      res.json({
        success: true,
        message: "User tasks retrieved successfully",
        data: tasks,
      });
    } catch (error) {
      console.error("Error getting user tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user tasks",
        error: error.message,
      });
    }
  }

  // Get my tasks (current user)
  async getMyTasks(req, res) {
    try {
      const { status } = req.query;

      const tasks = await MemberTask.getByUser(req.user.id, status);

      res.json({
        success: true,
        message: "Your tasks retrieved successfully",
        data: tasks,
      });
    } catch (error) {
      console.error("Error getting my tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve your tasks",
        error: error.message,
      });
    }
  }

  // Get task details
  async getTaskById(req, res) {
    try {
      const { taskId } = req.params;

      const task = await MemberTask.getById(taskId);

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

  // Employee: Start task
  async startTask(req, res) {
    try {
      const { taskId } = req.params;

      const task = await MemberTask.getById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (task.user_id != req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this task",
        });
      }

      if (task.status !== "assigned") {
        return res.status(400).json({
          success: false,
          message: "Task can only be started when in 'assigned' status",
        });
      }

      await MemberTask.start(taskId, req.user.id);

      res.json({
        success: true,
        message: "Task started successfully",
      });
    } catch (error) {
      console.error("Error starting task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start task",
        error: error.message,
      });
    }
  }

  // Employee: Update task progress
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

      const task = await MemberTask.getById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (task.user_id != req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this task",
        });
      }

      await MemberTask.updateProgress(
        taskId,
        req.user.id,
        progress,
        actual_hours
      );

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

  // Employee: Submit task
  async submitTask(req, res) {
    try {
      const { taskId } = req.params;
      const { notes } = req.body;

      const task = await MemberTask.getById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (task.user_id != req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this task",
        });
      }

      if (task.status !== "in_progress") {
        return res.status(400).json({
          success: false,
          message: "Only in-progress tasks can be submitted",
        });
      }

      await MemberTask.submit(taskId, req.user.id, notes);

      // TODO: Notify manager for approval

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

  // Manager: Approve task
  async approveTask(req, res) {
    try {
      const { taskId } = req.params;
      const { notes } = req.body;

      const task = await MemberTask.getById(taskId);
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

      await MemberTask.approve(taskId, req.user.id, notes);

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

  // Manager: Reject submitted task
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

      const task = await MemberTask.getById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      await MemberTask.rejectSubmission(taskId, req.user.id, notes);

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

  // Manager: Update task details
  async updateTask(req, res) {
    try {
      const { taskId } = req.params;
      const updates = req.body;

      await MemberTask.update(taskId, updates);

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

  // Manager: Reassign task
  async reassignTask(req, res) {
    try {
      const { taskId } = req.params;
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: "New user ID is required",
        });
      }

      await MemberTask.reassign(taskId, user_id, req.user.id);

      res.json({
        success: true,
        message: "Task reassigned successfully",
      });
    } catch (error) {
      console.error("Error reassigning task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reassign task",
        error: error.message,
      });
    }
  }

  // Manager: Delete task
  async deleteTask(req, res) {
    try {
      const { taskId } = req.params;

      await MemberTask.delete(taskId);

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
      const { userId } = req.query;

      const tasks = await MemberTask.getOverdue(userId);

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

  // Get member workload
  async getMemberWorkload(req, res) {
    try {
      const { userId } = req.params;

      const workload = await MemberTask.getMemberWorkload(userId);

      res.json({
        success: true,
        message: "Member workload retrieved successfully",
        data: workload,
      });
    } catch (error) {
      console.error("Error getting member workload:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve member workload",
        error: error.message,
      });
    }
  }
}

module.exports = new MemberTaskController();
