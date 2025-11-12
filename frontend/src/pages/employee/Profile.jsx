import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Stack,
  CardHeader,
  CardActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import axiosInstance from "../../utils/axios";
import { format } from "date-fns";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    birth_date: "",
    gender: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/users/profile/me");
      console.log("Profile response:", response.data);

      const userData = response.data.data || response.data;

      if (!userData || !userData.id) {
        throw new Error("Invalid profile data");
      }

      setProfile(userData);
      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        birth_date: userData.birth_date
          ? format(new Date(userData.birth_date), "yyyy-MM-dd")
          : "",
        gender: userData.gender || "",
        address: userData.address || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Không thể tải thông tin profile"
      );
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
      birth_date: profile.birth_date
        ? format(new Date(profile.birth_date), "yyyy-MM-dd")
        : "",
      gender: profile.gender || "",
      address: profile.address || "",
    });
    setError("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");

      // Chuẩn bị data - nếu field rỗng thì gửi null để tránh lỗi database
      const dataToSend = {
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        bio: formData.bio || null,
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        address: formData.address || null,
      };

      const response = await axiosInstance.put("/users/profile/me", dataToSend);

      // Fetch lại profile đầy đủ sau khi update
      await fetchProfile();

      setSuccess("Cập nhật profile thành công!");
      setEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          "Có lỗi xảy ra khi cập nhật profile"
      );
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async () => {
    try {
      setError("");

      if (passwordData.new_password !== passwordData.confirm_password) {
        setError("Mật khẩu mới không khớp!");
        return;
      }

      if (passwordData.new_password.length < 6) {
        setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
        return;
      }

      await axiosInstance.put("/users/profile/password", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setSuccess("Đổi mật khẩu thành công!");
      setPasswordDialogOpen(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Có lỗi xảy ra khi đổi mật khẩu"
      );
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await axiosInstance.post("/upload/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update profile with new avatar URL
      await axiosInstance.put("/users/profile/me", {
        avatar_url: response.data.data.avatar_url,
      });

      fetchProfile();
      setSuccess("Cập nhật ảnh đại diện thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Có lỗi xảy ra khi upload ảnh");
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Không tìm thấy thông tin profile</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Thông báo */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Main Card */}
      <Card elevation={3} sx={{ overflow: "visible", borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header Section - Avatar & Name */}
          <Box
            sx={{
              background:
                "linear-gradient(135deg, #e3f2fd 0%, #fff9c4 50%, #ffffff 100%)",
              pt: 4,
              pb: 6,
              px: 3,
              position: "relative",
              borderRadius: "12px 12px 0 0",
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
                transform: "translate(-20%, 20%)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "flex-start" },
                gap: 3,
              }}
            >
              {/* Avatar */}
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={
                    profile.avatar_url
                      ? `http://localhost:3000${profile.avatar_url}`
                      : undefined
                  }
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid white",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0)}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarUpload}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: 5,
                      right: 5,
                      bgcolor: "white",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon fontSize="small" color="primary" />
                  </IconButton>
                </label>
              </Box>

              {/* Name & Info */}
              <Box
                sx={{
                  flex: 1,
                  color: "text.primary",
                  textAlign: { xs: "center", sm: "left" },
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={700}
                  gutterBottom
                  sx={{ color: "#1565c0" }}
                >
                  {profile.full_name || profile.username}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "text.secondary", mb: 1 }}
                >
                  @{profile.username}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}
                >
                  <Chip
                    label={
                      profile.role === "admin" ? "Quản trị viên" : "Nhân viên"
                    }
                    size="small"
                    sx={{
                      bgcolor: profile.role === "admin" ? "#ff6b6b" : "#1976d2",
                      color: "white",
                      fontWeight: 600,
                      boxShadow: 1,
                    }}
                  />
                  {profile.department_name && (
                    <Chip
                      label={profile.department_name}
                      size="small"
                      sx={{
                        bgcolor: "#ffc107",
                        color: "#000",
                        fontWeight: 600,
                        boxShadow: 1,
                      }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Edit Button */}
              <Box sx={{ position: "relative", zIndex: 1 }}>
                {!editing ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{
                      bgcolor: "#1976d2",
                      color: "white",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "#1565c0" },
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{
                        borderColor: "#757575",
                        color: "#757575",
                        "&:hover": {
                          borderColor: "#616161",
                          bgcolor: "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      sx={{
                        bgcolor: "#4caf50",
                        color: "white",
                        boxShadow: 2,
                        "&:hover": { bgcolor: "#388e3c" },
                      }}
                    >
                      Lưu
                    </Button>
                  </Stack>
                )}
              </Box>
            </Box>
          </Box>

          {/* Content Section */}
          <Box sx={{ px: 3, pb: 3, mt: 3 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  Thông tin cá nhân
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      disabled={!editing}
                      variant="outlined"
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profile.email}
                      disabled
                      variant="outlined"
                      size="medium"
                      helperText="Không thể chỉnh sửa"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      variant="outlined"
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={profile.username}
                      disabled
                      variant="outlined"
                      size="medium"
                      helperText="Không thể chỉnh sửa"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!editing} size="medium">
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Giới tính"
                      >
                        <MenuItem value="">Không chọn</MenuItem>
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                        <MenuItem value="other">Khác</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      name="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      disabled={!editing}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      variant="outlined"
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Giới thiệu bản thân"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!editing}
                      variant="outlined"
                      multiline
                      rows={1}
                      size="medium"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Company Info Card */}
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Thông tin công ty
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Đổi mật khẩu
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phòng ban"
                      value={profile.department_name || "Chưa phân công"}
                      disabled
                      variant="outlined"
                      size="medium"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "grey.50",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nhóm/Team"
                      value={profile.team_name || "Chưa phân công"}
                      disabled
                      variant="outlined"
                      size="medium"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "grey.50",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vai trò"
                      value={
                        profile.role === "admin" ? "Quản trị viên" : "Nhân viên"
                      }
                      disabled
                      variant="outlined"
                      size="medium"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "grey.50",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ngày tham gia"
                      value={
                        profile.created_at
                          ? format(
                              new Date(profile.created_at),
                              "dd/MM/yyyy HH:mm"
                            )
                          : ""
                      }
                      disabled
                      variant="outlined"
                      size="medium"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "grey.50",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LockIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Đổi mật khẩu
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Mật khẩu hiện tại"
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              sx={{ mb: 2.5 }}
              size="small"
            />
            <TextField
              fullWidth
              type="password"
              label="Mật khẩu mới"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              sx={{ mb: 2.5 }}
              helperText="Mật khẩu phải có ít nhất 6 ký tự"
              size="small"
            />
            <TextField
              fullWidth
              type="password"
              label="Xác nhận mật khẩu mới"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPasswordDialogOpen(false)} size="medium">
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={
              !passwordData.current_password ||
              !passwordData.new_password ||
              !passwordData.confirm_password
            }
            size="medium"
          >
            Đổi mật khẩu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
