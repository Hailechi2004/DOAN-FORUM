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
  Avatar,
} from "@mui/material";
import {
  PlayArrow as StartIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const STATUS_CONFIG = {
  assigned: { label: "Đã giao", color: "default" },
  in_progress: { label: "Đang làm", color: "info" },
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

const MemberTaskCard = ({
  task,
  onStart,
  onSubmit,
  onApprove,
  onReject,
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

  const isMyTask = task.user_id === currentUser?.id;
  const isManager =
    currentUser?.roles?.includes("department_manager") ||
    currentUser?.roles?.includes("admin") ||
    currentUser?.roles?.includes("system_admin");

  // Permission checks
  const canStart = isMyTask && task.status === "assigned";
  const canSubmit = isMyTask && task.status === "in_progress";
  const canApprove = isManager && task.status === "submitted";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: isOverdue ? "2px solid" : "1px solid",
        borderColor: isOverdue ? "error.main" : "divider",
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
          }}
        >
          {task.title}
        </Typography>

        {/* Assigned User */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Avatar
            sx={{ width: 28, height: 28 }}
            src={task.avatar_url}
            alt={task.username}
          >
            {task.username?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {task.username || "Chưa có"}
          </Typography>
          {isMyTask && (
            <Chip
              label="Của tôi"
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

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

          {task.started_at && (
            <Typography variant="caption" color="text.secondary">
              Bắt đầu:{" "}
              {format(new Date(task.started_at), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </Typography>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
          {/* Start Button (Member, when status = assigned) */}
          {canStart && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<StartIcon />}
              onClick={() => onStart(task)}
              fullWidth
            >
              Bắt đầu
            </Button>
          )}

          {/* Submit Button (Member, when status = in_progress) */}
          {canSubmit && (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => onSubmit(task)}
              fullWidth
            >
              Nộp bài
            </Button>
          )}

          {/* Approve/Reject Buttons (Manager, when status = submitted) */}
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
                Duyệt
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

          {/* View Details Button */}
          {!canStart && !canSubmit && !canApprove && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onViewDetails(task)}
              fullWidth
            >
              Xem chi tiết
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
};

export default MemberTaskCard;
