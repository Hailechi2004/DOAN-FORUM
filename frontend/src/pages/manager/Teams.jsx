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
  Alert,
  Avatar,
  Paper,
  Divider,
} from "@mui/material";
import {
  Search,
  Edit,
  Delete,
  Add,
  Visibility,
  Groups,
  People as PeopleIcon,
  Business as BusinessIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { teamService } from "../../services/api";

const ManagerTeams = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state) => state.auth);

  const [teams, setTeams] = useState([]);
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
    if (user?.department_id) {
      fetchTeams();
    }
  }, [searchQuery, user?.department_id]);

  const fetchTeams = async () => {
    if (!user?.department_id) return;

    try {
      setLoading(true);
      // Manager chỉ thấy teams của department mình
      const response = await teamService.getAll({
        search: searchQuery,
        department_id: user.department_id,
      });
      const data = response.data || response;
      setTeams(data.teams || data || []);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      enqueueSnackbar("Failed to load teams", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (team = null) => {
    if (team) {
      setSelectedTeam(team);
      setFormData({
        name: team.name,
        description: team.description || "",
        department_id: user.department_id, // Lock to manager's department
      });
    } else {
      setSelectedTeam(null);
      setFormData({
        name: "",
        description: "",
        department_id: user.department_id, // Lock to manager's department
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeam(null);
    setFormData({ name: "", description: "", department_id: null });
  };

  const handleSubmit = async () => {
    try {
      if (selectedTeam) {
        await teamService.update(selectedTeam.id, formData);
        enqueueSnackbar("Team updated successfully", { variant: "success" });
      } else {
        await teamService.create(formData);
        enqueueSnackbar("Team created successfully", { variant: "success" });
      }
      handleCloseDialog();
      fetchTeams();
    } catch (error) {
      console.error("Failed to save team:", error);
      enqueueSnackbar(error.message || "Failed to save team", {
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await teamService.delete(selectedTeam.id);
      enqueueSnackbar("Team deleted successfully", { variant: "success" });
      setOpenDeleteDialog(false);
      setSelectedTeam(null);
      fetchTeams();
    } catch (error) {
      console.error("Failed to delete team:", error);
      enqueueSnackbar("Failed to delete team", { variant: "error" });
    }
  };

  const handleView = async (team) => {
    try {
      const response = await teamService.getById(team.id);
      setViewTeam(response.data || response);
      setOpenViewDialog(true);
    } catch (error) {
      console.error("Failed to fetch team details:", error);
      enqueueSnackbar("Failed to load team details", { variant: "error" });
    }
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Department Teams
          </Typography>
          <Typography variant="body2" color="text.secondary">
            📌 Manage teams in your department only
          </Typography>
        </Box>
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

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {/* Teams Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      No teams found in your department
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                teams
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((team) => (
                    <TableRow key={team.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Groups color="primary" />
                          <Typography fontWeight={600}>{team.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {team.description || "No description"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${team.member_count || 0} members`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(team.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleView(team)}
                            color="info"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(team)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTeam(team);
                              setOpenDeleteDialog(true);
                            }}
                            color="error"
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
          count={teams.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedTeam ? "Edit Team" : "Create Team"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Team Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                This team will be created in your department only
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedTeam ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Team</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this team?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Groups color="primary" />
            Team Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewTeam && (
            <Box sx={{ mt: 2 }}>
              <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {viewTeam.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {viewTeam.description || "No description provided"}
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${viewTeam.member_count || 0} Members`}
                    color="primary"
                    variant="outlined"
                  />
                  {viewTeam.department_name && (
                    <Chip
                      icon={<BusinessIcon />}
                      label={viewTeam.department_name}
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  {viewTeam.team_lead_name && (
                    <Chip
                      icon={<StarIcon />}
                      label={`Lead: ${viewTeam.team_lead_name}`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Card>

              {/* Team Members List */}
              {viewTeam.members && viewTeam.members.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Team Members ({viewTeam.members.length})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {viewTeam.members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar
                                  sx={{ width: 32, height: 32 }}
                                  src={member.avatar_url}
                                >
                                  {member.full_name?.[0] ||
                                    member.username?.[0]}
                                </Avatar>
                                <Typography variant="body2">
                                  {member.full_name || member.username}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {member.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={member.role || "Member"}
                                size="small"
                                color={
                                  member.role === "leader"
                                    ? "primary"
                                    : "default"
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {(!viewTeam.members || viewTeam.members.length === 0) && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No members in this team yet
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerTeams;
