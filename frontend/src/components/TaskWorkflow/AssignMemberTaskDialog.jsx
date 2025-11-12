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
  Typography,
  Avatar,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { vi } from "date-fns/locale";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "critical", label: "Khẩn cấp" },
];

const AssignMemberTaskDialog = ({
  open,
  onClose,
  onAssign,
  users,
  departmentTask,
  loading,
  error,
}) => {
  const [formData, setFormData] = useState({
    user_id: "",
    title: "",
    description: "",
    priority: "medium",
    deadline: null,
    estimated_hours: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!open) {
      setFormData({
        user_id: "",
        title: "",
        description: "",
        priority: "medium",
        deadline: null,
        estimated_hours: "",
      });
      setErrors({});
      setSelectedUser(null);
    }
  }, [open]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [field]: value,
    });

    // Update selected user when user_id changes
    if (field === "user_id") {
      const user = users?.find((u) => u.id === value);
      setSelectedUser(user);
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      deadline: date,
    });
    if (errors.deadline) {
      setErrors({
        ...errors,
        deadline: null,
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.user_id) {
      newErrors.user_id = "Vui lòng chọn nhân viên";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả";
    }
    if (!formData.deadline) {
      newErrors.deadline = "Vui lòng chọn deadline";
    } else if (new Date(formData.deadline) < new Date()) {
      newErrors.deadline = "Deadline phải là ngày trong tương lai";
    }
    if (!formData.estimated_hours || formData.estimated_hours <= 0) {
      newErrors.estimated_hours = "Vui lòng nhập số giờ dự kiến hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const taskData = {
      ...formData,
      deadline: formData.deadline
        ? formData.deadline.toISOString().split("T")[0]
        : null,
      estimated_hours: parseInt(formData.estimated_hours),
    };

    await onAssign(taskData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Giao Công Việc Cho Nhân Viên
        {departmentTask && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Thuộc: {departmentTask.title}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* User Selection */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Nhân Viên *"
                value={formData.user_id}
                onChange={handleChange("user_id")}
                error={!!errors.user_id}
                helperText={errors.user_id}
                disabled={loading}
              >
                <MenuItem value="">-- Chọn nhân viên --</MenuItem>
                {users?.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ width: 24, height: 24 }}
                        src={user.avatar_url}
                        alt={user.username}
                      >
                        {user.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <span>{user.username}</span>
                      <Typography variant="caption" color="text.secondary">
                        ({user.email})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {/* Show selected user workload if available */}
              {selectedUser?.workload && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: "background.default",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Khối lượng công việc hiện tại:{" "}
                    {selectedUser.workload.total_tasks} công việc,
                    {selectedUser.workload.total_hours}h
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu Đề *"
                value={formData.title}
                onChange={handleChange("title")}
                error={!!errors.title}
                helperText={errors.title}
                disabled={loading}
                placeholder="VD: Implement JWT token generation"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mô Tả *"
                value={formData.description}
                onChange={handleChange("description")}
                error={!!errors.description}
                helperText={errors.description}
                disabled={loading}
                placeholder="Mô tả chi tiết công việc cần làm..."
              />
            </Grid>

            {/* Priority & Estimated Hours */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Độ Ưu Tiên *"
                value={formData.priority}
                onChange={handleChange("priority")}
                disabled={loading}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Số Giờ Dự Kiến *"
                value={formData.estimated_hours}
                onChange={handleChange("estimated_hours")}
                error={!!errors.estimated_hours}
                helperText={errors.estimated_hours}
                disabled={loading}
                inputProps={{ min: 1 }}
                placeholder="VD: 40"
              />
            </Grid>

            {/* Deadline */}
            <Grid item xs={12}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={vi}
              >
                <DatePicker
                  label="Deadline *"
                  value={formData.deadline}
                  onChange={handleDateChange}
                  disabled={loading}
                  minDate={new Date()}
                  maxDate={
                    departmentTask?.deadline
                      ? new Date(departmentTask.deadline)
                      : null
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.deadline,
                      helperText:
                        errors.deadline ||
                        (departmentTask?.deadline
                          ? `Tối đa: ${new Date(
                              departmentTask.deadline
                            ).toLocaleDateString("vi-VN")}`
                          : ""),
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang giao việc..." : "Giao Việc"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignMemberTaskDialog;
