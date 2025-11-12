import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Button,
  Typography,
  IconButton,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Tooltip,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  FolderOpen as FolderIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import axiosInstance from "../../utils/axios";
import { format } from "date-fns";

const ManagerProjects = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state) => state.auth);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (user?.department_id) {
      fetchProjects();
    }
  }, [page, rowsPerPage, searchQuery, user?.department_id]);

  const fetchProjects = async () => {
    if (!user?.department_id) return;

    try {
      setLoading(true);
      // Manager chỉ thấy projects mà department được mời tham gia
      const response = await axiosInstance.get("/projects", {
        params: {
          department_id: user.department_id,
          search: searchQuery,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      const data = response.data.data || response.data;
      setProjects(data.projects || data || []);
      setTotalCount(data.total || data.length || 0);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      enqueueSnackbar("Failed to load projects", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: "info",
      in_progress: "warning",
      completed: "success",
      cancelled: "error",
      on_hold: "default",
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

  const handleViewProject = (projectId) => {
    navigate(`/manager/projects/${projectId}`);
  };

  if (!user?.department_id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          You are not assigned to any department. Please contact administrator.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Department Projects
        </Typography>
        <Typography variant="body2" color="text.secondary">
          📌 View and manage projects assigned to your department
        </Typography>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> You can only see projects that Admin has
          assigned to your department. You can manage tasks within these
          projects for your team members.
        </Typography>
      </Alert>

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {/* Projects Table */}
      <Card>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 3 }}>
                      <FolderIcon sx={{ fontSize: 60, color: "#ccc", mb: 2 }} />
                      <Typography color="text.secondary">
                        No projects assigned to your department yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Projects will appear here when Admin assigns them to
                        your department
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FolderIcon color="primary" />
                        <Box>
                          <Typography fontWeight={600}>
                            {project.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.description?.substring(0, 50)}
                            {project.description?.length > 50 ? "..." : ""}
                          </Typography>
                        </Box>
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
                    <TableCell>
                      <Typography variant="body2">
                        {project.start_date
                          ? format(new Date(project.start_date), "MMM dd, yyyy")
                          : "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        to{" "}
                        {project.end_date
                          ? format(new Date(project.end_date), "MMM dd, yyyy")
                          : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: "100px" }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={0.5}
                        >
                          <Typography variant="caption">
                            {project.progress || 0}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.progress || 0}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewProject(project.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </Box>
  );
};

export default ManagerProjects;
