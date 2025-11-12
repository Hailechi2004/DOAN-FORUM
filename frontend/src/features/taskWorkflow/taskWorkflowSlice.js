import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  departmentTaskService,
  memberTaskService,
  taskReportService,
  projectWarningService,
} from "../../services/taskWorkflowService";

// ==================== ASYNC THUNKS ====================

// Department Tasks
export const fetchProjectDepartmentTasks = createAsyncThunk(
  "taskWorkflow/fetchProjectDepartmentTasks",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await departmentTaskService.getProjectTasks(projectId);
      return response; // Service already unwraps response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải danh sách công việc"
      );
    }
  }
);

export const assignTaskToDepartment = createAsyncThunk(
  "taskWorkflow/assignTaskToDepartment",
  async ({ projectId, taskData }, { rejectWithValue }) => {
    try {
      const response = await departmentTaskService.assignToDepartment(
        projectId,
        taskData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể giao công việc"
      );
    }
  }
);

export const acceptDepartmentTask = createAsyncThunk(
  "taskWorkflow/acceptDepartmentTask",
  async ({ taskId, notes }, { rejectWithValue }) => {
    try {
      const response = await departmentTaskService.acceptTask(taskId, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể chấp nhận công việc"
      );
    }
  }
);

export const updateDepartmentTaskProgress = createAsyncThunk(
  "taskWorkflow/updateDepartmentTaskProgress",
  async ({ taskId, progress, actualHours }, { rejectWithValue }) => {
    try {
      const response = await departmentTaskService.updateProgress(
        taskId,
        progress,
        actualHours
      );
      return { taskId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật tiến độ"
      );
    }
  }
);

export const submitDepartmentTask = createAsyncThunk(
  "taskWorkflow/submitDepartmentTask",
  async ({ taskId, notes }, { rejectWithValue }) => {
    try {
      const response = await departmentTaskService.submitTask(taskId, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể nộp công việc"
      );
    }
  }
);

export const approveDepartmentTask = createAsyncThunk(
  "taskWorkflow/approveDepartmentTask",
  async ({ taskId, notes }, { rejectWithValue }) => {
    try {
      const response = await departmentTaskService.approveTask(taskId, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể phê duyệt công việc"
      );
    }
  }
);

export const updateDepartmentTask = createAsyncThunk(
  "taskWorkflow/updateDepartmentTask",
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await departmentTaskService.updateTask(taskId, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật công việc"
      );
    }
  }
);

export const deleteDepartmentTask = createAsyncThunk(
  "taskWorkflow/deleteDepartmentTask",
  async (taskId, { rejectWithValue }) => {
    try {
      await departmentTaskService.deleteTask(taskId);
      return { taskId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa công việc"
      );
    }
  }
);

// Member Tasks
export const fetchDepartmentMemberTasks = createAsyncThunk(
  "taskWorkflow/fetchDepartmentMemberTasks",
  async (departmentTaskId, { rejectWithValue }) => {
    try {
      const response = await memberTaskService.getDepartmentTaskMembers(
        departmentTaskId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải danh sách công việc nhân viên"
      );
    }
  }
);

export const fetchUserMemberTasks = createAsyncThunk(
  "taskWorkflow/fetchUserMemberTasks",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await memberTaskService.getUserTasks(userId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải danh sách công việc"
      );
    }
  }
);

// Alias for backward compatibility
export const fetchProjectMemberTasks = fetchDepartmentMemberTasks;

export const assignTaskToMember = createAsyncThunk(
  "taskWorkflow/assignTaskToMember",
  async ({ departmentTaskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await memberTaskService.assignToMember(
        departmentTaskId,
        taskData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể giao công việc"
      );
    }
  }
);

export const startMemberTask = createAsyncThunk(
  "taskWorkflow/startMemberTask",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await memberTaskService.startTask(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể bắt đầu công việc"
      );
    }
  }
);

export const updateMemberTaskProgress = createAsyncThunk(
  "taskWorkflow/updateMemberTaskProgress",
  async ({ taskId, progress, actualHours }, { rejectWithValue }) => {
    try {
      const response = await memberTaskService.updateProgress(
        taskId,
        progress,
        actualHours
      );
      return { taskId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật tiến độ"
      );
    }
  }
);

export const submitMemberTask = createAsyncThunk(
  "taskWorkflow/submitMemberTask",
  async ({ taskId, notes }, { rejectWithValue }) => {
    try {
      const response = await memberTaskService.submitTask(taskId, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể nộp công việc"
      );
    }
  }
);

export const approveMemberTask = createAsyncThunk(
  "taskWorkflow/approveMemberTask",
  async ({ taskId, notes }, { rejectWithValue }) => {
    try {
      const response = await memberTaskService.approveTask(taskId, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể phê duyệt công việc"
      );
    }
  }
);

export const fetchUserWorkload = createAsyncThunk(
  "taskWorkflow/fetchUserWorkload",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await memberTaskService.getUserWorkload(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thông tin workload"
      );
    }
  }
);

