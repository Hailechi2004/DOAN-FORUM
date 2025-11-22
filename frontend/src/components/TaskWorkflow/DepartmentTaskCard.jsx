import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Box,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
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

const DepartmentTaskCard = ({
  task,
  onAccept,
  onReject,
  onSubmit,
  onApprove,
  onViewDetails,
  currentUser,
}) => {
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.assigned;
  const priorityConfig =
    PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "completed" &&
    task.status !== "approved";

  // Get role codes from user
  const userRoleCodes = currentUser?.roles?.map((r) => r.code || r) || [];
  const userRoleNames = currentUser?.roleNames || [];

  // Debug: Log currentUser structure
  console.log("🔍 [DepartmentTaskCard] Debug:", {
    taskId: task.id,
    taskStatus: task.status,
    userRoleCodes,
    userRoleNames,
    currentUserRoles: currentUser?.roles,
  });

  // Check if user is Admin
  const isAdmin =
    userRoleCodes.includes("admin") ||
    userRoleCodes.includes("system_admin") ||
    userRoleNames.includes("System Admin") ||
    userRoleNames.includes("Administrator");

  // Check if user is Manager
  const isManager =
    userRoleCodes.includes("department_manager") ||
    userRoleCodes.includes("manager") ||
    userRoleNames.includes("Department Manager") ||
    userRoleNames.includes("Manager");

  // Check permissions based on user role
  // ADMIN: Only approve/reject submitted tasks
  // MANAGER: Accept assigned tasks, submit in_progress tasks
  const canAccept =
    !isAdmin && // Admin KHÔNG được accept
    isManager && // Chỉ Manager
    task.status === "assigned";

  const canSubmit =
    !isAdmin && // Admin KHÔNG được submit
    isManager && // Chỉ Manager
    task.status === "in_progress";

  const canApprove =
    isAdmin && // Chỉ Admin
    task.status === "submitted";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: isOverdue ? "2px solid" : "1px solid",
        borderColor: isOverdue ? "error.main" : "divider",
        background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
        boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(33, 150, 243, 0.2)",
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Priority Badge */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <Chip
          label={priorityConfig.label}
          color={priorityConfig.color}
          size="small"
          sx={{
            fontWeight: 600,
            background:
              priorityConfig.color === "warning"
                ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                : undefined,
            color: priorityConfig.color === "warning" ? "#000" : undefined,
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            pr: 8,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            fontWeight: 700,
            background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {task.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {task.description}
        </Typography>

        {/* Status & Progress */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Chip
              label={statusConfig.label}
              color={statusConfig.color}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {task.progress || 0}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={task.progress || 0}
            color={statusConfig.color}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>

        {/* Info Details */}
        <Stack spacing={1}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Phòng: {task.department_name || "Chưa xác định"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography
              variant="body2"
              color={isOverdue ? "error" : "text.secondary"}
            >
              Hạn:{" "}
              {task.deadline
                ? format(new Date(task.deadline), "dd/MM/yyyy", { locale: vi })
                : "Không có"}
              {isOverdue && " (Quá hạn)"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Giờ: {task.actual_hours || 0}/{task.estimated_hours || 0}h
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
          {/* Accept Button (Manager only, when status = assigned) */}
          {canAccept && (
            <>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckIcon />}
                onClick={() => onAccept(task)}
                fullWidth
              >
                Nhận việc
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => onReject(task)}
                fullWidth
              >
                Từ chối
              </Button>
            </>
          )}

          {/* Submit Button (Manager, when status = in_progress) */}
          {canSubmit && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => onSubmit(task)}
              fullWidth
            >
              Nộp bài
            </Button>
          )}

          {/* Approve Button (Admin only, when status = submitted) */}
          {canApprove && (
            <>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckIcon />}
                onClick={() => onApprove(task)}
                fullWidth
              >
                Phê duyệt
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => onReject(task)}
                fullWidth
              >
                Từ chối
              </Button>
            </>
          )}

          {/* View Details Button (Always available) */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => onViewDetails?.(task)}
            fullWidth
          >
            Xem chi tiết
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default DepartmentTaskCard;
