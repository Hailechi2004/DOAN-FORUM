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
  MenuItem,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import MemberTaskCard from "./MemberTaskCard";
import AssignMemberTaskDialog from "./AssignMemberTaskDialog";
import {
  fetchDepartmentMemberTasks,
  fetchUserMemberTasks,
  assignTaskToMember,
  startMemberTask,
  submitMemberTask,
  approveMemberTask,
  updateMemberTaskProgress,
} from "../../features/taskWorkflow/taskWorkflowSlice";
import { toast } from "react-toastify";

const MemberTasksTab = ({
  departmentTaskId,
  users,
  currentUser,
  viewMode = "department",
}) => {
  const dispatch = useDispatch();
  const { memberTasks, loading, error } = useSelector(
    (state) => state.taskWorkflow
  );
  const { departmentTasks } = useSelector((state) => state.taskWorkflow);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDepartmentTask, setSelectedDepartmentTask] = useState("");
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null,
    task: null,
    notes: "",
    progress: 0,
    actualHours: 0,
  });

  useEffect(() => {
    if (viewMode === "department" && departmentTaskId) {
      console.log(
        "👥 [MemberTasks] Loading department members for task:",
        departmentTaskId
      );
      dispatch(fetchDepartmentMemberTasks(departmentTaskId));
    } else if (viewMode === "user" && currentUser?.id) {
      console.log(
        "👥 [MemberTasks] Loading user tasks for user:",
        currentUser.id
      );
      dispatch(fetchUserMemberTasks({ userId: currentUser.id, status: null }));
    }
  }, [dispatch, departmentTaskId, currentUser, viewMode]);

  const handleAssignTask = async (taskData) => {
    try {
      const deptTaskId = selectedDepartmentTask || departmentTaskId;
      await dispatch(
        assignTaskToMember({ departmentTaskId: deptTaskId, taskData })
      ).unwrap();
      toast.success("Giao công việc thành công!");
      setAssignDialogOpen(false);
      setSelectedDepartmentTask("");

      if (viewMode === "department") {
        dispatch(fetchDepartmentMemberTasks(departmentTaskId));
      } else {
        dispatch(
          fetchUserMemberTasks({ userId: currentUser.id, status: null })
        );
      }
    } catch (error) {
      toast.error(error || "Không thể giao công việc");
    }
  };

  const handleStart = (task) => {
    setActionDialog({ open: true, type: "start", task, notes: "" });
  };

  const handleSubmit = (task) => {
    setActionDialog({ open: true, type: "submit", task, notes: "" });
  };

  const handleApprove = (task) => {
    setActionDialog({ open: true, type: "approve", task, notes: "" });
  };

  const handleReject = (task) => {
    setActionDialog({ open: true, type: "reject", task, notes: "" });
  };

  const handleUpdateProgress = (task) => {
    setActionDialog({
      open: true,
      type: "updateProgress",
      task,
      notes: "",
      progress: task.progress || 0,
      actualHours: task.actual_hours || 0,
    });
  };

  const handleActionConfirm = async () => {
    const { type, task, notes, progress, actualHours } = actionDialog;

    try {
      switch (type) {
        case "start":
          await dispatch(startMemberTask(task.id)).unwrap();
          toast.success("Đã bắt đầu công việc!");
          break;
        case "submit":
          await dispatch(submitMemberTask({ taskId: task.id, notes })).unwrap();
          toast.success("Đã nộp công việc!");
          break;
        case "approve":
          await dispatch(
            approveMemberTask({ taskId: task.id, notes })
          ).unwrap();
          toast.success("Đã phê duyệt công việc!");
          break;
        case "reject":
          if (!notes.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
          }
          // Call reject API
          toast.success("Đã từ chối công việc!");
          break;
        case "updateProgress":
          await dispatch(
            updateMemberTaskProgress({
              taskId: task.id,
              progress,
              actualHours,
            })
          ).unwrap();
          toast.success("Đã cập nhật tiến độ!");
          break;
        default:
          break;
      }
      setActionDialog({
        open: false,
        type: null,
        task: null,
        notes: "",
        progress: 0,
        actualHours: 0,
      });

      // Refresh task list
      if (viewMode === "department") {
        dispatch(fetchDepartmentMemberTasks(departmentTaskId));
      } else {
        dispatch(
          fetchUserMemberTasks({ userId: currentUser.id, status: null })
        );
      }
    } catch (error) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  const handleViewDetails = (task) => {
    // Open progress update dialog
    handleUpdateProgress(task);
  };

  const filteredTasks =
    statusFilter === "all"
      ? memberTasks || []
      : (memberTasks || []).filter((task) => task.status === statusFilter);

  const canAssignTask =
    currentUser?.roles?.includes("department_manager") ||
    currentUser?.roles?.includes("admin") ||
    currentUser?.roles?.includes("system_admin");

  const getActionDialogTitle = () => {
    switch (actionDialog.type) {
      case "start":
        return "Bắt Đầu Làm Việc";
      case "submit":
        return "Nộp Công Việc";
      case "approve":
        return "Phê Duyệt Công Việc";
      case "reject":
        return "Từ Chối Công Việc";
      case "updateProgress":
        return "Cập Nhật Tiến Độ";
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
        <Typography variant="h5" fontWeight="bold">
          {viewMode === "user" ? "Công Việc Của Tôi" : "Công Việc Nhân Viên"}
        </Typography>
        {canAssignTask && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAssignDialogOpen(true)}
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
        >
          <Tab label="Tất cả" value="all" />
          <Tab label="Đã giao" value="assigned" />
          <Tab label="Đang làm" value="in_progress" />
          <Tab label="Đã nộp" value="submitted" />
          <Tab label="Đã duyệt" value="approved" />
        </Tabs>
      </Box>

      {/* Loading State */}
      {loading.memberTasks && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error.memberTasks && !loading.memberTasks && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.memberTasks}
        </Alert>
      )}

      {/* Task List */}
      {!loading.memberTasks && !error.memberTasks && (
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
                  Giao Công Việc
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredTasks.map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task.id}>
                  <MemberTaskCard
                    task={task}
                    onStart={handleStart}
                    onSubmit={handleSubmit}
                    onApprove={handleApprove}
                    onReject={handleReject}
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
      <AssignMemberTaskDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setSelectedDepartmentTask("");
        }}
        onAssign={handleAssignTask}
        users={users}
        departmentTask={departmentTasks?.find(
          (dt) => dt.id === (selectedDepartmentTask || departmentTaskId)
        )}
        loading={loading.action}
        error={error.action}
      />

      {/* Department Task Selection for Multiple Department Tasks */}
      {assignDialogOpen && !departmentTaskId && departmentTasks?.length > 0 && (
        <Dialog open maxWidth="xs" fullWidth>
          <DialogTitle>Chọn Công Việc Phòng Ban</DialogTitle>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Công việc phòng ban"
              value={selectedDepartmentTask}
              onChange={(e) => setSelectedDepartmentTask(e.target.value)}
            >
              {departmentTasks.map((dt) => (
                <MenuItem key={dt.id} value={dt.id}>
                  {dt.title}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedDepartmentTask("");
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              disabled={!selectedDepartmentTask}
              onClick={() => {
                // Dialog will reopen with department task selected
              }}
            >
              Tiếp tục
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() =>
          setActionDialog({
            open: false,
            type: null,
            task: null,
            notes: "",
            progress: 0,
            actualHours: 0,
          })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{getActionDialogTitle()}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            Công việc: <strong>{actionDialog.task?.title}</strong>
          </Typography>

          {actionDialog.type === "updateProgress" && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Tiến độ (%)"
                value={actionDialog.progress}
                onChange={(e) =>
                  setActionDialog({
                    ...actionDialog,
                    progress: Math.min(
                      100,
                      Math.max(0, parseInt(e.target.value) || 0)
                    ),
                  })
                }
                inputProps={{ min: 0, max: 100 }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Số giờ đã làm"
                value={actionDialog.actualHours}
                onChange={(e) =>
                  setActionDialog({
                    ...actionDialog,
                    actualHours: parseInt(e.target.value) || 0,
                  })
                }
                inputProps={{ min: 0 }}
              />
            </Box>
          )}

          {(actionDialog.type === "submit" ||
            actionDialog.type === "approve" ||
            actionDialog.type === "reject") && (
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
          )}

          {actionDialog.type === "start" && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Bạn có chắc chắn muốn bắt đầu công việc này?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setActionDialog({
                open: false,
                type: null,
                task: null,
                notes: "",
                progress: 0,
                actualHours: 0,
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
    </Box>
  );
};

export default MemberTasksTab;
