import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import DepartmentTaskCard from "./DepartmentTaskCard";
import AssignDepartmentTaskDialog from "./AssignDepartmentTaskDialog";
import DepartmentTaskDetailDialog from "./DepartmentTaskDetailDialog";
import {
  fetchProjectDepartmentTasks,
  assignTaskToDepartment,
  acceptDepartmentTask,
  submitDepartmentTask,
  approveDepartmentTask,
  updateDepartmentTask,
  deleteDepartmentTask,
} from "../../features/taskWorkflow/taskWorkflowSlice";
import { toast } from "react-toastify";

const DepartmentTasksTab = ({ projectId, departments, currentUser }) => {
  const dispatch = useDispatch();
  const { departmentTasks, loading, error } = useSelector(
    (state) => state.taskWorkflow
  );

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null,
    task: null,
    notes: "",
  });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (projectId) {
      console.log("📋 [DepartmentTasks] Loading tasks for project:", projectId);
      dispatch(fetchProjectDepartmentTasks(projectId));
    }
  }, [dispatch, projectId]);

  // Debug: Log when departmentTasks changes
  useEffect(() => {
    console.log("📋 [DepartmentTasks] State updated:", departmentTasks);
  }, [departmentTasks]);

  const handleAssignTask = async (taskData) => {
    try {
      await dispatch(assignTaskToDepartment({ projectId, taskData })).unwrap();
      toast.success("Giao công việc thành công!");
      setAssignDialogOpen(false);
      dispatch(fetchProjectDepartmentTasks(projectId));
    } catch (error) {
      toast.error(error || "Không thể giao công việc");
    }
  };

  const handleAccept = (task) => {
    setActionDialog({ open: true, type: "accept", task, notes: "" });
  };

  const handleReject = (task) => {
    setActionDialog({ open: true, type: "reject", task, notes: "" });
  };

  const handleSubmit = (task) => {
    setActionDialog({ open: true, type: "submit", task, notes: "" });
  };

  const handleApprove = (task) => {
    setActionDialog({ open: true, type: "approve", task, notes: "" });
  };

  const handleActionConfirm = async () => {
    const { type, task, notes } = actionDialog;

    try {
      switch (type) {
        case "accept":
          await dispatch(
            acceptDepartmentTask({ taskId: task.id, notes })
          ).unwrap();
          toast.success("Đã chấp nhận công việc!");
          break;
        case "reject":
          if (!notes.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
          }
          // Call reject API
          toast.success("Đã từ chối công việc!");
          break;
        case "submit":
          await dispatch(
            submitDepartmentTask({ taskId: task.id, notes })
          ).unwrap();
          toast.success("Đã nộp công việc!");
          break;
        case "approve":
          await dispatch(
            approveDepartmentTask({ taskId: task.id, notes })
          ).unwrap();
          toast.success("Đã phê duyệt công việc!");
          break;
        default:
          break;
      }
      setActionDialog({ open: false, type: null, task: null, notes: "" });
      dispatch(fetchProjectDepartmentTasks(projectId));
    } catch (error) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setDetailDialogOpen(true);
  };

  const handleEditTask = (task) => {
    // TODO: Open edit dialog with task data
    toast.info("Chức năng chỉnh sửa đang được phát triển");
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await dispatch(deleteDepartmentTask(taskId)).unwrap();
      toast.success("Đã xóa công việc thành công!");
      dispatch(fetchProjectDepartmentTasks(projectId));
    } catch (error) {
      toast.error(error || "Không thể xóa công việc");
    }
  };

  const filteredTasks =
    statusFilter === "all"
      ? departmentTasks || []
      : (departmentTasks || []).filter((task) => task.status === statusFilter);

  const canAssignTask =
    currentUser?.roleNames?.includes("System Admin") ||
    currentUser?.roleNames?.includes("Administrator") ||
    currentUser?.roles?.some(
      (r) => r.name === "System Admin" || r.name === "Administrator"
    );

  console.log("🔑 [DepartmentTasks] Permission check:", {
    currentUser,
    canAssignTask,
    roleNames: currentUser?.roleNames,
    roles: currentUser?.roles,
  });

  const getActionDialogTitle = () => {
    switch (actionDialog.type) {
      case "accept":
        return "Xác Nhận Nhận Việc";
      case "reject":
        return "Từ Chối Công Việc";
      case "submit":
        return "Nộp Công Việc";
      case "approve":
        return "Phê Duyệt Công Việc";
      default:
        return "";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Công Việc Phòng Ban
        </Typography>
        {canAssignTask && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAssignDialogOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
              color: "#000",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)",
              },
            }}
          >
            Giao Công Việc
          </Button>
        )}
      </Box>

      {/* Status Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={(e, newValue) => setStatusFilter(newValue)}
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              "&.Mui-selected": {
                color: "#1976d2",
              },
            },
            "& .MuiTabs-indicator": {
              background: "linear-gradient(90deg, #2196f3 0%, #ffd700 100%)",
              height: 3,
            },
          }}
        >
          <Tab label="Tất cả" value="all" />
          <Tab label="Đã giao" value="assigned" />
          <Tab label="Đang thực hiện" value="in_progress" />
          <Tab label="Đã nộp" value="submitted" />
          <Tab label="Đã duyệt" value="approved" />
        </Tabs>
      </Box>

      {/* Loading State */}
      {loading.departmentTasks && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error.departmentTasks && !loading.departmentTasks && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.departmentTasks}
        </Alert>
      )}

      {/* Task List */}
      {!loading.departmentTasks && !error.departmentTasks && (
        <>
          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có công việc nào
              </Typography>
              {canAssignTask && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setAssignDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Giao Công Việc Đầu Tiên
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredTasks.map((task) => (
                <Grid item xs={12} sm={6} md={6} lg={4} key={task.id}>
                  <DepartmentTaskCard
                    task={task}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onSubmit={handleSubmit}
                    onApprove={handleApprove}
                    onViewDetails={handleViewDetails}
                    currentUser={currentUser}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Assign Task Dialog */}
      <AssignDepartmentTaskDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        onAssign={handleAssignTask}
        departments={departments}
        loading={loading.action}
        error={error.action}
      />

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() =>
          setActionDialog({ open: false, type: null, task: null, notes: "" })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{getActionDialogTitle()}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            Công việc: <strong>{actionDialog.task?.title}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={
              actionDialog.type === "reject"
                ? "Lý do từ chối *"
                : "Ghi chú (tùy chọn)"
            }
            value={actionDialog.notes}
            onChange={(e) =>
              setActionDialog({ ...actionDialog, notes: e.target.value })
            }
            sx={{ mt: 2 }}
            required={actionDialog.type === "reject"}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setActionDialog({
                open: false,
                type: null,
                task: null,
                notes: "",
              })
            }
            disabled={loading.action}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleActionConfirm}
            disabled={
              loading.action ||
              (actionDialog.type === "reject" && !actionDialog.notes.trim())
            }
            color={actionDialog.type === "reject" ? "error" : "primary"}
          >
            {loading.action ? "Đang xử lý..." : "Xác Nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Detail Dialog */}
      <DepartmentTaskDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </Box>
  );
};

export default DepartmentTasksTab;
