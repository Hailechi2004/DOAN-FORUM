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

const AssignDepartmentTaskDialog = ({
  open,
  onClose,
  onAssign,
  departments,
  loading,
  error,
  initialData = null,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    department_id: "",
    title: "",
    description: "",
    priority: "medium",
    deadline: null,
    estimated_hours: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && initialData && isEdit) {
      // Fill form with initial data for editing
      setFormData({
        department_id: initialData.department_id || "",
        title: initialData.title || "",
        description: initialData.description || "",
        priority: initialData.priority || "medium",
        deadline: initialData.deadline ? new Date(initialData.deadline) : null,
        estimated_hours: initialData.estimated_hours || "",
      });
      setErrors({});
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        department_id: "",
        title: "",
        description: "",
        priority: "medium",
        deadline: null,
        estimated_hours: "",
      });
      setErrors({});
    }
  }, [open, initialData, isEdit]);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
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

    if (!formData.department_id) {
      newErrors.department_id = "Vui lòng chọn phòng ban";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả";
    }
    if (!formData.deadline) {
      newErrors.deadline = "Vui lòng chọn deadline";
    } else if (!isEdit && new Date(formData.deadline) < new Date()) {
      // Only check future date when creating new task
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

    // Format data for API
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
        {isEdit ? "Chỉnh Sửa Công Việc" : "Giao Công Việc Cho Phòng Ban"}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Department Selection */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Phòng Ban *"
                value={formData.department_id}
                onChange={handleChange("department_id")}
                error={!!errors.department_id}
                helperText={errors.department_id}
                disabled={loading || isEdit}
              >
                <MenuItem value="">-- Chọn phòng ban --</MenuItem>
                {departments?.map((dept) => {
                  const deptId = dept.department_id || dept.id;
                  const deptName = dept.department_name || dept.name;
                  return (
                    <MenuItem key={deptId} value={deptId}>
                      {deptName}{" "}
                      {dept.status === "pending" && "(Chưa xác nhận)"}
                    </MenuItem>
                  );
                })}
              </TextField>
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
                placeholder="VD: Phát triển module xác thực người dùng"
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
                placeholder="Mô tả chi tiết về công việc cần thực hiện..."
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
                placeholder="VD: 120"
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
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.deadline,
                      helperText: errors.deadline,
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

export default AssignDepartmentTaskDialog;
