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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { fetchProjectById } from "../../store/slices/projectSlice";
import axiosInstance from "../../utils/axios";
import { format } from "date-fns";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EmployeeProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { currentProject } = useSelector((state) => state.projects);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      loadProjectData();
    }
  }, [id]);

  useEffect(() => {
    if (tabValue === 1) loadMyTasks();
    else if (tabValue === 2) loadTasks();
    else if (tabValue === 3) loadMilestones();
    else if (tabValue === 4) loadComments();
    else if (tabValue === 5) loadFiles();
    else if (tabValue === 6) loadActivities();
    else if (tabValue === 7) loadMembers();
  }, [tabValue]);

  const loadProjectData = async () => {
    try {
      loadMyTasks();
      loadComments();
      loadMembers();
    } catch (error) {
      console.error("Error loading project data:", error);
    }
  };

  // My Tasks - Tasks assigned to current employee
  const loadMyTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/projects/${id}/tasks`, {
        params: { assigned_to: currentUser.id },
      });
      setMyTasks(response.data || []);
    } catch (error) {
      enqueueSnackbar("Failed to load your tasks", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // All Tasks - View only
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

  // Update task status (employee can update their own tasks)
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axiosInstance.put(`/projects/${id}/tasks/${taskId}`, {
        status: newStatus,
      });
      enqueueSnackbar("Task status updated!", { variant: "success" });
      loadMyTasks();
    } catch (error) {
      enqueueSnackbar("Failed to update task", { variant: "error" });
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

  // Comments - Employees can view and post
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
      enqueueSnackbar("Comment posted!", { variant: "success" });
      setCommentText("");
      loadComments();
    } catch (error) {
      enqueueSnackbar("Failed to post comment", { variant: "error" });
    }
  };

  // Files - Employees can upload and download
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

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axiosInstance.post(`/projects/${id}/files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      enqueueSnackbar("File uploaded successfully!", { variant: "success" });
      setSelectedFile(null);
      loadFiles();
    } catch (error) {
      enqueueSnackbar("Failed to upload file", { variant: "error" });
    }
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      const response = await axiosInstance.get(
        `/projects/${id}/files/${fileId}/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      enqueueSnackbar("Failed to download file", { variant: "error" });
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
      done: "success",
      pending: "warning",
    };
    return colors[status] || "default";
  };

  const calculateProgress = () => {
    const totalTasks = myTasks.length;
    if (totalTasks === 0) return 0;

    const completedTasks = myTasks.filter(
      (task) => task.status === "completed" || task.status === "done"
    ).length;

    return Math.round((completedTasks / totalTasks) * 100);
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
            onClick={() => navigate("/employee/projects")}
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
                My Progress
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
                          "linear-gradient(90deg, #2196f3 0%, #4caf50 100%)",
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
                    My Tasks
                  </Typography>
                  <Typography variant="h6">{myTasks.length}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="h6">
                    {
                      myTasks.filter(
                        (t) => t.status === "completed" || t.status === "done"
                      ).length
                    }
                  </Typography>
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
          <Tab label="My Tasks" />
          <Tab label="All Tasks" />
          <Tab label="Milestones" />
          <Tab label="Comments" />
          <Tab label="Files" />
          <Tab label="Activities" />
          <Tab label="Team Members" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Project Overview
          </Typography>
          <Typography color="text.secondary" paragraph>
            Welcome to the project workspace. Here you can:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="View and update your assigned tasks"
                secondary="Track your work progress and update task status"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Collaborate with team"
                secondary="Comment on project updates and discussions"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Share files"
                secondary="Upload documents and download shared resources"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Track milestones"
                secondary="View project milestones and deadlines"
              />
            </ListItem>
          </List>
        </TabPanel>

        {/* My Tasks Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">My Assigned Tasks</Typography>
            <Chip
              label={`${myTasks.length} tasks assigned`}
              color="primary"
              variant="outlined"
            />
          </Box>

          {loading ? (
            <LinearProgress />
          ) : myTasks.length === 0 ? (
            <Alert severity="info">
              No tasks assigned to you yet. Your manager will assign tasks soon.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myTasks.map((task) => (
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
                        {task.due_date
                          ? format(new Date(task.due_date), "MMM dd, yyyy")
                          : "No deadline"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            updateTaskStatus(
                              task.id,
                              task.status === "done" ? "in_progress" : "done"
                            )
                          }
                        >
                          {task.status === "done" ? "Reopen" : "Mark Done"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* All Tasks Tab - Read Only */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            All Project Tasks
          </Typography>

          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
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
                          {task.assigned_to_name || "Unassigned"}
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Milestones Tab - Read Only */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Project Milestones
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

        {/* Comments Tab - Can Post */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Project Discussion
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Share your thoughts, ask questions, or provide updates..."
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
                  <ListItemText primary="No comments yet. Be the first to comment!" />
                </ListItem>
              ) : (
                comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start" divider>
                    <ListItemAvatar>
                      <Avatar>{comment.user_name?.[0] || "U"}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="subtitle2">
                            {comment.user_name}
                          </Typography>
                          {comment.user_id === currentUser.id && (
                            <Chip label="You" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {comment.comment}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
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

        {/* Files Tab - Can Upload */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Project Files
          </Typography>

          <Card sx={{ p: 2, mb: 3, bgcolor: "primary.50" }}>
            <Typography variant="subtitle2" gutterBottom>
              Upload File
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button variant="outlined" component="label">
                <CloudUploadIcon sx={{ mr: 1 }} />
                Choose File
                <input type="file" hidden onChange={handleFileSelect} />
              </Button>
              {selectedFile && (
                <>
                  <Typography variant="body2">{selectedFile.name}</Typography>
                  <Button variant="contained" onClick={uploadFile}>
                    Upload
                  </Button>
                </>
              )}
            </Box>
          </Card>

          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>Upload Date</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No files uploaded yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.file_name}</TableCell>
                        <TableCell>{file.uploaded_by_name}</TableCell>
                        <TableCell>
                          {format(new Date(file.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {file.file_size
                            ? `${(file.file_size / 1024).toFixed(2)} KB`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() =>
                              downloadFile(file.id, file.file_name)
                            }
                          >
                            <DownloadIcon />
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

        {/* Activities Tab - Read Only */}
        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>
            Activity Timeline
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

        {/* Team Members Tab - Read Only */}
        <TabPanel value={tabValue} index={7}>
          <Typography variant="h6" gutterBottom>
            Team Members
          </Typography>
          <List>
            {members.length === 0 ? (
              <ListItem>
                <ListItemText primary="No team members yet" />
              </ListItem>
            ) : (
              members.map((member) => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar>{member.name?.[0] || "M"}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography>{member.name}</Typography>
                        {member.id === currentUser.id && (
                          <Chip label="You" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={member.role || "Team Member"}
                  />
                </ListItem>
              ))
            )}
          </List>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default EmployeeProjectDetail;
