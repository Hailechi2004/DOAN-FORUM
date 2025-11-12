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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
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
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
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
import useTaskWorkflowSocket from "../../hooks/useTaskWorkflowSocket";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ManagerProjectDetail = () => {
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
  const [departments, setDepartments] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [commentDialog, setCommentDialog] = useState(false);
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
      if (departments.length === 0) loadDepartments();
    }
  }, [tabValue]);

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
      setTasks(response.data || []);
    } catch (error) {
      enqueueSnackbar("Failed to load tasks", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Milestones
  const loadMilestones = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}/milestones`);
      setMilestones(response.data || []);
    } catch (error) {
      enqueueSnackbar("Failed to load milestones", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Comments
  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}/comments`);
      setComments(response.data || []);
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
      setFiles(response.data || []);
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
      setActivities(response.data || []);
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
      setMembers(response.data || []);
    } catch (error) {
      console.error("Failed to load members:", error);
    }
  };

  // Departments
  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}/departments`);
      const depts = response.data || [];
      setDepartments(depts);

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

  // Accept project invitation (Manager only for their department)
  const handleAcceptInvitation = async (departmentId) => {
    try {
      await axiosInstance.post(
        `/projects/${id}/departments/${departmentId}/accept`
      );
      enqueueSnackbar("Project invitation accepted successfully", {
        variant: "success",
      });
      loadDepartments();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to accept invitation",
        { variant: "error" }
      );
    }
  };

  // Reject project invitation (Manager only for their department)
  const handleRejectInvitation = async (departmentId, reason) => {
    try {
      await axiosInstance.post(
        `/projects/${id}/departments/${departmentId}/reject`,
        { rejection_reason: reason }
      );
      enqueueSnackbar("Project invitation rejected", { variant: "info" });
      loadDepartments();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to reject invitation",
        { variant: "error" }
      );
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
      accepted: "success",
      rejected: "error",
    };
    return colors[status] || "default";
  };

  const calculateProgress = () => {
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
            onClick={() => navigate("/manager/projects")}
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
                  <Typography variant="h6">{members.length}</Typography>
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tasks
          </Typography>

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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            Milestones
          </Typography>

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
              {comments.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No comments yet" />
                </ListItem>
              ) : (
                comments.map((comment) => (
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
                ))
              )}
            </List>
          )}
        </TabPanel>

        {/* Files Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6">Files</Typography>
          <Typography color="text.secondary">
            File upload/download feature - managers and employees can share
            files here
          </Typography>
          {/* TODO: Implement file upload */}
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
              {activities.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No activities yet" />
                </ListItem>
              ) : (
                activities.map((activity, index) => (
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
                ))
              )}
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

        {/* Departments Tab */}
        <TabPanel value={tabValue} index={7}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Assigned Departments
          </Typography>

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
                    <TableCell>Members</TableCell>
                    <TableCell>Assigned Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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
                        <TableCell>{dept.members_count || 0}</TableCell>
                        <TableCell>
                          {dept.assigned_at
                            ? format(new Date(dept.assigned_at), "MMM dd, yyyy")
                            : "Not assigned yet"}
                        </TableCell>
                        <TableCell>
                          {dept.status === "pending" &&
                            dept.department_id ===
                              currentUser?.department_id && (
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  onClick={() =>
                                    handleAcceptInvitation(dept.department_id)
                                  }
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => {
                                    const reason = prompt(
                                      "Reason for rejection (optional):"
                                    );
                                    if (reason !== null) {
                                      handleRejectInvitation(
                                        dept.department_id,
                                        reason
                                      );
                                    }
                                  }}
                                >
                                  Reject
                                </Button>
                              </Box>
                            )}
                          {dept.status === "confirmed" && (
                            <Chip
                              label="Confirmed"
                              color="success"
                              size="small"
                            />
                          )}
                          {dept.status === "rejected" && (
                            <Chip label="Rejected" color="error" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Department Tasks Tab */}
        <TabPanel value={tabValue} index={8}>
          <DepartmentTasksTab
            projectId={id}
            departments={allDepartments}
            currentUser={currentUser}
          />
        </TabPanel>

        {/* Member Tasks Tab */}
        <TabPanel value={tabValue} index={9}>
          <MemberTasksTab
            projectId={id}
            users={members}
            currentUser={currentUser}
          />
        </TabPanel>

        {/* Task Reports Tab */}
        <TabPanel value={tabValue} index={10}>
          <TaskReportsTab projectId={id} currentUser={currentUser} />
        </TabPanel>

        {/* Warnings Tab */}
        <TabPanel value={tabValue} index={11}>
          <WarningsTab
            projectId={id}
            users={members}
            currentUser={currentUser}
          />
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ManagerProjectDetail;
