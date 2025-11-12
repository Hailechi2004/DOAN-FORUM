import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FolderOpen as FolderIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import axiosInstance from "../../utils/axios";
import { format } from "date-fns";

const EmployeeProjects = () => {
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
    fetchProjects();
  }, [page, rowsPerPage, searchQuery]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Employee sees projects where they are members
      const response = await axiosInstance.get("/projects", {
        params: {
          member_id: user.id, // Backend should filter by member
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
    navigate(`/employee/projects/${projectId}`);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <FolderIcon sx={{ fontSize: 40, color: "primary.main" }} />
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            My Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Projects you are participating in
          </Typography>
        </Box>
      </Box>

      <Card sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
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
        </Box>

        {loading ? (
          <LinearProgress />
        ) : projects.length === 0 ? (
          <Alert severity="info">
            You are not assigned to any projects yet. Your manager will assign
            you to projects.
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Timeline</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {project.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.description?.substring(0, 50)}
                          {project.description?.length > 50 && "..."}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status?.replace("_", " ")}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.priority}
                          color={getPriorityColor(project.priority)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {project.start_date && project.end_date ? (
                          <Typography variant="caption">
                            {format(new Date(project.start_date), "MMM dd")} -{" "}
                            {format(new Date(project.end_date), "MMM dd, yyyy")}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No timeline
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box sx={{ width: 80 }}>
                            <LinearProgress
                              variant="determinate"
                              value={project.progress || 0}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: "rgba(33, 150, 243, 0.1)",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: "primary.main",
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="caption" fontWeight={600}>
                            {project.progress || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewProject(project.id)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
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
          </>
        )}
      </Card>
    </Box>
  );
};

export default EmployeeProjects;