// Reports
export const fetchProjectReports = createAsyncThunk(
  "taskWorkflow/fetchProjectReports",
  async ({ projectId, reportType }, { rejectWithValue }) => {
    try {
      const response = await taskReportService.getProjectReports(
        projectId,
        reportType
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải báo cáo"
      );
    }
  }
);

export const createTaskReport = createAsyncThunk(
  "taskWorkflow/createTaskReport",
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await taskReportService.createReport(reportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo báo cáo"
      );
    }
  }
);

// Warnings
export const fetchProjectWarnings = createAsyncThunk(
  "taskWorkflow/fetchProjectWarnings",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectWarningService.getProjectWarnings(
        projectId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải cảnh báo"
      );
    }
  }
);

export const issueWarning = createAsyncThunk(
  "taskWorkflow/issueWarning",
  async (warningData, { rejectWithValue }) => {
    try {
      const response = await projectWarningService.issueWarning(warningData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể phát hành cảnh báo"
      );
    }
  }
);

export const acknowledgeWarning = createAsyncThunk(
  "taskWorkflow/acknowledgeWarning",
  async ({ warningId, acknowledgmentNote }, { rejectWithValue }) => {
    try {
      const response = await projectWarningService.acknowledgeWarning(
        warningId,
        acknowledgmentNote
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xác nhận cảnh báo"
      );
    }
  }
);

export const fetchUserWarnings = createAsyncThunk(
  "taskWorkflow/fetchUserWarnings",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await projectWarningService.getUserWarnings(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải cảnh báo"
      );
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  // Department Tasks
  departmentTasks: [],
  selectedDepartmentTask: null,

  // Member Tasks
  memberTasks: [],
  selectedMemberTask: null,
  userWorkload: null,

  // Reports
  reports: [],
  selectedReport: null,

  // Warnings
  warnings: [],
  selectedWarning: null,
  userWarnings: [],

  // Loading states
  loading: {
    departmentTasks: false,
    memberTasks: false,
    reports: false,
    warnings: false,
    action: false,
  },

  // Error states
  error: {
    departmentTasks: null,
    memberTasks: null,
    reports: null,
    warnings: null,
    action: null,
  },
};

