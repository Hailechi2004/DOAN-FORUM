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

const REPORT_TYPES = [
  { value: "daily", label: "Hàng ngày" },
  { value: "weekly", label: "Hàng tuần" },
  { value: "monthly", label: "Hàng tháng" },
  { value: "completion", label: "Hoàn thành" },
  { value: "issue", label: "Vấn đề" },
];

const CreateReportDialog = ({
  open,
  onClose,
  onCreate,
  projectId,
  departmentTaskId,
  memberTaskId,
  loading,
  error,
}) => {
  const [formData, setFormData] = useState({
    report_type: "weekly",
    title: "",
    content: "",
    progress: "",
    issues: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setFormData({
        report_type: "weekly",
        title: "",
        content: "",
        progress: "",
        issues: "",
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
    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
    if (!formData.content.trim()) newErrors.content = "Vui lòng nhập nội dung";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const reportData = {
      project_id: projectId,
      department_task_id: departmentTaskId || null,
      member_task_id: memberTaskId || null,
      ...formData,
      progress: formData.progress ? parseInt(formData.progress) : null,
      issues: formData.issues || null,
    };

    await onCreate(reportData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Tạo Báo Cáo</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Loại Báo Cáo *"
                value={formData.report_type}
                onChange={handleChange("report_type")}
                disabled={loading}
              >
                {REPORT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Tiến độ (%)"
                value={formData.progress}
                onChange={handleChange("progress")}
                disabled={loading}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu Đề *"
                value={formData.title}
                onChange={handleChange("title")}
                error={!!errors.title}
                helperText={errors.title}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Nội Dung *"
                value={formData.content}
                onChange={handleChange("content")}
                error={!!errors.content}
                helperText={errors.content}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Vấn Đề (nếu có)"
                value={formData.issues}
                onChange={handleChange("issues")}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo Báo Cáo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateReportDialog;
