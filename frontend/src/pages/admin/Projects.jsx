import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Button,
  Typography,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AssignDepartmentsDialog from "../../components/projects/AssignDepartmentsDialog";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  FolderOpen as FolderIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Assignment as TaskIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  setFilters,
} from "../../store/slices/projectSlice";
import { format } from "date-fns";
import axiosInstance from "../../utils/axios";

const Projects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { projects, loading, pagination, filters } = useSelector(
    (state) => state.projects
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' | 'edit'
  const [selectedProject, setSelectedProject] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProject, setMenuProject] = useState(null);
  const [openDepartmentsDialog, setOpenDepartmentsDialog] = useState(false);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    start_date: "",
    end_date: "",
    department_id: null,
    team_id: null,
  });

  useEffect(() => {
    console.log("🔍 Loading projects...", { filters, pagination });
    loadProjects();
    loadDepartments();
  }, [filters, pagination.page]);

  const loadProjects = () => {
    // Admin sees all projects, no department filter
    const params = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    };
    console.log("📡 Fetching projects with params:", params);
    dispatch(fetchProjects(params));
  };

  const loadDepartments = async () => {
    try {
      const response = await axiosInstance.get("/departments");
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const handleOpenDialog = (mode, project = null) => {
    setDialogMode(mode);
    setSelectedProject(project);

    if (mode === "edit" && project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "planning",
        priority: project.priority || "medium",
        start_date: project.start_date
          ? format(new Date(project.start_date), "yyyy-MM-dd")
          : "",
        end_date: project.end_date
          ? format(new Date(project.end_date), "yyyy-MM-dd")
          : "",
        department_id: project.department_id || null,
        team_id: project.team_id || null,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        start_date: "",
        end_date: "",
        department_id: null,
        team_id: null,
      });
    }

    setOpenDialog(true);
    handleCloseMenu();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Clean formData - remove empty strings and convert to null
      const { department_id, ...projectData } = formData;
      const cleanData = Object.entries(projectData).reduce(
        (acc, [key, value]) => {
          if (value === "" || value === null || value === undefined) {
            // Don't include empty values
            return acc;
          }
          acc[key] = value;
          return acc;
        },
        {}
      );

      let project;
      if (dialogMode === "create") {
        project = await dispatch(createProject(cleanData)).unwrap();
        enqueueSnackbar("Project created successfully!", {
          variant: "success",
        });

        // Assign department if selected
        if (department_id) {
          try {
            await axiosInstance.post(`/projects/${project.id}/departments`, {
              department_ids: [department_id],
            });
            enqueueSnackbar("Department assigned successfully!", {
              variant: "success",
            });
          } catch (error) {
            console.error("Failed to assign department:", error);
            enqueueSnackbar(
              "Project created but department assignment failed",
              {
                variant: "warning",
              }
            );
          }
        }
      } else {
        await dispatch(
          updateProject({ id: selectedProject.id, data: cleanData })
        ).unwrap();
        enqueueSnackbar("Project updated successfully!", {
          variant: "success",
        });
      }
      handleCloseDialog();
      loadProjects();
    } catch (error) {
      enqueueSnackbar(error || "Operation failed", { variant: "error" });
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    try {
      await dispatch(deleteProject(project.id)).unwrap();
      enqueueSnackbar("Project deleted successfully!", { variant: "success" });
      loadProjects();
    } catch (error) {
      enqueueSnackbar(error || "Failed to delete project", {
        variant: "error",
      });
    }
  };

  const handleOpenMenu = (event, project) => {
    setAnchorEl(event.currentTarget);
    setMenuProject(project);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuProject(null);
  };

  const handleViewDetails = (project) => {
    navigate(`/admin/projects/${project.id}`);
    handleCloseMenu();
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: "info",
      in_progress: "primary",
      on_hold: "warning",
      completed: "success",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "info",
      medium: "warning",
      high: "error",
      critical: "error",
    };
    return colors[priority] || "default";
  };

  const calculateProgress = (project) => {
    if (!project.task_count || project.task_count === 0) return 0;
    return Math.round((project.completed_tasks / project.task_count) * 100);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          <FolderIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Projects Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("create")}
        >
          New Project
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={filters.status || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="on_hold">On Hold</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Priority"
              value={filters.priority || ""}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
            >
              <MenuItem value="">All Priority</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Projects Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <GroupIcon sx={{ fontSize: 16, verticalAlign: "middle" }} />{" "}
                  Members
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TaskIcon sx={{ fontSize: 16, verticalAlign: "middle" }} />{" "}
                  Tasks
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timeline</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No projects found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow
                    key={project.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleViewDetails(project)}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {project.name}
                        </Typography>
                        {project.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 200,
                            }}
                          >
                            {project.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.status?.replace("_", " ")}
                        size="small"
                        color={getStatusColor(project.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.priority}
                        size="small"
                        color={getPriorityColor(project.priority)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ width: "100%", mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={calculateProgress(project)}
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {calculateProgress(project)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {project.member_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {project.completed_tasks || 0} /{" "}
                        {project.task_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {project.start_date && (
                          <Typography variant="caption" display="block">
                            Start:{" "}
                            {format(
                              new Date(project.start_date),
                              "MMM dd, yyyy"
                            )}
                          </Typography>
                        )}
                        {project.end_date && (
                          <Typography variant="caption" display="block">
                            End:{" "}
                            {format(new Date(project.end_date), "MMM dd, yyyy")}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, project)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={(e, newPage) =>
            dispatch(setFilters({ page: newPage + 1 }))
          }
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={(e) =>
            dispatch(setFilters({ limit: parseInt(e.target.value) }))
          }
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleViewDetails(menuProject)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog("edit", menuProject)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedProject(menuProject);
            setOpenDepartmentsDialog(true);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Assign Departments</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete(menuProject);
            handleCloseMenu();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create" ? "Create New Project" : "Edit Project"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Department (Optional)"
                name="department_id"
                value={formData.department_id || ""}
                onChange={handleInputChange}
                helperText="Assign a department to this project"
              >
                <MenuItem value="">
                  <em>None - Assign later</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name.trim()}
          >
            {dialogMode === "create" ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Departments Dialog */}
      <AssignDepartmentsDialog
        open={openDepartmentsDialog}
        onClose={() => {
          setOpenDepartmentsDialog(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSuccess={() => {
          loadProjects();
        }}
      />
    </Box>
  );
};

export default Projects;
