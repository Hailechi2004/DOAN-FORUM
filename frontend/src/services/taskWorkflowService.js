import api from "../utils/axios";

/**
 * Task Workflow Service
 * Handles all API calls for department tasks, member tasks, reports, and warnings
 */

// ==================== DEPARTMENT TASKS ====================

export const departmentTaskService = {
  // Assign task to department (Admin only)
  assignToDepartment: async (projectId, taskData) => {
    const response = await api.post(
      `/projects/${projectId}/department-tasks`,
      taskData
    );
    return response.data;
  },

  // Get department tasks for a project
  getProjectTasks: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/department-tasks`);
    // Axios interceptor already unwraps to { success, message, data }
    return response.data; // Extract the data array
  },

  // Get department tasks for a department
  getDepartmentTasks: async (departmentId, status = null) => {
    const params = status ? { status } : {};
    const response = await api.get(
      `/departments/${departmentId}/department-tasks`,
      { params }
    );
    return response.data;
  },

  // Get task details
  getTaskById: async (taskId) => {
    const response = await api.get(`/department-tasks/${taskId}`);
    return response.data;
  },

  // Manager accepts task
  acceptTask: async (taskId, notes) => {
    const response = await api.post(`/department-tasks/${taskId}/accept`, {
      notes,
    });
    return response.data;
  },

  // Manager rejects task
  rejectTask: async (taskId, reason) => {
    const response = await api.post(`/department-tasks/${taskId}/reject`, {
      reason,
    });
    return response.data;
  },

  // Update task progress
  updateProgress: async (taskId, progress, actualHours = null) => {
    const response = await api.patch(`/department-tasks/${taskId}/progress`, {
      progress,
      actual_hours: actualHours,
    });
    return response.data;
  },

  // Submit task for approval
  submitTask: async (taskId, notes) => {
    const response = await api.post(`/department-tasks/${taskId}/submit`, {
      notes,
    });
    return response.data;
  },

  // Admin approves task
  approveTask: async (taskId, notes = null) => {
    const response = await api.post(`/department-tasks/${taskId}/approve`, {
      notes,
    });
    return response.data;
  },

  // Update task (Admin only)
  updateTask: async (taskId, taskData) => {
    const response = await api.patch(`/department-tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete task (Admin only)
  deleteTask: async (taskId) => {
    const response = await api.delete(`/department-tasks/${taskId}`);
    return response.data;
  },

  // Admin rejects submission
  rejectSubmission: async (taskId, notes) => {
    const response = await api.post(
      `/department-tasks/${taskId}/reject-submission`,
      { notes }
    );
    return response.data;
  },

  // Update task details
  updateTask: async (taskId, updates) => {
    const response = await api.patch(`/department-tasks/${taskId}`, updates);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId) => {
    const response = await api.delete(`/department-tasks/${taskId}`);
    return response.data;
  },
};

// ==================== MEMBER TASKS ====================

export const memberTaskService = {
  // Assign task to member (Manager only)
  assignToMember: async (departmentTaskId, taskData) => {
    const response = await api.post(
      `/department-tasks/${departmentTaskId}/member-tasks`,
      taskData
    );
    return response.data;
  },

  // Get member tasks for a department task
  getDepartmentTaskMembers: async (departmentTaskId) => {
    const response = await api.get(
      `/department-tasks/${departmentTaskId}/member-tasks`
    );
    return response.data;
  },

  // Get member tasks for a user
  getUserTasks: async (userId, status = null) => {
    const params = status ? { status } : {};
    const response = await api.get(`/users/${userId}/member-tasks`, { params });
    return response.data;
  },

  // Get task details
  getTaskById: async (taskId) => {
    const response = await api.get(`/member-tasks/${taskId}`);
    return response.data;
  },

  // Member starts task
  startTask: async (taskId) => {
    const response = await api.post(`/member-tasks/${taskId}/start`);
    return response.data;
  },

  // Update task progress
  updateProgress: async (taskId, progress, actualHours = null) => {
    const response = await api.patch(`/member-tasks/${taskId}/progress`, {
      progress,
      actual_hours: actualHours,
    });
    return response.data;
  },

  // Submit task for review
  submitTask: async (taskId, notes) => {
    const response = await api.post(`/member-tasks/${taskId}/submit`, {
      notes,
    });
    return response.data;
  },

  // Manager approves task
  approveTask: async (taskId, notes = null) => {
    const response = await api.post(`/member-tasks/${taskId}/approve`, {
      notes,
    });
    return response.data;
  },

  // Manager rejects submission
  rejectSubmission: async (taskId, notes) => {
    const response = await api.post(
      `/member-tasks/${taskId}/reject-submission`,
      { notes }
    );
    return response.data;
  },

  // Reassign task to another user
  reassignTask: async (taskId, userId) => {
    const response = await api.post(`/member-tasks/${taskId}/reassign`, {
      user_id: userId,
    });
    return response.data;
  },

  // Get user workload
  getUserWorkload: async (userId) => {
    const response = await api.get(`/users/${userId}/workload`);
    return response.data;
  },

  // Update task details
  updateTask: async (taskId, updates) => {
    const response = await api.patch(`/member-tasks/${taskId}`, updates);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId) => {
    const response = await api.delete(`/member-tasks/${taskId}`);
    return response.data;
  },
};

