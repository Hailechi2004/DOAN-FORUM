import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  LinearProgress,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const STATUS_CONFIG = {
  assigned: { label: "Đã giao", color: "default" },
  in_progress: { label: "Đang thực hiện", color: "info" },
  submitted: { label: "Đã nộp", color: "warning" },
  approved: { label: "Đã duyệt", color: "success" },
  rejected: { label: "Bị từ chối", color: "error" },
  completed: { label: "Hoàn thành", color: "success" },
};

const PRIORITY_CONFIG = {
  low: { label: "Thấp", color: "default" },
  medium: { label: "Trung bình", color: "info" },
  high: { label: "Cao", color: "warning" },
  critical: { label: "Khẩn cấp", color: "error" },
};

const DepartmentTaskDetailDialog = ({
  open,
  onClose,
  task,
  onEdit,
  onDelete,
}) => {
  if (!task) return null;

  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.assigned;
  const priorityConfig =
    PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
          boxShadow: "0 12px 48px rgba(33, 150, 243, 0.3)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
            Chi Tiết Công Việc
          </Typography>
          <Chip
            label={statusConfig.label}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: 600,
            }}
          />
          <Chip
            label={priorityConfig.label}
            sx={{
              background:
                priorityConfig.color === "warning"
                  ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                  : "rgba(255, 255, 255, 0.2)",
              color: priorityConfig.color === "warning" ? "#000" : "white",
              fontWeight: 600,
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {task.description || "Không có mô tả"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Phòng ban:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {task.department_name || "N/A"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Hạn chót:
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                color={
                  task.deadline && new Date(task.deadline) < new Date()
                    ? "error"
                    : "text.primary"
                }
              >
                {task.deadline
                  ? format(new Date(task.deadline), "dd/MM/yyyy", {
                      locale: vi,
                    })
                  : "Không có"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <TimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Giờ ước tính:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {task.estimated_hours || 0}h
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Giờ thực tế:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {task.actual_hours || 0}h
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {task.progress !== undefined && (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Tiến độ
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {task.progress || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={task.progress || 0}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {task.submission_notes && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ghi chú nộp bài:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {task.submission_notes}
            </Typography>
          </Box>
        )}

        {task.approval_notes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ghi chú phê duyệt:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {task.approval_notes}
            </Typography>
          </Box>
        )}

        {task.rejection_reason && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="error">
              Lý do từ chối:
            </Typography>
            <Typography variant="body2" color="error">
              {task.rejection_reason}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {onDelete && (
            <Button
              onClick={() => {
                if (
                  window.confirm("Bạn có chắc chắn muốn xóa công việc này?")
                ) {
                  onDelete(task.id);
                  onClose();
                }
              }}
              startIcon={<DeleteIcon />}
              color="error"
              variant="outlined"
            >
              Xóa
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(task);
                onClose();
              }}
              startIcon={<EditIcon />}
              variant="contained"
            >
              Chỉnh sửa
            </Button>
          )}
          <Button onClick={onClose} variant="outlined">
            Đóng
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DepartmentTaskDetailDialog;
