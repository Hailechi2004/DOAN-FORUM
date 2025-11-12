import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Tooltip,
  Alert,
  Paper,
  Divider,
  Autocomplete,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  Add,
  Assignment,
  People,
  Description,
  CalendarToday,
  Flag,
  CheckCircle,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import axiosInstance from "../../utils/axios";
import { format } from "date-fns";

const ManagerProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state) => state.auth);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Task Dialog States
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    assigned_to: null,
    team_id: null,
    priority: "medium",
    status: "todo",
    due_date: "",
  });

  useEffect(() => {
    if (user?.department_id) {
      fetchProjectData();
      fetchTeams();
      fetchDepartmentMembers();
    }
  }, [id, user?.department_id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        axiosInstance.get(`/projects/${id}`),
        axiosInstance.get(`/tasks`, { params: { project_id: id } }),
      ]);

      setProject(projectRes.data.data || projectRes.data);
      const tasksData = tasksRes.data.data || tasksRes.data;
      setTasks(tasksData.tasks || tasksData || []);
    } catch (error) {
      console.error("Failed to fetch project data:", error);
      enqueueSnackbar("Failed to load project data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axiosInstance.get("/teams", {
        params: { department_id: user.department_id },
      });
      const data = response.data.data || response.data;
      setTeams(data.teams || data || []);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const fetchDepartmentMembers = async () => {
    try {
      const response = await axiosInstance.get(
        `/departments/${user.department_id}/members`
      );
      setMembers(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  const handleOpenTaskDialog = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setTaskFormData({
        title: task.title,
        description: task.description || "",
        assigned_to: task.assigned_to || null,
        team_id: task.team_id || null,
        priority: task.priority || "medium",
        status: task.status || "todo",
        due_date: task.due_date
          ? format(new Date(task.due_date), "yyyy-MM-dd")
          : "",
      });
    } else {
      setSelectedTask(null);
      setTaskFormData({
        title: "",
        description: "",
        assigned_to: null,
        team_id: null,
        priority: "medium",
        status: "todo",
        due_date: "",
      });
    }
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setSelectedTask(null);
  };

  const handleSaveTask = async () => {
    try {
      const taskData = {
        ...taskFormData,
        project_id: parseInt(id),
        department_id: user.department_id,
      };

      if (selectedTask) {
        await axiosInstance.put(`/tasks/${selectedTask.id}`, taskData);
        enqueueSnackbar("Task updated successfully", { variant: "success" });
      } else {
        await axiosInstance.post("/tasks", taskData);
        enqueueSnackbar("Task created successfully", { variant: "success" });
      }

      handleCloseTaskDialog();
      fetchProjectData();
    } catch (error) {
      console.error("Failed to save task:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to save task", {
        variant: "error",
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      enqueueSnackbar("Task deleted successfully", { variant: "success" });
      fetchProjectData();
    } catch (error) {
      console.error("Failed to delete task:", error);
      enqueueSnackbar("Failed to delete task", { variant: "error" });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: "info",
      in_progress: "warning",
      completed: "success",
      cancelled: "error",
      on_hold: "default",
      todo: "default",
      done: "success",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "success",
      medium: "info",
      high: "warning",
      urgent: "error",
    };
    return colors[priority] || "default";
  };

  const getTaskProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(
      (t) => t.status === "done" || t.status === "completed"
    ).length;
    return Math.round((completed / tasks.length) * 100);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Project not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/manager/projects")}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>

        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {project.name}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
              <Chip
                label={project.status}
                color={getStatusColor(project.status)}
                size="small"
              />
              <Chip
                label={project.priority}
                color={getPriorityColor(project.priority)}
                size="small"
              />
              {project.department_name && (
                <Chip
                  icon={<People />}
                  label={project.department_name}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Project Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Description sx={{ mr: 1, verticalAlign: "middle" }} />
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {project.description || "No description provided"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body2">
                    <CalendarToday
                      sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                    />
                    {project.start_date
                      ? format(new Date(project.start_date), "MMM dd, yyyy")
                      : "Not set"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body2">
                    <CalendarToday
                      sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                    />
                    {project.end_date
                      ? format(new Date(project.end_date), "MMM dd, yyyy")
                      : "Not set"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Tasks Completed
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {getTaskProgress()}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getTaskProgress()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Total Tasks
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {tasks.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Tasks" icon={<Assignment />} iconPosition="start" />
        </Tabs>

        {/* Tasks Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Project Tasks</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenTaskDialog()}
              >
                Add Task
              </Button>
            </Box>

            {tasks.length === 0 ? (
              <Alert severity="info">
                No tasks yet. Click "Add Task" to create one.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Team</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {task.description.substring(0, 50)}
                              {task.description.length > 50 && "..."}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.assigned_to_name ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 24, height: 24 }}>
                                {task.assigned_to_name[0]}
                              </Avatar>
                              <Typography variant="body2">
                                {task.assigned_to_name}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Unassigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.team_name || (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              No team
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.priority}
                            color={getPriorityColor(task.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.status}
                            color={getStatusColor(task.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {task.due_date
                            ? format(new Date(task.due_date), "MMM dd, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenTaskDialog(task)}
                              color="primary"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTask(task.id)}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>

      {/* Task Dialog */}
      <Dialog
        open={openTaskDialog}
        onClose={handleCloseTaskDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={taskFormData.title}
                onChange={(e) =>
                  setTaskFormData({ ...taskFormData, title: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={taskFormData.description}
                onChange={(e) =>
                  setTaskFormData({
                    ...taskFormData,
                    description: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={taskFormData.priority}
                  label="Priority"
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      priority: e.target.value,
                    })
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={taskFormData.status}
                  label="Status"
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, status: e.target.value })
                  }
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={members}
                getOptionLabel={(option) =>
                  option.full_name || option.username || ""
                }
                value={
                  members.find((m) => m.id === taskFormData.assigned_to) || null
                }
                onChange={(e, newValue) =>
                  setTaskFormData({
                    ...taskFormData,
                    assigned_to: newValue?.id || null,
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Assign To" />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Team</InputLabel>
                <Select
                  value={taskFormData.team_id || ""}
                  label="Team"
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      team_id: e.target.value || null,
                    })
                  }
                >
                  <MenuItem value="">
                    <em>No Team</em>
                  </MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={taskFormData.due_date}
                onChange={(e) =>
                  setTaskFormData({
                    ...taskFormData,
                    due_date: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Cancel</Button>
          <Button
            onClick={handleSaveTask}
            variant="contained"
            disabled={!taskFormData.title}
          >
            {selectedTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerProjectDetail;
