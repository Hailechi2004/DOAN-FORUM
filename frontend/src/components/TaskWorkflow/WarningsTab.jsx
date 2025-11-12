import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import WarningCard from "./WarningCard";
import IssueWarningDialog from "./IssueWarningDialog";
import {
  fetchProjectWarnings,
  issueWarning,
  acknowledgeWarning,
  clearErrors,
  fetchProjectDepartmentTasks,
  fetchProjectMemberTasks,
} from "../../features/taskWorkflow/taskWorkflowSlice";

const WarningsTab = ({ projectId, users, currentUser }) => {
  const dispatch = useDispatch();
  const { warnings, departmentTasks, memberTasks, loading, error } =
    useSelector((state) => state.taskWorkflow);

  const [severityFilter, setSeverityFilter] = useState("all");
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [showOverdueSuggestion, setShowOverdueSuggestion] = useState(true);

  const isAuthorized =
    currentUser?.roleNames?.includes("System Admin") ||
    currentUser?.roleNames?.includes("Administrator") ||
    currentUser?.roleNames?.includes("Department Manager") ||
    currentUser?.roles?.some(
      (r) =>
        r.name === "System Admin" ||
        r.name === "Administrator" ||
        r.name === "Department Manager"
    );

  console.log("🔑 [Warnings] Permission check:", {
    currentUser,
    isAuthorized,
    roleNames: currentUser?.roleNames,
    roles: currentUser?.roles,
  });

  useEffect(() => {
    if (projectId) {
      console.log("⚠️ [Warnings] Loading warnings for project:", projectId);
      dispatch(fetchProjectWarnings(projectId));
      dispatch(fetchProjectDepartmentTasks(projectId));
      dispatch(fetchProjectMemberTasks({ projectId }));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (error?.warnings) {
      toast.error(error.warnings);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  // Calculate overdue tasks
  const overdueDepartmentTasks = (departmentTasks || []).filter((task) => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    const now = new Date();
    return deadline < now && !["approved", "rejected"].includes(task.status);
  });

  const overdueMemberTasks = (memberTasks || []).filter((task) => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    const now = new Date();
    return deadline < now && !["completed", "cancelled"].includes(task.status);
  });

  const totalOverdue =
    overdueDepartmentTasks.length + overdueMemberTasks.length;

  const filteredWarnings = (warnings || []).filter((warning) => {
    if (severityFilter === "all") return true;
    return warning.severity === severityFilter;
  });

  const handleIssueWarning = async (warningData) => {
    try {
      await dispatch(issueWarning(warningData)).unwrap();
      toast.success("Đã phát hành cảnh báo thành công");
      setIssueDialogOpen(false);
    } catch (err) {
      toast.error(err || "Không thể phát hành cảnh báo");
    }
  };

  const handleAcknowledge = async (warningId) => {
    try {
      await dispatch(acknowledgeWarning(warningId)).unwrap();
      toast.success("Đã xác nhận cảnh báo");
    } catch (err) {
      toast.error(err || "Không thể xác nhận cảnh báo");
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          <WarningIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Cảnh Báo & Phạt
        </Typography>
        {isAuthorized && (
          <Button
            variant="contained"
            color="warning"
            onClick={() => setIssueDialogOpen(true)}
            disabled={loading.warnings}
          >
            Phát Hành Cảnh Báo
          </Button>
        )}
      </Box>

      {/* Overdue Tasks Suggestion */}
      {isAuthorized && totalOverdue > 0 && showOverdueSuggestion && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "warning.lighter",
            border: "1px solid",
            borderColor: "warning.main",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <ErrorIcon color="warning" sx={{ mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Phát hiện {totalOverdue} công việc quá hạn!
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Có {overdueDepartmentTasks.length} công việc phòng ban và{" "}
                {overdueMemberTasks.length} công việc cá nhân đã quá hạn chưa
                hoàn thành. Bạn có muốn gửi cảnh báo?
              </Typography>
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={() => setIssueDialogOpen(true)}
                >
                  Phát Hành Cảnh Báo
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowOverdueSuggestion(false)}
                >
                  Bỏ Qua
                </Button>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setShowOverdueSuggestion(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Severity Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={severityFilter}
          onChange={(e, newValue) => setSeverityFilter(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Tất cả" value="all" />
          <Tab label="Thấp" value="low" />
          <Tab label="Trung bình" value="medium" />
          <Tab label="Cao" value="high" />
          <Tab label="Nghiêm trọng" value="critical" />
        </Tabs>
      </Box>

      {/* Loading State */}
      {loading.warnings && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error?.warnings && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.warnings}
        </Alert>
      )}

      {/* Empty State */}
      {!loading.warnings && filteredWarnings.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <WarningIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {severityFilter === "all"
              ? "Chưa có cảnh báo nào"
              : `Không có cảnh báo mức ${severityFilter}`}
          </Typography>
        </Box>
      )}

      {/* Warnings Grid */}
      {!loading.warnings && filteredWarnings.length > 0 && (
        <Grid container spacing={2}>
          {filteredWarnings.map((warning) => (
            <Grid item xs={12} sm={6} md={4} key={warning.id}>
              <WarningCard
                warning={warning}
                currentUser={currentUser}
                onAcknowledge={handleAcknowledge}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Issue Warning Dialog */}
      <IssueWarningDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        onIssue={handleIssueWarning}
        projectId={projectId}
        users={users}
        loading={loading.warnings}
        error={error?.warnings}
      />
    </Box>
  );
};

export default WarningsTab;
