import { useState, useEffect } from "react";
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
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  CircularProgress,
  Tooltip,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Edit,
  Delete,
  Add,
  Visibility,
  Groups,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { teamService, departmentService } from "../../services/api";

const AdminTeams = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [viewTeam, setViewTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department_id: null,
  });

  useEffect(() => {
    fetchTeams();
    fetchDepartments();
  }, [searchQuery]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      // Admin sees all teams, no department filter
      const params = { search: searchQuery };
      const response = await teamService.getAll(params);
      const data = response.data || response;
      setTeams(data.teams || data || []);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      const data = response.data || response;
      setDepartments(data.departments || data || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (team = null) => {
    if (team) {
      setSelectedTeam(team);
      setFormData({
        name: team.name || "",
        description: team.description || "",
        department_id: team.department_id || null,
      });
    } else {
      setSelectedTeam(null);
      setFormData({
        name: "",
        description: "",
        department_id: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeam(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedTeam) {
        await teamService.update(selectedTeam.id, formData);
        enqueueSnackbar("Team updated successfully!", { variant: "success" });
      } else {
        await teamService.create(formData);
        enqueueSnackbar("Team created successfully!", { variant: "success" });
      }
      handleCloseDialog();
      fetchTeams();
    } catch (error) {
      console.error("Failed to save team:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to save team", {
        variant: "error",
      });
    }
  };

  const handleViewTeam = async (team) => {
    try {
      const response = await teamService.getById(team.id);
      const data = response.data || response;
      setViewTeam(data.team || data);
      setOpenViewDialog(true);
    } catch (error) {
      console.error("Failed to fetch team details:", error);
    }
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewTeam(null);
  };

  const handleOpenDeleteDialog = (team) => {
    setSelectedTeam(team);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTeam(null);
  };

  const handleDelete = async () => {
    try {
      await teamService.delete(selectedTeam.id);
      enqueueSnackbar("Team deleted successfully!", { variant: "success" });
      handleCloseDeleteDialog();
      fetchTeams();
    } catch (error) {
      console.error("Failed to delete team:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete team",
        { variant: "error" }
      );
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedTeams = filteredTeams.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          background:
            "linear-gradient(135deg, #e3f2fd 0%, #fff9c4 50%, #ffffff 100%)",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(circle, rgba(255,235,59,0.3) 0%, transparent 70%)",
            borderRadius: "50%",
            transform: "translate(30%, -30%)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "150px",
            height: "150px",
            background:
              "radial-gradient(circle, rgba(33,150,243,0.2) 0%, transparent 70%)",
            borderRadius: "50%",
            transform: "translate(-30%, 30%)",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ color: "#1565c0" }}
          >
            Teams Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage company teams and working groups
          </Typography>
        </Box>
      </Box>

      {/* Search and Add */}
      <Card sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <TextField
            placeholder="Search teams..."
            variant="outlined"
            size="medium"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
              },
            }}
          >
            Add Team
          </Button>
        </Box>
      </Card>

      {/* Teams Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Team</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Members</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedTeams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No teams found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTeams.map((team) => (
                  <TableRow
                    key={team.id}
                    sx={{
                      "&:hover": { backgroundColor: "#f9f9f9" },
                      transition: "all 0.3s",
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Groups sx={{ color: "#2196f3" }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {team.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={team.department_name || "No Department"}
                        size="small"
                        sx={{ bgcolor: "#ffc107", color: "white" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {team.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={team.member_count || 0}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewTeam(team)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(team)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(team)}
                        >
                          <Delete />
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
          count={filteredTeams.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            background:
              "linear-gradient(135deg, #e3f2fd 0%, #fff9c4 50%, #ffffff 100%)",
            fontWeight: 700,
          }}
        >
          {selectedTeam ? "Edit Team" : "Add New Team"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Team Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Department"
                name="department_id"
                value={formData.department_id || ""}
                onChange={handleInputChange}
              >
                <MenuItem value="">Select Department</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {selectedTeam ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            background:
              "linear-gradient(135deg, #e3f2fd 0%, #fff9c4 50%, #ffffff 100%)",
            fontWeight: 700,
          }}
        >
          Team Details
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {viewTeam ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Team Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewTeam.name}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewTeam.department_name || "-"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewTeam.description || "-"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Total Members
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewTeam.member_count || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewTeam.created_at
                    ? new Date(viewTeam.created_at).toLocaleDateString()
                    : "-"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewTeam.updated_at
                    ? new Date(viewTeam.updated_at).toLocaleDateString()
                    : "-"}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseViewDialog} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleCloseViewDialog();
              handleOpenDialog(viewTeam);
            }}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete team{" "}
            <strong>{selectedTeam?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTeams;
