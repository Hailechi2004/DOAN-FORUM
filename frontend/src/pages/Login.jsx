import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Facebook,
  GitHub,
  Google,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  AppRegistration as SignUpIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../store/slices/authSlice";
import { authService } from "../services/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const handleNavigation = (path) => {
    console.log("🔍 Checking navigation to:", path);
    console.log("🔐 isAuthenticated:", isAuthenticated);

    if (path === "/login" || path === "/register") {
      console.log("✅ Public page, navigating directly");
      navigate(path);
    } else {
      // Kiểm tra đăng nhập cho các trang khác
      if (!isAuthenticated) {
        console.log("❌ Not authenticated, showing dialog");
        setDialogMessage("Vui lòng đăng nhập để truy cập trang này!");
        setOpenDialog(true);
        return;
      }
      console.log("✅ Authenticated, navigating to:", path);
      navigate(path);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(loginStart());
      const response = await authService.login(
        formData.email,
        formData.password
      );

      console.log("🔍 Login response:", response);
      console.log("👤 User data:", response.user);
      console.log("🔐 User roles:", response.user?.roles);

      dispatch(loginSuccess(response));

      // Get roleNames after dispatch (Redux will create it)
      const userRoles = response.user?.roles || [];
      const userRoleNames = userRoles.map((r) => r.name);

      console.log("📋 Role names:", userRoleNames);

      if (
        userRoleNames.includes("System Admin") ||
        userRoleNames.includes("admin")
      ) {
        console.log("✅ Navigating to admin posts");
        navigate("/admin/posts");
      } else if (
        userRoleNames.includes("Department Manager") ||
        userRoleNames.includes("manager")
      ) {
        console.log("✅ Navigating to manager posts");
        navigate("/manager/posts");
      } else {
        console.log("✅ Navigating to employee news feed");
        navigate("/employee/news-feed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      dispatch(loginFailure(err.message));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "url(/images/image.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto",
      }}
    >
      {/* Background Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          p: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            onClick={() => navigate("/")}
            sx={{
              color: "white",
              fontWeight: 800,
              letterSpacing: 1.5,
              fontSize: { xs: "1.35rem", md: "1.65rem" },
              textShadow: "0 2px 10px rgba(0,0,0,0.4)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                textShadow: "0 4px 15px rgba(255,255,255,0.3)",
              },
            }}
          >
            Forum Company
          </Typography>
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
            <Button
              startIcon={<DashboardIcon />}
              onClick={() => handleNavigation("/admin/posts")}
              sx={{
                color: "white",
                fontSize: "1.05rem",
                fontWeight: 700,
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Trang chủ
            </Button>
            <Button
              startIcon={<PersonIcon />}
              onClick={() => handleNavigation("/profile")}
              sx={{
                color: "white",
                fontSize: "1.05rem",
                fontWeight: 700,
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Profile
            </Button>
            <Button
              startIcon={<SignUpIcon />}
              onClick={() => handleNavigation("/register")}
              sx={{
                color: "white",
                fontSize: "1.05rem",
                fontWeight: 700,
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Sign Up
            </Button>
            <Button
              startIcon={<LoginIcon />}
              onClick={() => handleNavigation("/login")}
              sx={{
                color: "white",
                fontSize: "1.05rem",
                fontWeight: 700,
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Login Card - Centered */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 520,
            mx: "auto",
            px: 3,
          }}
        >
          <Card
            sx={{
              width: "100%",
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(195deg, #42A5F5, #1565C0)",
                borderRadius: 3,
                p: 4,
                py: 4.5,
                mx: 3,
                mt: -4,
                mb: 3,
                textAlign: "center",
                boxShadow: "0 4px 20px 0 rgba(26, 115, 232, 0.5)",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  mb: 1.5,
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                }}
              >
                Sign in
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Facebook />
                </IconButton>
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <GitHub />
                </IconButton>
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Google />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ px: 4, pb: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  autoComplete="email"
                  autoFocus
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  autoComplete="current-password"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Remember me
                    </Typography>
                  }
                  sx={{ mt: 2 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    background: "linear-gradient(195deg, #42A5F5, #1565C0)",
                    boxShadow: "0 4px 20px 0 rgba(26, 115, 232, 0.5)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: 1,
                    borderRadius: 2,
                    "&:hover": {
                      background: "linear-gradient(195deg, #42A5F5, #1565C0)",
                      opacity: 0.95,
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 25px 0 rgba(26, 115, 232, 0.6)",
                    },
                  }}
                >
                  {loading ? "SIGNING IN..." : "SIGN IN"}
                </Button>

                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      style={{
                        color: "#1565C0",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Sign up
                    </Link>
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.5 }}
                  >
                    Test Account:
                  </Typography>
                  <Typography variant="caption" color="primary" display="block">
                    admin@example.com / Admin123!
                  </Typography>
                </Box>
              </form>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          p: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.95)",
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              fontWeight: 700,
              textShadow: "0 2px 10px rgba(0,0,0,0.4)",
            }}
          >
            © 2025, made with ❤️ by Creative Tim for a better web.
          </Typography>
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
            <Button
              component="a"
              href="https://www.creative-tim.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "rgba(255,255,255,0.95)",
                fontSize: "1.05rem",
                fontWeight: 700,
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Creative Tim
            </Button>
            <Button
              component="a"
              href="#about"
              sx={{
                color: "rgba(255,255,255,0.95)",
                fontSize: "1.05rem",
                fontWeight: 700,
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              About Us
            </Button>
            <Button
              component="a"
              href="#blog"
              sx={{
                color: "rgba(255,255,255,0.95)",
                fontSize: "1.05rem",
                fontWeight: 700,
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Blog
            </Button>
            <Button
              component="a"
              href="#license"
              sx={{
                color: "rgba(255,255,255,0.95)",
                fontSize: "1.05rem",
                fontWeight: 700,
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              License
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Dialog thông báo */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(195deg, #42A5F5, #1565C0)",
            color: "white",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Yêu cầu đăng nhập
        </DialogTitle>
        <DialogContent sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
            {dialogMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              background: "linear-gradient(195deg, #42A5F5, #1565C0)",
              color: "white",
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(195deg, #42A5F5, #1565C0)",
                opacity: 0.9,
              },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
