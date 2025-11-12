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
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
    <Box>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: [1],
        }}
      >
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          {userType === "admin" ? "Admin Panel" : "Manager Panel"}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleMenuClick(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
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
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
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
              width: drawerWidth,
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
          width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
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
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
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
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Logout
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
