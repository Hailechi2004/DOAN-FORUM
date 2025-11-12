import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Card,
  CardContent,
  Checkbox,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import axios from "../../utils/axios";

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const isManager =
    user?.role === "Department Manager" || user?.role === "manager";

  const [tabValue, setTabValue] = useState(0);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Permission categories
  const permissionCategories = {
    posts: "Posts Management",
    comments: "Comments Management",
    projects: "Projects Management",
    tasks: "Tasks Management",
    users: "Users Management",
    departments: "Departments Management",
    teams: "Teams Management",
    events: "Events Management",
    meetings: "Meetings Management",
    analytics: "Analytics & Reports",
    system: "System Administration",
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    fetchSystemSettings();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("/roles");
      setRoles(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get("/permissions");
      setPermissions(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await axios.get("/settings");
      const settings = response.data.data || response.data || [];
      const settingsObj = {};
      settings.forEach((setting) => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      setSystemSettings(settingsObj);
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Set default values if API not available
      setSystemSettings({
        max_file_size_mb: "50",
        max_images_per_post: "10",
        max_videos_per_post: "5",
        post_edit_time_limit: "60",
        comment_max_depth: "5",
        typing_indicator_timeout: "10",
      });
    }
  };

  const handleSaveRole = async () => {
    try {
      setLoading(true);
      if (selectedRole) {
        await axios.put(`/roles/${selectedRole.id}`, roleForm);
        setSuccessMessage("Role updated successfully!");
      } else {
        await axios.post("/roles", roleForm);
        setSuccessMessage("Role created successfully!");
      }
      fetchRoles();
      handleCloseRoleDialog();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await axios.delete(`/roles/${roleId}`);
      setSuccessMessage("Role deleted successfully!");
      fetchRoles();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to delete role");
    }
  };

  const handleOpenRoleDialog = (role = null) => {
    setSelectedRole(role);
    setRoleForm(
      role
        ? { name: role.name, description: role.description }
        : { name: "", description: "" }
    );
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setSelectedRole(null);
    setRoleForm({ name: "", description: "" });
  };

  const handleTogglePermission = async (
    roleId,
    permissionCode,
    hasPermission
  ) => {
    try {
      if (hasPermission) {
        await axios.delete(`/roles/${roleId}/permissions/${permissionCode}`);
      } else {
        await axios.post(`/roles/${roleId}/permissions`, {
          permission_code: permissionCode,
        });
      }
      fetchRoles();
      setSuccessMessage(
        `Permission ${hasPermission ? "revoked" : "granted"} successfully!`
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to update permission"
      );
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      setLoading(true);
      await axios.put("/settings", systemSettings);
      setSuccessMessage("System settings saved successfully!");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to save settings"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingChange = (key, value) => {
    setSystemSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ⚙️ Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system configuration, roles, and permissions
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage("")}
          sx={{ mb: 3 }}
        >
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage("")}
          sx={{ mb: 3 }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="fullWidth"
        >
          <Tab icon={<SettingsIcon />} label="System Settings" />
          {!isManager && (
            <Tab icon={<SecurityIcon />} label="Roles & Permissions" />
          )}
        </Tabs>
      </Paper>

      {/* Tab 1: System Settings */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            System Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    📁 File Upload Settings
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Max File Size (MB)"
                        type="number"
                        value={systemSettings.max_file_size_mb || "50"}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            "max_file_size_mb",
                            e.target.value
                          )
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">MB</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Max Images per Post"
                        type="number"
                        value={systemSettings.max_images_per_post || "10"}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            "max_images_per_post",
                            e.target.value
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Max Videos per Post"
                        type="number"
                        value={systemSettings.max_videos_per_post || "5"}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            "max_videos_per_post",
                            e.target.value
                          )
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    📝 Content Settings
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Post Edit Time Limit (Minutes)"
                        type="number"
                        value={systemSettings.post_edit_time_limit || "60"}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            "post_edit_time_limit",
                            e.target.value
                          )
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">min</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Comment Max Depth"
                        type="number"
                        value={systemSettings.comment_max_depth || "5"}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            "comment_max_depth",
                            e.target.value
                          )
                        }
                        helperText="Maximum nesting level for comments"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Typing Indicator Timeout (Seconds)"
                        type="number"
                        value={systemSettings.typing_indicator_timeout || "10"}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            "typing_indicator_timeout",
                            e.target.value
                          )
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">sec</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSystemSettings}
              disabled={loading}
            >
              Save Settings
            </Button>
          </Box>
        </Paper>
      )}

      {/* Tab 2: Roles & Permissions */}
      {activeTab === 1 && !isManager && (
        <Grid container spacing={3}>
          {/* Roles List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight="bold">
                  Roles
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenRoleDialog()}
                >
                  Add Role
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Role Name</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {role.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {role.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenRoleDialog(role)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRole(role.id)}
                            disabled={["System Admin", "Employee"].includes(
                              role.name
                            )}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Permissions Management */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Permissions Matrix
              </Typography>
              {roles.map((role) => (
                <Accordion
                  key={role.id}
                  defaultExpanded={role.name === "System Admin"}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="bold">{role.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Object.entries(permissionCategories).map(
                      ([category, categoryName]) => (
                        <Box key={category} sx={{ mb: 3 }}>
                          <Typography
                            variant="subtitle2"
                            color="primary"
                            gutterBottom
                          >
                            {categoryName}
                          </Typography>
                          <FormGroup>
                            {groupedPermissions[category]?.map((permission) => {
                              const hasPermission = role.permissions?.some(
                                (p) => p.code === permission.code
                              );
                              return (
                                <FormControlLabel
                                  key={permission.code}
                                  control={
                                    <Checkbox
                                      checked={hasPermission}
                                      onChange={() =>
                                        handleTogglePermission(
                                          role.id,
                                          permission.code,
                                          hasPermission
                                        )
                                      }
                                      size="small"
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography variant="body2">
                                        {permission.description}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {permission.code}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              );
                            })}
                          </FormGroup>
                          <Divider sx={{ mt: 2 }} />
                        </Box>
                      )
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Role Dialog */}
      <Dialog
        open={openRoleDialog}
        onClose={handleCloseRoleDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedRole ? "Edit Role" : "Add New Role"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name"
            value={roleForm.name}
            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={roleForm.description}
            onChange={(e) =>
              setRoleForm({ ...roleForm, description: e.target.value })
            }
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveRole}
            disabled={loading}
          >
            {selectedRole ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
