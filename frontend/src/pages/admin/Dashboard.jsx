import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
} from "@mui/material";
import {
  People as PeopleIcon,
  PostAdd as PostIcon,
  Folder as ProjectIcon,
  Business as DepartmentIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import axiosInstance from "../../utils/axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    projects: 0,
    departments: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats
      const [usersRes, postsRes, projectsRes, deptsRes] = await Promise.all([
        axiosInstance.get("/users").catch(() => ({ data: [] })),
        axiosInstance.get("/posts").catch(() => ({ data: [] })),
        axiosInstance.get("/projects").catch(() => ({ data: [] })),
        axiosInstance.get("/departments").catch(() => ({ data: [] })),
      ]);

      setStats({
        users: Array.isArray(usersRes.data)
          ? usersRes.data.length
          : usersRes.data?.users?.length || 0,
        posts: Array.isArray(postsRes.data)
          ? postsRes.data.length
          : postsRes.data?.posts?.length || 0,
        projects: Array.isArray(projectsRes.data)
          ? projectsRes.data.length
          : projectsRes.data?.projects?.length || 0,
        departments: Array.isArray(deptsRes.data)
          ? deptsRes.data.length
          : deptsRes.data?.departments?.length || 0,
      });

      // Get recent projects
      const projects = Array.isArray(projectsRes.data)
        ? projectsRes.data
        : projectsRes.data?.projects || [];
      setRecentProjects(projects.slice(0, 5));

      // Get recent posts
      const posts = Array.isArray(postsRes.data)
        ? postsRes.data
        : postsRes.data?.posts || [];
      setRecentPosts(posts.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <Card
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease",
        background: `linear-gradient(135deg, #ffffff 0%, ${color}15 100%)`,
        boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: `0 8px 24px ${color}30`,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
              boxShadow: `0 4px 12px ${color}40`,
            }}
          >
            <Icon fontSize="large" />
          </Avatar>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: color }}>
              {loading ? "-" : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    const colors = {
      active: "success",
      planning: "info",
      completed: "default",
      on_hold: "warning",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
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
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Người dùng"
            value={stats.users}
            icon={PeopleIcon}
            color="#2196f3"
            onClick={() => navigate("/admin/users")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bài viết"
            value={stats.posts}
            icon={PostIcon}
            color="#4caf50"
            onClick={() => navigate("/admin/posts")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dự án"
            value={stats.projects}
            icon={ProjectIcon}
            color="#ff9800"
            onClick={() => navigate("/admin/projects")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Phòng ban"
            value={stats.departments}
            icon={DepartmentIcon}
            color="#9c27b0"
            onClick={() => navigate("/admin/departments")}
          />
        </Grid>
      </Grid>

      {/* Recent Projects & Posts */}
      <Grid container spacing={3}>
        {/* Recent Projects */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Dự án gần đây
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/projects")}
                  sx={{ fontWeight: 600 }}
                >
                  Xem tất cả
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ py: 3 }}>
                  <LinearProgress />
                </Box>
              ) : recentProjects.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 3, textAlign: "center" }}
                >
                  Chưa có dự án nào
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentProjects.map((project, index) => (
                    <Box key={project.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "rgba(33, 150, 243, 0.05)",
                          },
                          px: 2,
                          py: 1.5,
                        }}
                        onClick={() =>
                          navigate(`/admin/projects/${project.id}`)
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: "#2196f3",
                              width: 40,
                              height: 40,
                            }}
                          >
                            <ProjectIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight={600}>
                              {project.name}
                            </Typography>
                          }
                          secondary={
                            <Box
                              component="span"
                              sx={{
                                display: "flex",
                                gap: 1,
                                mt: 0.5,
                                alignItems: "center",
                              }}
                            >
                              <Chip
                                label={project.status?.replace("_", " ")}
                                size="small"
                                color={getStatusColor(project.status)}
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                              {project.start_date && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {format(
                                    new Date(project.start_date),
                                    "dd/MM/yyyy",
                                    { locale: vi }
                                  )}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Posts */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Bài viết gần đây
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/posts")}
                  sx={{ fontWeight: 600 }}
                >
                  Xem tất cả
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ py: 3 }}>
                  <LinearProgress />
                </Box>
              ) : recentPosts.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 3, textAlign: "center" }}
                >
                  Chưa có bài viết nào
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentPosts.map((post, index) => (
                    <Box key={post.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "rgba(33, 150, 243, 0.05)",
                          },
                          px: 2,
                          py: 1.5,
                        }}
                        onClick={() => navigate(`/posts/${post.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={post.author?.avatar_url}
                            sx={{ width: 40, height: 40 }}
                          >
                            {post.author?.full_name?.[0] || "?"}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {post.title}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {post.author?.full_name} •{" "}
                              {post.created_at &&
                                format(
                                  new Date(post.created_at),
                                  "dd/MM/yyyy",
                                  { locale: vi }
                                )}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
