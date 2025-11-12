import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  WorkOutline as WorkIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import axiosInstance from "../../utils/axios";
import { format } from "date-fns";

const ManagerProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const { enqueueSnackbar } = useSnackbar();

  const [profileData, setProfileData] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchProfile();
    if (user?.department_id) {
      fetchDepartment();
    }
  }, [user?.department_id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users/${user.id}`);
      const data = response.data.data || response.data;
      setProfileData(data);
      setEditForm({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      enqueueSnackbar("Failed to load profile", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartment = async () => {
    try {
      const response = await axiosInstance.get(
        `/departments/${user.department_id}`
      );
      setDepartment(response.data.data || response.data);
    } catch (error) {
      console.error("Failed to fetch department:", error);
    }
  };

  const handleEditProfile = async () => {
    try {
      await axiosInstance.put(`/users/${user.id}`, editForm);
      enqueueSnackbar("Profile updated successfully", { variant: "success" });
      setOpenEditDialog(false);
      fetchProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update profile",
        { variant: "error" }
      );
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      enqueueSnackbar("Passwords do not match", { variant: "error" });
      return;
    }

    if (passwordForm.new_password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "error",
      });
      return;
    }

    try {
      await axiosInstance.put("/users/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      enqueueSnackbar("Password changed successfully", { variant: "success" });
      setOpenPasswordDialog(false);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to change password",
        { variant: "error" }
      );
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <Box display="flex" alignItems="center" gap={2} py={1.5}>
      <Box
        sx={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          bgcolor: "primary.light",
          color: "primary.main",
        }}
      >
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          👤 My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your personal information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Avatar
              src={profileData?.avatar_url}
              alt={profileData?.full_name}
              sx={{
                width: 120,
                height: 120,
                margin: "0 auto",
                mb: 2,
                border: "4px solid",
                borderColor: "primary.main",
              }}
            >
              {profileData?.full_name?.charAt(0)}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {profileData?.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              @{profileData?.username}
            </Typography>
            <Chip
              icon={<BadgeIcon />}
              label="Department Manager"
              color="primary"
              sx={{ mt: 1, mb: 2 }}
            />
            <Divider sx={{ my: 2 }} />
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setOpenEditDialog(true)}
                fullWidth
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setOpenPasswordDialog(true)}
                fullWidth
              >
                Change Password
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Information Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <InfoRow
                    icon={<PersonIcon />}
                    label="Full Name"
                    value={profileData?.full_name}
                  />
                  <InfoRow
                    icon={<EmailIcon />}
                    label="Email"
                    value={profileData?.email}
                  />
                  <InfoRow
                    icon={<PhoneIcon />}
                    label="Phone"
                    value={profileData?.phone}
                  />
                  <InfoRow
                    icon={<CalendarIcon />}
                    label="Date of Birth"
                    value={
                      profileData?.date_of_birth
                        ? format(
                            new Date(profileData.date_of_birth),
                            "MMM dd, yyyy"
                          )
                        : "N/A"
                    }
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Department Information */}
            {department && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Department Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <InfoRow
                      icon={<BusinessIcon />}
                      label="Department"
                      value={department.name}
                    />
                    <InfoRow
                      icon={<WorkIcon />}
                      label="Department Code"
                      value={department.code}
                    />
                    <Box py={1.5}>
                      <Typography variant="caption" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {department.description || "No description"}
                      </Typography>
                    </Box>
                    <Box py={1.5}>
                      <Chip
                        label={department.is_active ? "Active" : "Inactive"}
                        color={department.is_active ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Account Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Account Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <InfoRow
                    icon={<PersonIcon />}
                    label="Username"
                    value={profileData?.username}
                  />
                  <InfoRow
                    icon={<BadgeIcon />}
                    label="Role"
                    value="Department Manager"
                  />
                  <InfoRow
                    icon={<CalendarIcon />}
                    label="Member Since"
                    value={
                      profileData?.created_at
                        ? format(
                            new Date(profileData.created_at),
                            "MMM dd, yyyy"
                          )
                        : "N/A"
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditProfile} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            Password must be at least 6 characters long
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPassword.current ? "text" : "password"}
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value,
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            current: !showPassword.current,
                          })
                        }
                        edge="end"
                      >
                        {showPassword.current ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword.new ? "text" : "password"}
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            new: !showPassword.new,
                          })
                        }
                        edge="end"
                      >
                        {showPassword.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPassword.confirm ? "text" : "password"}
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            confirm: !showPassword.confirm,
                          })
                        }
                        edge="end"
                      >
                        {showPassword.confirm ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerProfile;
