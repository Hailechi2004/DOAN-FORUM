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
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Edit,
  Delete,
  PersonAdd,
  Visibility,
  CheckCircle,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  userService,
  roleService,
  departmentService,
  teamService,
} from "../../services/api";

const Users = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    position: "",
    employee_id: "",
    hire_date: "",
    address: "",
    department_id: null,
    team_id: null,
    role_ids: [],
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartments();
    fetchTeams();
  }, [page, rowsPerPage, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      const data = response.data || response;
      setUsers(data.users || []);
      setTotalUsers(data.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAll();
      const data = response.data || response;
      setRoles(data.roles || data || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
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

  const fetchTeams = async () => {
    try {
      const response = await teamService.getAll();
      const data = response.data || response;
      setTeams(data.teams || data || []);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const handleViewUser = async (user) => {
    try {
      setLoading(true);
      const response = await userService.getById(user.id);
      const data = response.data || response;
      setViewUser(data.user || data);
      setOpenViewDialog(true);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewUser(null);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = async (user = null) => {
    if (user) {
      try {
        const response = await userService.getById(user.id);
        const fullUserData = response.data || response;
        const formatDate = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };
        setSelectedUser(fullUserData);
        setFormData({
          email: fullUserData.email || "",
          username: fullUserData.username || "",
          full_name: fullUserData.full_name || "",
          phone: fullUserData.phone || "",
          date_of_birth: formatDate(
            fullUserData.birth_date || fullUserData.date_of_birth
          ),
          gender: fullUserData.gender || "",
          position: fullUserData.position || "",
          employee_id: fullUserData.employee_id || "",
          hire_date: formatDate(fullUserData.hire_date),
          address: fullUserData.address || "",
          department_id: fullUserData.department_id || null,
          team_id: fullUserData.team_id || null,
          role_ids: fullUserData.roles?.map((r) => r.id) || [],
        });
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        enqueueSnackbar("Failed to load user details", { variant: "error" });
        return;
      }
    } else {
      setSelectedUser(null);
      setFormData({
        email: "",
        username: "",
        full_name: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        position: "",
        employee_id: "",
        hire_date: "",
        address: "",
        department_id: null,
        team_id: null,
        role_ids: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, formData);
        enqueueSnackbar("User updated successfully!", { variant: "success" });
      } else {
        enqueueSnackbar("User created successfully!", { variant: "success" });
      }
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to save user", {
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await userService.delete(selectedUser.id);
      enqueueSnackbar("User deleted successfully!", { variant: "success" });
      handleCloseDeleteDialog();
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete user",
        { variant: "error" }
      );
    }
  };

  const getRoleChip = (user) => {
    if (
      user.role_name === "System Admin" ||
      user.role_name === "Administrator"
    ) {
      return <Chip label="Admin" color="error" size="small" />;
    } else if (user.role_name === "Manager") {
      return <Chip label="Manager" color="warning" size="small" />;
    } else {
      return <Chip label="Employee" color="info" size="small" />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      <Box
        sx={{
          mb: 4,
          p: 4,
          background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(33, 150, 243, 0.15)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all users, roles, and permissions in the system
        </Typography>
      </Box>

      <Card
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <TextField
            placeholder="Search users by name, email, or username..."
            value={searchQuery}
            onChange={handleSearch}
            sx={{ minWidth: 300, flexGrow: 1 }}
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
            startIcon={<PersonAdd />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
              color: "#000",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)",
                boxShadow: "0 6px 16px rgba(255, 215, 0, 0.4)",
              },
            }}
          >
            Add User
          </Button>
        </Box>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
                }}
              >
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  User
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Email
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Role
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Department
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: "white", fontWeight: 600 }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(33, 150, 243, 0.05)",
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={user.avatar_url}
                          sx={{ width: 40, height: 40, bgcolor: "#1976d2" }}
                        >
                          {(user.full_name || user.username || "U").charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {user.full_name || user.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>{getRoleChip(user)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.department_name || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {user.is_online ? (
                        <Chip
                          label="Online"
                          color="success"
                          size="small"
                          icon={<CheckCircle />}
                        />
                      ) : (
                        <Chip
                          label="Offline"
                          color="default"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewUser(user)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(user)}
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
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
            color: "white",
            fontWeight: 700,
          }}
        >
          {selectedUser ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Full Name *"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Username *"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!!selectedUser}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Hire Date"
                name="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Team"
                name="team_id"
                value={formData.team_id || ""}
                onChange={handleInputChange}
              >
                <MenuItem value="">Select Team</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Assign Roles"
                name="role_ids"
                value={formData.role_ids}
                onChange={handleInputChange}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => {
                        const role = roles.find((r) => r.id === value);
                        return (
                          <Chip
                            key={value}
                            label={role?.name || value}
                            size="small"
                            color="primary"
                          />
                        );
                      })}
                    </Box>
                  ),
                }}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
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
              background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
              color: "#000",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)",
              },
            }}
          >
            {selectedUser ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
            color: "white",
            fontWeight: 700,
            fontSize: "1.5rem",
          }}
        >
          User Details
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {viewUser ? (
            <Grid container spacing={3}>
              <Grid item xs={12} display="flex" justifyContent="center">
                <Avatar
                  src={viewUser.avatar_url}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: "#1976d2",
                    fontSize: "3rem",
                    fontWeight: 700,
                  }}
                >
                  {(viewUser.full_name || viewUser.username || "U").charAt(0)}
                </Avatar>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.full_name || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  @{viewUser.username || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.phone || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.birth_date
                    ? new Date(viewUser.birth_date).toLocaleDateString()
                    : "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.gender || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Employee ID
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.employee_id || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Position
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.position || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.department_name || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Team
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.team_name || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Hire Date
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.hire_date
                    ? new Date(viewUser.hire_date).toLocaleDateString()
                    : "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box>
                  {viewUser.is_online ? (
                    <Chip
                      label="Online"
                      color="success"
                      size="small"
                      icon={<CheckCircle />}
                    />
                  ) : (
                    <Chip
                      label="Offline"
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewUser.address || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Assigned Roles
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {viewUser.roles && viewUser.roles.length > 0 ? (
                    viewUser.roles.map((role) => (
                      <Chip
                        key={role.id}
                        label={role.name}
                        color="primary"
                        size="small"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No roles assigned
                    </Typography>
                  )}
                </Box>
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
              handleOpenDialog(viewUser);
            }}
            sx={{
              background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
              color: "#000",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)",
              },
            }}
          >
            Edit User
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user{" "}
            <strong>{selectedUser?.full_name || selectedUser?.username}</strong>
            ? This action cannot be undone.
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

export default Users;
