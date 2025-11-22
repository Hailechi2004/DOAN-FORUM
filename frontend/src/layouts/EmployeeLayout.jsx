import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputBase,
  Tooltip,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Bookmark as BookmarkIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { logout } from "../store/slices/authSlice";

const drawerWidth = 280;
const miniDrawerWidth = 73;

const EmployeeLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const unreadNotifications = useSelector(
    (state) => state.notifications.unreadCount
  );
  const unreadMessages = useSelector(
    (state) => state.messages.unreadMessagesCount
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen(!desktopOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
  };

  const handleNotificationsOpen = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    {
      text: "News Feed",
      icon: <HomeIcon />,
      path: "/employee/news-feed",
    },
    {
      text: "Messages",
      icon: <MessageIcon />,
      path: "/employee/messages",
      badge: unreadMessages,
    },
    {
      text: "Projects",
      icon: <WorkIcon />,
      path: "/employee/projects",
    },
    {
      text: "Tasks",
      icon: <AssignmentIcon />,
      path: "/employee/tasks",
    },
    {
      text: "Calendar",
      icon: <EventIcon />,
      path: "/employee/calendar",
    },
    {
      text: "Teams",
      icon: <PeopleIcon />,
      path: "/employee/teams",
    },
    {
      text: "Departments",
      icon: <BusinessIcon />,
      path: "/employee/departments",
    },
    {
      text: "Bookmarks",
      icon: <BookmarkIcon />,
      path: "/employee/bookmarks",
    },
  ];

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: desktopOpen ? "space-between" : "center",
          gap: 1.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {desktopOpen && (
          <>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: "primary.main",
                fontSize: "1.25rem",
                fontWeight: 700,
              }}
            >
              CF
            </Avatar>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: "1.5rem",
              }}
            >
              Company Forum
            </Typography>
          </>
        )}
        <IconButton
          onClick={handleDesktopDrawerToggle}
          sx={{
            display: { xs: "none", md: "block" },
          }}
        >
          {desktopOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 1, overflowY: "auto" }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={isSelected}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                minHeight: 48,
                px: desktopOpen ? 2.5 : 1.5,
                justifyContent: desktopOpen ? "initial" : "center",
              }}
            >
              <ListItemIcon
                sx={{
                  color: isSelected ? "primary.main" : "text.secondary",
                  minWidth: desktopOpen ? "auto" : "auto",
                  mr: desktopOpen ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              {desktopOpen && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "1.1rem",
                    fontWeight: isSelected ? 600 : 500,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* User Profile Section */}
      {desktopOpen && (
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "background.default",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
            onClick={handleUserMenuOpen}
          >
            <Avatar
              src={user?.profile?.avatar_url}
              sx={{
                width: 40,
                height: 40,
                bgcolor: "primary.main",
              }}
            >
              {user?.full_name?.[0] || user?.username?.[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.05rem",
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.full_name || user?.username}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.95rem",
                  color: "text.secondary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {user?.email}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar - Fixed on left */}
      <Box
        component="nav"
        sx={{
          width: { md: desktopOpen ? drawerWidth : miniDrawerWidth },
          flexShrink: { md: 0 },
          transition: "width 0.3s ease",
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
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

      {/* Right side - AppBar + Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: {
            md: `calc(100% - ${desktopOpen ? drawerWidth : miniDrawerWidth}px)`,
          },
          transition: "width 0.3s ease",
        }}
      >
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: {
              md: `calc(100% - ${
                desktopOpen ? drawerWidth : miniDrawerWidth
              }px)`,
            },
            ml: { md: `${desktopOpen ? drawerWidth : miniDrawerWidth}px` },
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
          }}
        >
          <Toolbar>
            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Search Bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "background.default",
                borderRadius: 3,
                px: 2,
                py: 0.5,
                flex: { xs: 1, sm: 0 },
                width: { sm: 320 },
                mr: 2,
              }}
            >
              <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
              <InputBase
                placeholder="Search..."
                sx={{
                  flex: 1,
                  fontSize: "1.05rem",
                  "& input::placeholder": {
                    color: "text.secondary",
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Action Buttons */}
            <Stack direction="row" spacing={1}>
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton
                  onClick={handleNotificationsOpen}
                  sx={{
                    bgcolor: "background.default",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Badge badgeContent={unreadNotifications} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Messages */}
              <Tooltip title="Messages">
                <IconButton
                  onClick={() => navigate("/employee/messages")}
                  sx={{
                    bgcolor: "background.default",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Badge badgeContent={unreadMessages} color="error">
                    <MessageIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* User Profile */}
              <Tooltip title="Account">
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{
                    bgcolor: "background.default",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Avatar
                    src={user?.profile?.avatar_url}
                    sx={{ width: 32, height: 32 }}
                  >
                    {user?.full_name?.[0] || user?.username?.[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: "100vh",
            mt: 8,
            bgcolor: "background.default",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: { width: 240, mt: 1.5 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.full_name || user?.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            navigate("/employee/profile");
            handleUserMenuClose();
          }}
        >
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/employee/settings");
            handleUserMenuClose();
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleLogout();
            handleUserMenuClose();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorElNotifications}
        open={Boolean(anchorElNotifications)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: { width: 360, maxHeight: 480, mt: 1.5 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
            Notifications
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          <MenuItem onClick={handleNotificationsClose}>
            <Typography variant="body2">No new notifications</Typography>
          </MenuItem>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            navigate("/employee/notifications");
            handleNotificationsClose();
          }}
          sx={{ justifyContent: "center", color: "primary.main" }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            View All Notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EmployeeLayout;