const taskWorkflowSlice = createSlice({
  name: "taskWorkflow",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = {
        departmentTasks: null,
        memberTasks: null,
        reports: null,
        warnings: null,
        action: null,
      };
    },
    setSelectedDepartmentTask: (state, action) => {
      state.selectedDepartmentTask = action.payload;
    },
    setSelectedMemberTask: (state, action) => {
      state.selectedMemberTask = action.payload;
    },
    clearSelectedTasks: (state) => {
      state.selectedDepartmentTask = null;
      state.selectedMemberTask = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Project Department Tasks
    builder
      .addCase(fetchProjectDepartmentTasks.pending, (state) => {
        state.loading.departmentTasks = true;
        state.error.departmentTasks = null;
      })
      .addCase(fetchProjectDepartmentTasks.fulfilled, (state, action) => {
        state.loading.departmentTasks = false;
        console.log("📋 [Redux] Reducer received payload:", action.payload);
        state.departmentTasks = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.tasks || [];
        console.log(
          "📋 [Redux] Stored departmentTasks:",
          state.departmentTasks
        );
      })
      .addCase(fetchProjectDepartmentTasks.rejected, (state, action) => {
        state.loading.departmentTasks = false;
        state.error.departmentTasks = action.payload;
      });

    // Assign Task to Department
    builder
      .addCase(assignTaskToDepartment.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(assignTaskToDepartment.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(assignTaskToDepartment.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Accept Department Task
    builder
      .addCase(acceptDepartmentTask.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(acceptDepartmentTask.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(acceptDepartmentTask.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Update Department Task Progress
    builder
      .addCase(updateDepartmentTaskProgress.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(updateDepartmentTaskProgress.fulfilled, (state, action) => {
        state.loading.action = false;
        // Update task in list
        const taskIndex = state.departmentTasks.findIndex(
          (t) => t.id === action.payload.taskId
        );
        if (taskIndex !== -1) {
          state.departmentTasks[taskIndex].progress = action.payload.progress;
          if (action.payload.actual_hours !== undefined) {
            state.departmentTasks[taskIndex].actual_hours =
              action.payload.actual_hours;
          }
        }
      })
      .addCase(updateDepartmentTaskProgress.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Submit Department Task
    builder
      .addCase(submitDepartmentTask.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(submitDepartmentTask.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(submitDepartmentTask.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Approve Department Task
    builder
      .addCase(approveDepartmentTask.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(approveDepartmentTask.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(approveDepartmentTask.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Update Department Task
    builder
      .addCase(updateDepartmentTask.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(updateDepartmentTask.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(updateDepartmentTask.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Delete Department Task
    builder
      .addCase(deleteDepartmentTask.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(deleteDepartmentTask.fulfilled, (state, action) => {
        state.loading.action = false;
        // Remove task from list
        state.departmentTasks = state.departmentTasks.filter(
          (t) => t.id !== action.payload.taskId
        );
      })
      .addCase(deleteDepartmentTask.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Fetch Department Member Tasks
    builder
      .addCase(fetchDepartmentMemberTasks.pending, (state) => {
        state.loading.memberTasks = true;
        state.error.memberTasks = null;
      })
      .addCase(fetchDepartmentMemberTasks.fulfilled, (state, action) => {
        state.loading.memberTasks = false;
        state.memberTasks = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.tasks || [];
      })
      .addCase(fetchDepartmentMemberTasks.rejected, (state, action) => {
        state.loading.memberTasks = false;
        state.error.memberTasks = action.payload;
      });

    // Fetch User Member Tasks
    builder
      .addCase(fetchUserMemberTasks.pending, (state) => {
        state.loading.memberTasks = true;
        state.error.memberTasks = null;
      })
      .addCase(fetchUserMemberTasks.fulfilled, (state, action) => {
        state.loading.memberTasks = false;
        state.memberTasks = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.tasks || [];
      })
      .addCase(fetchUserMemberTasks.rejected, (state, action) => {
        state.loading.memberTasks = false;
        state.error.memberTasks = action.payload;
      });

    // Assign Task to Member
    builder
      .addCase(assignTaskToMember.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(assignTaskToMember.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(assignTaskToMember.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Start Member Task
    builder
      .addCase(startMemberTask.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(startMemberTask.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(startMemberTask.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Update Member Task Progress
    builder
      .addCase(updateMemberTaskProgress.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(updateMemberTaskProgress.fulfilled, (state, action) => {
        state.loading.action = false;
        // Update task in list
        const taskIndex = state.memberTasks.findIndex(
          (t) => t.id === action.payload.taskId
        );
        if (taskIndex !== -1) {
          state.memberTasks[taskIndex].progress = action.payload.progress;
          if (action.payload.actual_hours !== undefined) {
            state.memberTasks[taskIndex].actual_hours =
              action.payload.actual_hours;
          }
        }
      })
      .addCase(updateMemberTaskProgress.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Submit Member Task
    builder
      .addCase(submitMemberTask.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(submitMemberTask.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(submitMemberTask.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Approve Member Task
    builder
      .addCase(approveMemberTask.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(approveMemberTask.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(approveMemberTask.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Fetch User Workload
    builder
      .addCase(fetchUserWorkload.pending, (state) => {
        state.loading.memberTasks = true;
      })
      .addCase(fetchUserWorkload.fulfilled, (state, action) => {
        state.loading.memberTasks = false;
        state.userWorkload = action.payload;
      })
      .addCase(fetchUserWorkload.rejected, (state, action) => {
        state.loading.memberTasks = false;
        state.error.memberTasks = action.payload;
      });

    // Fetch Project Reports
    builder
      .addCase(fetchProjectReports.pending, (state) => {
        state.loading.reports = true;
        state.error.reports = null;
      })
      .addCase(fetchProjectReports.fulfilled, (state, action) => {
        state.loading.reports = false;
        state.reports = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.reports || [];
      })
      .addCase(fetchProjectReports.rejected, (state, action) => {
        state.loading.reports = false;
        state.error.reports = action.payload;
      });

    // Create Task Report
    builder
      .addCase(createTaskReport.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(createTaskReport.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(createTaskReport.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Fetch Project Warnings
    builder
      .addCase(fetchProjectWarnings.pending, (state) => {
        state.loading.warnings = true;
        state.error.warnings = null;
      })
      .addCase(fetchProjectWarnings.fulfilled, (state, action) => {
        state.loading.warnings = false;
        state.warnings = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.warnings || [];
      })
      .addCase(fetchProjectWarnings.rejected, (state, action) => {
        state.loading.warnings = false;
        state.error.warnings = action.payload;
      });

    // Issue Warning
    builder
      .addCase(issueWarning.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(issueWarning.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(issueWarning.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Acknowledge Warning
    builder
      .addCase(acknowledgeWarning.pending, (state) => {
        state.loading.action = true;
        state.error.action = null;
      })
      .addCase(acknowledgeWarning.fulfilled, (state) => {
        state.loading.action = false;
      })
      .addCase(acknowledgeWarning.rejected, (state, action) => {
        state.loading.action = false;
        state.error.action = action.payload;
      });

    // Fetch User Warnings
    builder
      .addCase(fetchUserWarnings.pending, (state) => {
        state.loading.warnings = true;
        state.error.warnings = null;
      })
      .addCase(fetchUserWarnings.fulfilled, (state, action) => {
        state.loading.warnings = false;
        state.userWarnings = action.payload?.warnings || action.payload || [];
      })
      .addCase(fetchUserWarnings.rejected, (state, action) => {
        state.loading.warnings = false;
        state.error.warnings = action.payload;
      });
  },
});

export const {
  clearErrors,
  setSelectedDepartmentTask,
  setSelectedMemberTask,
  clearSelectedTasks,
} = taskWorkflowSlice.actions;

export default taskWorkflowSlice.reducer;
