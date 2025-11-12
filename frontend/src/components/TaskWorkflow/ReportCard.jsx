import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const REPORT_TYPE_CONFIG = {
  daily: { label: "Hàng ngày", color: "default", icon: <DescriptionIcon /> },
  weekly: { label: "Hàng tuần", color: "primary", icon: <DescriptionIcon /> },
  monthly: {
    label: "Hàng tháng",
    color: "secondary",
    icon: <DescriptionIcon />,
  },
  completion: {
    label: "Hoàn thành",
    color: "success",
    icon: <DescriptionIcon />,
  },
  issue: { label: "Vấn đề", color: "error", icon: <WarningIcon /> },
};

const ReportCard = ({ report, onEdit, onDelete, canEdit }) => {
  const typeConfig =
    REPORT_TYPE_CONFIG[report.report_type] || REPORT_TYPE_CONFIG.daily;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            {typeConfig.icon}
            <Chip
              label={typeConfig.label}
              color={typeConfig.color}
              size="small"
            />
            {report.progress !== null && report.progress !== undefined && (
              <Chip
                label={`${report.progress}%`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          {canEdit && (
            <Box>
              <IconButton size="small" onClick={() => onEdit(report)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(report)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Title */}
        <Typography variant="h6" gutterBottom>
          {report.title}
        </Typography>

        {/* Content */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            mb: 2,
          }}
        >
          {report.content}
        </Typography>

        {/* Issues if any */}
        {report.issues && (
          <Box sx={{ mb: 2, p: 1, bgcolor: "error.light", borderRadius: 1 }}>
            <Typography variant="caption" color="error.dark" fontWeight="bold">
              Vấn đề:
            </Typography>
            <Typography variant="body2" color="error.dark">
              {report.issues}
            </Typography>
          </Box>
        )}

        {/* Footer Info */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {report.created_by_name || "Không rõ"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {report.created_at
              ? format(new Date(report.created_at), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })
              : ""}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportCard;
