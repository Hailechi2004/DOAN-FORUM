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
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import axiosInstance from "../../utils/axios";
import { format } from "date-fns";

export default function AdminProfile() {
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

      const dataToSend = {
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        bio: formData.bio || null,
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        address: formData.address || null,
      };

      await axiosInstance.put("/users/profile/me", dataToSend);
      await fetchProfile();

      setSuccess("Cập nhật profile thành công!");
      setEditing(false);
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

      <Card elevation={3} sx={{ overflow: "visible", borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header with gradient background */}
          <Box
            sx={{
              background:
                "linear-gradient(135deg, #e3f2fd 0%, #fff9c4 50%, #ffffff 100%)",
              pt: 4,
              pb: 6,
              px: 3,
              position: "relative",
              borderRadius: "12px 12px 0 0",
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
              {/* Avatar with upload button */}
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

              {/* User info */}
              <Box
                sx={{
                  flex: 1,
                  textAlign: { xs: "center", sm: "left" },
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
                    label="Quản trị viên"
                    size="small"
                    sx={{
                      bgcolor: "#ff6b6b",
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

              {/* Action buttons */}
              <Box>
                {!editing ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{
                      background:
                        "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                      color: "#000",
                      fontWeight: 600,
                      boxShadow: 2,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)",
                      },
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
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      sx={{
                        background:
                          "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                        color: "white",
                        boxShadow: 2,
                      }}
                    >
                      Lưu
                    </Button>
                  </Stack>
                )}
              </Box>
            </Box>
          </Box>

          {/* Form content */}
          <Box sx={{ px: 3, pb: 3, mt: 3 }}>
            {/* Personal Info Card */}
            <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  sx={{ mb: 3, color: "#1976d2" }}
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profile.email}
                      disabled
                      variant="outlined"
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={profile.username}
                      disabled
                      variant="outlined"
                      helperText="Không thể chỉnh sửa"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!editing}>
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
                      rows={3}
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
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: "#1976d2" }}
                  >
                    Thông tin hệ thống
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<LockIcon />}
                    onClick={() => setPasswordDialogOpen(true)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                      color: "white",
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vai trò"
                      value="Quản trị viên"
                      disabled
                      variant="outlined"
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
                      label="Phòng ban"
                      value={profile.department_name || "Chưa phân công"}
                      disabled
                      variant="outlined"
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
            />
            <TextField
              fullWidth
              type="password"
              label="Xác nhận mật khẩu mới"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPasswordDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={
              !passwordData.current_password ||
              !passwordData.new_password ||
              !passwordData.confirm_password
            }
          >
            Đổi mật khẩu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
