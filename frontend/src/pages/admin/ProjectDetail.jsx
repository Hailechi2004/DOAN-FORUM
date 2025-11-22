import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { fetchProjectById } from "../../store/slices/projectSlice";
import axiosInstance from "../../utils/axios";
import { format } from "date-fns";
import DepartmentTasksTab from "../../components/TaskWorkflow/DepartmentTasksTab";
import MemberTasksTab from "../../components/TaskWorkflow/MemberTasksTab";
import TaskReportsTab from "../../components/TaskWorkflow/TaskReportsTab";
import WarningsTab from "../../components/TaskWorkflow/WarningsTab";
import AssignDepartmentsDialog from "../../components/projects/AssignDepartmentsDialog";
import useTaskWorkflowSocket from "../../hooks/useTaskWorkflowSocket";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { currentProject } = useSelector((state) => state.projects);
  const { user: currentUser } = useSelector((state) => state.auth);

  // Enable realtime socket notifications for task workflow
  useTaskWorkflowSocket(id);

  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]); // Assigned departments
  const [allDepartments, setAllDepartments] = useState([]); // All available departments
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [taskDialog, setTaskDialog] = useState(false);
  const [milestoneDialog, setMilestoneDialog] = useState(false);
  const [commentDialog, setCommentDialog] = useState(false);
  const [assignDepartmentsDialog, setAssignDepartmentsDialog] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    estimated_hours: 0,
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "pending",
  });

  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      loadProjectData();
    }
  }, [id]);

  useEffect(() => {
    if (tabValue === 1) loadTasks();
    else if (tabValue === 2) loadMilestones();
    else if (tabValue === 3) loadComments();
    else if (tabValue === 4) loadFiles();
    else if (tabValue === 5) loadActivities();
    else if (tabValue === 6) loadMembers();
    else if (tabValue === 7) loadDepartments();
    else if (tabValue === 8) {
      // Department Tasks Tab - need assigned departments for task assignment
      if (departments.length === 0) loadDepartments();
    }
  }, [tabValue, departments.length]);

  const loadProjectData = async () => {
    try {
      loadTasks();
      loadMembers();
    } catch (error) {
      console.error("Error loading project data:", error);
    }
  };

  // Tasks
  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}/tasks`);
      console.log("📋 Tasks response:", response);
      setTasks(response.data || response || []);
    } catch (error) {
      enqueueSnackbar("Failed to load tasks", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    try {
      await axiosInstance.post(`/projects/${id}/tasks`, taskForm);
      enqueueSnackbar("Task created successfully!", { variant: "success" });
      setTaskDialog(false);
      setTaskForm({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        estimated_hours: 0,
      });
      loadTasks();
    } catch (error) {
      enqueueSnackbar("Failed to create task", { variant: "error" });
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axiosInstance.delete(`/projects/${id}/tasks/${taskId}`);
      enqueueSnackbar("Task deleted!", { variant: "success" });
      loadTasks();
    } catch (error) {
      enqueueSnackbar("Failed to delete task", { variant: "error" });
    }
  };

  // Milestones
  const loadMilestones = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}/milestones`);
      console.log("🎯 Milestones response:", response);
      setMilestones(response.data || response || []);
    } catch (error) {
      enqueueSnackbar("Failed to load milestones", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async () => {
    try {
      await axiosInstance.post(`/projects/${id}/milestones`, milestoneForm);
      enqueueSnackbar("Milestone created successfully!", {
        variant: "success",
      });
      setMilestoneDialog(false);
      setMilestoneForm({
        title: "",
        description: "",
        due_date: "",
        status: "pending",
      });
      loadMilestones();
    } catch (error) {
      enqueueSnackbar("Failed to create milestone", { variant: "error" });
    }
  };

  // Comments
  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}/comments`);
      console.log("💬 Comments response:", response);
      setComments(response.data || response || []);
    } catch (error) {
      enqueueSnackbar("Failed to load comments", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const createComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axiosInstance.post(`/projects/${id}/comments`, {
        comment: commentText,
      });
      enqueueSnackbar("Comment added!", { variant: "success" });
      setCommentText("");
      loadComments();
    } catch (error) {
      enqueueSnackbar("Failed to add comment", { variant: "error" });
    }
  };

  // Files
  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}/files`);
      console.log("📎 Files response:", response);
      setFiles(response.data || response || []);
    } catch (error) {
      enqueueSnackbar("Failed to load files", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Activities
  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}/activities`);
      console.log("📊 Activities response:", response);
      setActivities(response.data || response || []);
    } catch (error) {
      enqueueSnackbar("Failed to load activities", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Members
  const loadMembers = async () => {
    try {
      const response = await axiosInstance.get(`/projects/${id}/members`);
      console.log("👥 Members response:", response);
      setMembers(response.data || response || []);
    } catch (error) {
      console.error("Failed to load members:", error);
    }
  };

  // Departments - Load assigned departments
  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}/departments`);
      console.log("🏢 Assigned departments:", response);
      const depts = response.data || response || [];
      setDepartments(depts);

      // Also set mapped departments for dialog (id, name format)
      const mappedDepts = depts.map((d) => ({
        id: d.department_id,
        name: d.department_name,
        code: d.department_code,
        manager_name: d.manager_name,
      }));
      setAllDepartments(mappedDepts);
    } catch (error) {
      enqueueSnackbar("Failed to load departments", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: "info",
      active: "success",
      on_hold: "warning",
      completed: "success",
      cancelled: "error",
      todo: "default",
      in_progress: "primary",
      review: "warning",
      blocked: "error",
      pending: "warning",
    };
    return colors[status] || "default";
  };

  const calculateProgress = () => {
    // Calculate based on actual tasks loaded, not project fields
    const totalTasks = tasks.length;
    if (totalTasks === 0) return 0;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed" || task.status === "done"
    ).length;

    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "completed" || task.status === "done"
    ).length;

    return { completed: completedTasks, total: totalTasks };
  };

  const getMemberCount = () => {
    return members.length;
  };

  if (!currentProject) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            onClick={() => navigate("/admin/projects")}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              flexGrow: 1,
              background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {currentProject.name}
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
              color: "#000",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)",
              },
            }}
          >
            Edit Project
          </Button>
        </Box>

        {/* Project Info Card */}
        <Card
          sx={{
            p: 3,
            mb: 2,
            background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
            boxShadow: "0 4px 12px rgba(33, 150, 243, 0.15)",
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {currentProject.description || "No description provided"}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  label={currentProject.status?.replace("_", " ")}
                  color={getStatusColor(currentProject.status)}
                />
                <Chip
                  label={`Priority: ${currentProject.priority}`}
                  variant="outlined"
                />
                {currentProject.start_date && (
                  <Chip
                    icon={<CalendarIcon />}
                    label={`Start: ${format(
                      new Date(currentProject.start_date),
                      "MMM dd, yyyy"
                    )}`}
                    variant="outlined"
                  />
                )}
                {currentProject.end_date && (
                  <Chip
                    icon={<CalendarIcon />}
                    label={`End: ${format(
                      new Date(currentProject.end_date),
                      "MMM dd, yyyy"
                    )}`}
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progress
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box sx={{ width: "100%", mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress()}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      background: "rgba(33, 150, 243, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background:
                          "linear-gradient(90deg, #2196f3 0%, #ffd700 100%)",
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: "#1976d2",
                  }}
                >
                  {calculateProgress()}%
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Tasks
                  </Typography>
                  <Typography variant="h6">
                    {getTaskStats().completed} / {getTaskStats().total}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Members
                  </Typography>
                  <Typography variant="h6">{getMemberCount()}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Tasks" />
          <Tab label="Milestones" />
          <Tab label="Comments" />
          <Tab label="Files" />
          <Tab label="Activities" />
          <Tab label="Members" />
          <Tab label="Departments" />
          <Tab label="Công Việc Phòng Ban" />
          <Tab label="Công Việc Nhân Viên" />
          <Tab label="Báo Cáo" />
          <Tab label="Cảnh Báo" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Project Overview
          </Typography>
          <Typography color="text.secondary">
            Quick summary and statistics about this project.
          </Typography>
        </TabPanel>

        {/* Tasks Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6">Tasks</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setTaskDialog(true)}
            >
              Add Task
            </Button>
          </Box>

          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No tasks yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {task.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {task.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.status}
                            size="small"
                            color={getStatusColor(task.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={task.priority} size="small" />
                        </TableCell>
                        <TableCell>
                          {task.actual_hours || 0} / {task.estimated_hours}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => deleteTask(task.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Milestones Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6">Milestones</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setMilestoneDialog(true)}
            >
              Add Milestone
            </Button>
          </Box>

          {loading ? (
            <LinearProgress />
          ) : (
            <List>
              {milestones.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No milestones yet" />
                </ListItem>
              ) : (
                milestones.map((milestone) => (
                  <ListItem key={milestone.id} divider>
                    <ListItemAvatar>
                      <Avatar>
                        {milestone.status === "completed" ? (
                          <CheckCircleIcon />
                        ) : (
                          <ScheduleIcon />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={milestone.title}
                      secondary={
                        <>
                          {milestone.description}
                          <br />
                          Due:{" "}
                          {format(new Date(milestone.due_date), "MMM dd, yyyy")}
                        </>
                      }
                    />
                    <Chip
                      label={milestone.status}
                      size="small"
                      color={getStatusColor(milestone.status)}
                    />
                  </ListItem>
                ))
              )}
            </List>
          )}
        </TabPanel>

        {/* Comments Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button
              variant="contained"
              sx={{ mt: 1 }}
              onClick={createComment}
              disabled={!commentText.trim()}
            >
              Post Comment
            </Button>
          </Box>

          {loading ? (
            <LinearProgress />
          ) : (
            <List>
              {comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" divider>
                  <ListItemAvatar>
                    <Avatar>{comment.user_name?.[0] || "U"}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={comment.user_name}
                    secondary={
                      <>
                        {comment.comment}
                        <br />
                        <Typography variant="caption">
                          {format(
                            new Date(comment.created_at),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Files Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6">Files</Typography>
          <Typography color="text.secondary">
            File upload feature coming soon...
          </Typography>
        </TabPanel>

        {/* Activities Tab */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Activity Log
          </Typography>

          {loading ? (
            <LinearProgress />
          ) : (
            <List>
              {activities.map((activity, index) => (
                <ListItem key={index} divider>
                  <ListItemAvatar>
                    <Avatar>
                      <TimelineIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.description}
                    secondary={format(
                      new Date(activity.created_at),
                      "MMM dd, yyyy HH:mm"
                    )}
                  />
                  <Chip label={activity.action} size="small" />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Members Tab */}
        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>
            Team Members
          </Typography>
          <List>
            {members.length === 0 ? (
              <ListItem>
                <ListItemText primary="No members yet" />
              </ListItem>
            ) : (
              members.map((member) => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar>{member.name?.[0] || "M"}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={member.role || "Member"}
                  />
                </ListItem>
              ))
            )}
          </List>
        </TabPanel>
      </Card>

      {/* Task Dialog */}
      <Dialog
        open={taskDialog}
        onClose={() => setTaskDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={taskForm.status}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, status: e.target.value })
                }
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Priority"
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Hours"
                value={taskForm.estimated_hours}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    estimated_hours: Number(e.target.value),
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={createTask}>
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog
        open={milestoneDialog}
        onClose={() => setMilestoneDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Milestone</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Milestone Title"
                value={milestoneForm.title}
                onChange={(e) =>
                  setMilestoneForm({ ...milestoneForm, title: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={milestoneForm.description}
                onChange={(e) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={milestoneForm.due_date}
                onChange={(e) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    due_date: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={milestoneForm.status}
                onChange={(e) =>
                  setMilestoneForm({ ...milestoneForm, status: e.target.value })
                }
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMilestoneDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={createMilestone}>
            Create Milestone
          </Button>
        </DialogActions>
      </Dialog>

      {/* Departments Tab */}
      <TabPanel value={tabValue} index={7}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6">Assigned Departments</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAssignDepartmentsDialog(true)}
          >
            Add Department
          </Button>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned Team</TableCell>
                  <TableCell>Members Count</TableCell>
                  <TableCell>Assigned Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No departments assigned yet
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {dept.department_name}
                        </Typography>
                        {dept.manager_name && (
                          <Typography variant="caption" color="text.secondary">
                            Manager: {dept.manager_name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={dept.status}
                          color={getStatusColor(dept.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {dept.assigned_team_name || (
                          <Typography variant="body2" color="text.secondary">
                            Not assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{dept.members_count || 0} members</TableCell>
                      <TableCell>
                        {dept.assigned_at
                          ? format(new Date(dept.assigned_at), "MMM dd, yyyy")
                          : "Not assigned yet"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Department Tasks Tab (Task Workflow) */}
      <TabPanel value={tabValue} index={8}>
        <DepartmentTasksTab
          projectId={id}
          departments={departments}
          currentUser={currentUser}
        />
      </TabPanel>

      {/* Member Tasks Tab (Task Workflow) */}
      <TabPanel value={tabValue} index={9}>
        <MemberTasksTab
          projectId={id}
          users={members}
          currentUser={currentUser}
        />
      </TabPanel>

      {/* Task Reports Tab (Task Workflow) */}
      <TabPanel value={tabValue} index={10}>
        <TaskReportsTab projectId={id} currentUser={currentUser} />
      </TabPanel>

      {/* Warnings Tab (Task Workflow) */}
      <TabPanel value={tabValue} index={11}>
        <WarningsTab projectId={id} users={members} currentUser={currentUser} />
      </TabPanel>

      {/* Assign Departments Dialog */}
      <AssignDepartmentsDialog
        open={assignDepartmentsDialog}
        onClose={() => setAssignDepartmentsDialog(false)}
        project={currentProject}
        onSuccess={() => {
          setAssignDepartmentsDialog(false);
          loadDepartments();
        }}
      />
    </Box>
  );
};

export default ProjectDetail;
