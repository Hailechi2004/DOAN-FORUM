import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
  Typography,
  Alert,
} from "@mui/material";
import { useSnackbar } from "notistack";
import axiosInstance from "../../utils/axios";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function AssignDepartmentsDialog({ open, onClose, project, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const [departments, setDepartments] = useState([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadDepartments();
      if (project) {
        loadProjectDepartments();
      }
    }
  }, [open, project]);

  const loadDepartments = async () => {
    try {
      const response = await axiosInstance.get("/departments");
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const loadProjectDepartments = async () => {
    try {
      const response = await axiosInstance.get(
        `/projects/${project.id}/departments`
      );
      const assignedDepts = response.data || [];
      setSelectedDeptIds(assignedDepts.map((d) => d.department_id));
    } catch (error) {
      console.error("Error loading project departments:", error);
    }
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedDeptIds(typeof value === "string" ? value.split(",") : value);
  };

  const handleSubmit = async () => {
    if (selectedDeptIds.length === 0) {
      enqueueSnackbar("Please select at least one department", {
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`/projects/${project.id}/departments`, {
        department_ids: selectedDeptIds,
      });

      enqueueSnackbar("Departments assigned successfully!", {
        variant: "success",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to assign departments",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Departments to Project</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Select departments that will participate in this project. Department
            managers will be notified and can assign their teams and members.
          </Alert>

          <Typography variant="subtitle2" gutterBottom>
            Project: <strong>{project?.name}</strong>
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Departments</InputLabel>
            <Select
              multiple
              value={selectedDeptIds}
              onChange={handleChange}
              input={<OutlinedInput label="Departments" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const dept = departments.find((d) => d.id === value);
                    return (
                      <Chip
                        key={value}
                        label={dept?.name || `ID: ${value}`}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name} {dept.code && `(${dept.code})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedDeptIds.length > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              {selectedDeptIds.length} department(s) selected
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || selectedDeptIds.length === 0}
        >
          {loading ? "Assigning..." : "Assign Departments"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AssignDepartmentsDialog;
