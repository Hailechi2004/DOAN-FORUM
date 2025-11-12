import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const WARNING_TYPE_CONFIG = {
  late_submission: { label: "Nộp muộn", color: "warning" },
  poor_quality: { label: "Chất lượng kém", color: "error" },
  missed_deadline: { label: "Quá hạn", color: "error" },
  incomplete_work: { label: "Làm dở", color: "warning" },
  other: { label: "Khác", color: "default" },
};

const SEVERITY_CONFIG = {
  low: { label: "Thấp", color: "default" },
  medium: { label: "Trung bình", color: "info" },
  high: { label: "Cao", color: "warning" },
  critical: { label: "Nghiêm trọng", color: "error" },
};

const WarningCard = ({ warning, onAcknowledge, canAcknowledge }) => {
  const typeConfig =
    WARNING_TYPE_CONFIG[warning.warning_type] || WARNING_TYPE_CONFIG.other;
  const severityConfig =
    SEVERITY_CONFIG[warning.severity] || SEVERITY_CONFIG.medium;

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: warning.acknowledged
          ? "divider"
          : severityConfig.color + ".main",
      }}
    >
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
            <WarningIcon color={severityConfig.color} />
            <Chip
              label={typeConfig.label}
              color={typeConfig.color}
              size="small"
            />
            <Chip
              label={severityConfig.label}
              color={severityConfig.color}
              size="small"
              variant="outlined"
            />
          </Box>
          {warning.acknowledged && (
            <Chip
              label="Đã xác nhận"
              color="success"
              size="small"
              icon={<CheckIcon />}
            />
          )}
        </Box>

        {/* Project Info */}
        {warning.project_name && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            gutterBottom
          >
            Dự án: {warning.project_name}
          </Typography>
        )}

        {/* Warned User */}
        <Typography variant="subtitle2" gutterBottom>
          Người bị cảnh báo: {warning.warned_user_name || "Không rõ"}
        </Typography>

        {/* Reason */}
        <Typography variant="body2" color="text.secondary" paragraph>
          {warning.reason}
        </Typography>

        {/* Penalty */}
        {warning.penalty_amount > 0 && (
          <Box sx={{ mb: 1, p: 1, bgcolor: "error.light", borderRadius: 1 }}>
            <Typography variant="body2" color="error.dark" fontWeight="bold">
              Phạt: {warning.penalty_amount.toLocaleString("vi-VN")} VNĐ
            </Typography>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Người phát hành: {warning.issued_by_name}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Thời gian:{" "}
            {warning.issued_at
              ? format(new Date(warning.issued_at), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })
              : ""}
          </Typography>
          {warning.acknowledged_at && (
            <Typography variant="caption" color="success.main" display="block">
              Đã xác nhận:{" "}
              {format(new Date(warning.acknowledged_at), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </Typography>
          )}
        </Box>

        {/* Acknowledge Button */}
        {canAcknowledge && !warning.acknowledged && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => onAcknowledge(warning)}
            sx={{ mt: 2 }}
          >
            Xác Nhận Đã Đọc
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WarningCard;
