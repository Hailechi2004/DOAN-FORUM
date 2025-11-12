import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  Alert,
  Avatar,
} from "@mui/material";

const WARNING_TYPES = [
  { value: "late_submission", label: "Nộp muộn" },
  { value: "poor_quality", label: "Chất lượng kém" },
  { value: "missed_deadline", label: "Quá hạn" },
  { value: "incomplete_work", label: "Làm dở" },
  { value: "other", label: "Khác" },
];

const SEVERITY_LEVELS = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "critical", label: "Nghiêm trọng" },
];

const IssueWarningDialog = ({
  open,
  onClose,
  onIssue,
  projectId,
  users,
  loading,
  error,
}) => {
  const [formData, setFormData] = useState({
    warned_user_id: "",
    warning_type: "other",
    severity: "medium",
    reason: "",
    penalty_amount: 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setFormData({
        warned_user_id: "",
        warning_type: "other",
        severity: "medium",
        reason: "",
        penalty_amount: 0,
      });
      setErrors({});
    }
  }, [open]);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.warned_user_id)
      newErrors.warned_user_id = "Vui lòng chọn người bị cảnh báo";
    if (!formData.reason.trim())
      newErrors.reason = "Vui lòng nhập lý do cảnh báo";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const warningData = {
      project_id: projectId,
      ...formData,
      penalty_amount: parseFloat(formData.penalty_amount) || 0,
    };

    await onIssue(warningData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Phát Hành Cảnh Báo</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Người Bị Cảnh Báo *"
                value={formData.warned_user_id}
                onChange={handleChange("warned_user_id")}
                error={!!errors.warned_user_id}
                helperText={errors.warned_user_id}
                disabled={loading}
              >
                <MenuItem value="">-- Chọn người dùng --</MenuItem>
                {users?.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ width: 24, height: 24 }}
                        src={user.avatar_url}
                      >
                        {user.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <span>{user.username}</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Loại Vi Phạm *"
                value={formData.warning_type}
                onChange={handleChange("warning_type")}
                disabled={loading}
              >
                {WARNING_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Mức Độ *"
                value={formData.severity}
                onChange={handleChange("severity")}
                disabled={loading}
              >
                {SEVERITY_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Lý Do *"
                value={formData.reason}
                onChange={handleChange("reason")}
                error={!!errors.reason}
                helperText={errors.reason}
                disabled={loading}
                placeholder="Mô tả chi tiết lý do cảnh báo..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Số Tiền Phạt (VNĐ)"
                value={formData.penalty_amount}
                onChange={handleChange("penalty_amount")}
                disabled={loading}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Đang phát hành..." : "Phát Hành"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssueWarningDialog;
