import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard,
  People,
  Article,
  Business,
  Group,
  Folder,
  Assignment,
  Event,
  CalendarMonth,
  BarChart,
  Settings,
  Logout,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

const drawerWidth = 260;
const miniDrawerWidth = 73;

const adminMenuItems = [
  { text: "Trang chủ", icon: <Article />, path: "/admin/posts" },
  { text: "Users", icon: <People />, path: "/admin/users" },
  { text: "Departments", icon: <Business />, path: "/admin/departments" },
  { text: "Teams", icon: <Group />, path: "/admin/teams" },
  { text: "Projects", icon: <Folder />, path: "/admin/projects" },
  { text: "Tasks", icon: <Assignment />, path: "/admin/tasks" },
  { text: "Events", icon: <Event />, path: "/admin/events" },
  { text: "Meetings", icon: <CalendarMonth />, path: "/admin/meetings" },
  { text: "Analytics", icon: <BarChart />, path: "/admin/analytics" },
  { text: "Settings", icon: <Settings />, path: "/admin/settings" },
];

const managerMenuItems = [
  { text: "Trang chủ", icon: <Article />, path: "/manager/posts" },
  { text: "My Department", icon: <Business />, path: "/manager/department" },
  { text: "Teams", icon: <Group />, path: "/manager/teams" },
  { text: "Users", icon: <People />, path: "/manager/users" },
  { text: "Projects", icon: <Folder />, path: "/manager/projects" },
  { text: "Events", icon: <Event />, path: "/manager/events" },
  { text: "Meetings", icon: <CalendarMonth />, path: "/manager/meetings" },
  { text: "Analytics", icon: <BarChart />, path: "/manager/analytics" },
  { text: "Settings", icon: <Settings />, path: "/manager/settings" },
];

const AdminLayout = ({ userType = "admin" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen(!desktopOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = userType === "admin" ? adminMenuItems : managerMenuItems;

  const drawer = (
    <Box
      sx={{
        height: "100%",
        background:
          "linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: desktopOpen ? "space-between" : "center",
          px: [1],
          background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
          color: "white",
        }}
      >
        {desktopOpen && (
          <Typography
            variant="h5"
            noWrap
            component="div"
            fontWeight="bold"
            sx={{ fontSize: "1.5rem" }}
          >
            {userType === "admin" ? "Admin Panel" : "Manager Panel"}
          </Typography>
        )}
        <IconButton
          onClick={handleDesktopDrawerToggle}
          sx={{
            color: "white",
            display: { xs: "none", sm: "block" },
          }}
        >
          {desktopOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Toolbar>
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.3)" }} />
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleMenuClick(item.path)}
              sx={{
                borderRadius: 2,
                transition: "all 0.3s ease",
                justifyContent: desktopOpen ? "initial" : "center",
                px: desktopOpen ? 2 : 1.5,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FFC107 100%)",
                  transform: desktopOpen ? "translateX(8px)" : "scale(1.1)",
                  boxShadow: "0 4px 12px rgba(255, 215, 0, 0.4)",
                  "& .MuiListItemIcon-root": {
                    color: "#000",
                  },
                  "& .MuiListItemText-primary": {
                    color: "#000",
                    fontWeight: 600,
                  },
                },
                "&.Mui-selected": {
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FFC107 100%)",
                  "& .MuiListItemIcon-root": {
                    color: "#000",
                  },
                  "& .MuiListItemText-primary": {
                    color: "#000",
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#1976d2",
                  minWidth: desktopOpen ? 40 : "auto",
                  mr: desktopOpen ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {desktopOpen && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    color: "#0D47A1",
                    fontSize: "1.1rem",
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { sm: desktopOpen ? drawerWidth : miniDrawerWidth },
          flexShrink: { sm: 0 },
          transition: "width 0.3s ease",
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: desktopOpen ? drawerWidth : miniDrawerWidth,
              transition: "width 0.3s ease",
              overflowX: "hidden",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: {
            xs: "100%",
            sm: `calc(100% - ${desktopOpen ? drawerWidth : miniDrawerWidth}px)`,
          },
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          transition: "width 0.3s ease",
        }}
      >
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: {
              xs: "100%",
              sm: `calc(100% - ${
                desktopOpen ? drawerWidth : miniDrawerWidth
              }px)`,
            },
            ml: { sm: `${desktopOpen ? drawerWidth : miniDrawerWidth}px` },
            transition: "all 0.3s ease",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{ flexGrow: 1, fontSize: "1.5rem" }}
            >
              Company Forum
            </Typography>
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar alt={user?.username} src={user?.avatar_url}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={() => navigate("/admin/profile")}>
                <Typography sx={{ fontSize: "1.05rem" }}>Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                <Typography sx={{ fontSize: "1.05rem" }}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            mt: 8,
            width: "100%",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