// ==================== TASK REPORTS ====================

export const taskReportService = {
  // Create report
  createReport: async (reportData) => {
    const response = await api.post("/reports", reportData);
    return response.data;
  },

  // Get project reports
  getProjectReports: async (projectId, reportType = null) => {
    const params = reportType ? { report_type: reportType } : {};
    const response = await api.get(`/projects/${projectId}/reports`, {
      params,
    });
    return response.data;
  },

  // Get department task reports
  getDepartmentTaskReports: async (departmentTaskId) => {
    const response = await api.get(
      `/department-tasks/${departmentTaskId}/reports`
    );
    return response.data;
  },

  // Get member task reports
  getMemberTaskReports: async (memberTaskId) => {
    const response = await api.get(`/member-tasks/${memberTaskId}/reports`);
    return response.data;
  },

  // Get my reports
  getMyReports: async () => {
    const response = await api.get("/my-reports");
    return response.data;
  },

  // Get report by ID
  getReportById: async (reportId) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  },

  // Update report
  updateReport: async (reportId, updates) => {
    const response = await api.patch(`/reports/${reportId}`, updates);
    return response.data;
  },

  // Delete report
  deleteReport: async (reportId) => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  },

  // Get reports with issues
  getReportsWithIssues: async () => {
    const response = await api.get("/reports/with-issues");
    return response.data;
  },
};

// ==================== PROJECT WARNINGS ====================

export const projectWarningService = {
  // Issue warning (Manager/Admin only)
  issueWarning: async (warningData) => {
    const response = await api.post("/warnings", warningData);
    return response.data;
  },

  // Get project warnings
  getProjectWarnings: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/warnings`);
    return response.data;
  },

  // Get user warnings
  getUserWarnings: async (userId) => {
    const response = await api.get(`/users/${userId}/warnings`);
    return response.data;
  },

  // Get my warnings
  getMyWarnings: async () => {
    const response = await api.get("/my-warnings");
    return response.data;
  },

  // Get warning by ID
  getWarningById: async (warningId) => {
    const response = await api.get(`/warnings/${warningId}`);
    return response.data;
  },

  // Acknowledge warning
  acknowledgeWarning: async (warningId, acknowledgmentNote) => {
    const response = await api.post(`/warnings/${warningId}/acknowledge`, {
      acknowledgment_note: acknowledgmentNote,
    });
    return response.data;
  },

  // Get user warning statistics
  getUserStats: async (userId) => {
    const response = await api.get(`/users/${userId}/warning-stats`);
    return response.data;
  },

  // Get unacknowledged warnings
  getUnacknowledgedWarnings: async () => {
    const response = await api.get("/warnings/unacknowledged");
    return response.data;
  },

  // Delete warning (Admin only)
  deleteWarning: async (warningId) => {
    const response = await api.delete(`/warnings/${warningId}`);
    return response.data;
  },
};

export default {
  departmentTask: departmentTaskService,
  memberTask: memberTaskService,
  report: taskReportService,
  warning: projectWarningService,
};
