import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
  Avatar,
  CircularProgress,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Edit,
  Delete,
  Add,
  Visibility,
  Person,
  Email,
  Phone,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import axiosInstance from "../../utils/axios";

const ManagerUsers = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    role_id: 3, // Employee role
  });

  useEffect(() => {
    if (user?.department_id) {
      fetchUsers();
    }
  }, [searchQuery, user?.department_id]);

  const fetchUsers = async () => {
    if (!user?.department_id) return;

    try {
      setLoading(true);
      // Get users in manager's department
      const response = await axiosInstance.get(
        `/departments/${user.department_id}/members`
      );
      const data = response.data.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      enqueueSnackbar("Failed to load department members", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (userItem = null) => {
    if (userItem) {
      setSelectedUser(userItem);
      setFormData({
        username: userItem.username || "",
        email: userItem.email || "",
        full_name: userItem.full_name || "",
        phone: userItem.phone || "",
        role_id: userItem.role_id || 3,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: "",
        email: "",
        full_name: "",
        phone: "",
        role_id: 3,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSave = async () => {
    try {
      if (selectedUser) {
        // Update user
        await axiosInstance.put(`/users/${selectedUser.id}`, formData);
        enqueueSnackbar("User updated successfully", { variant: "success" });
      } else {
        // Create new user - also need to assign to department
        const userData = {
          ...formData,
          password: "changeme123", // Default password
          department_id: user.department_id,
        };
        await axiosInstance.post("/users", userData);
        enqueueSnackbar("User created successfully", { variant: "success" });
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
      await axiosInstance.delete(`/users/${selectedUser.id}`);
      enqueueSnackbar("User deleted successfully", { variant: "success" });
      setOpenDeleteDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      enqueueSnackbar("Failed to delete user", { variant: "error" });
    }
  };

  const handleView = async (userItem) => {
    try {
      const response = await axiosInstance.get(`/users/${userItem.id}`);
      setViewUser(response.data.data || response.data);
      setOpenViewDialog(true);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      enqueueSnackbar("Failed to load user details", { variant: "error" });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
            Department Members
          </Typography>
          <Typography variant="body2" color="text.secondary">
            👥 Manage employees in your department
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
          Add Member
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or username..."
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

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : displayedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      No members found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayedUsers.map((userItem) => (
                  <TableRow key={userItem.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={userItem.avatar_url}>
                          {userItem.full_name?.[0] || userItem.username?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {userItem.full_name || userItem.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{userItem.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>{userItem.phone || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={userItem.role_name || "Employee"}
                        size="small"
                        color={
                          userItem.role_name === "Department Manager"
                            ? "primary"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={userItem.is_active ? "Active" : "Inactive"}
                        size="small"
                        color={userItem.is_active ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => handleView(userItem)}
                          color="info"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(userItem)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(userItem);
                            setOpenDeleteDialog(true);
                          }}
                          color="error"
                          disabled={userItem.id === user.id}
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
          count={filteredUsers.length}
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
        <DialogTitle>
          {selectedUser ? "Edit Member" : "Add New Member"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                disabled={!!selectedUser}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role_id}
                  label="Role"
                  onChange={(e) =>
                    setFormData({ ...formData, role_id: e.target.value })
                  }
                >
                  <MenuItem value={3}>Employee</MenuItem>
                  <MenuItem value={2}>Department Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {!selectedUser && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Default password: <strong>changeme123</strong>
                  <br />
                  User will be assigned to your department automatically.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              !formData.username || !formData.email || !formData.full_name
            }
          >
            {selectedUser ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </Typography>
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Person color="primary" />
            Member Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewUser && (
            <Box sx={{ mt: 2 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar
                  src={viewUser.avatar_url}
                  sx={{ width: 80, height: 80 }}
                >
                  {viewUser.full_name?.[0] || viewUser.username?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {viewUser.full_name || viewUser.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{viewUser.username}
                  </Typography>
                  <Box mt={1}>
                    <Chip
                      label={viewUser.role_name || "Employee"}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email color="action" fontSize="small" />
                    <Typography variant="body2">{viewUser.email}</Typography>
                  </Box>
                </Grid>
                {viewUser.phone && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone color="action" fontSize="small" />
                      <Typography variant="body2">{viewUser.phone}</Typography>
                    </Box>
                  </Grid>
                )}
                {viewUser.bio && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Bio
                    </Typography>
                    <Typography variant="body2">{viewUser.bio}</Typography>
                  </Grid>
                )}
              </Grid>
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

export default ManagerUsers;
