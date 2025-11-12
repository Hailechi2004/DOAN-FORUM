import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Card,
  CardContent,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Image as ImageIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import axiosInstance from "../../utils/axios";

const ManagerSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      // Mock settings data for now since /api/settings doesn't exist yet
      const mockSettings = {
        general: {
          site_name: "Company Forum",
          site_description: "Internal communication platform",
          timezone: "Asia/Ho_Chi_Minh",
          language: "vi",
        },
        posts: {
          max_content_length: 10000,
          allow_anonymous: false,
          require_approval: false,
          max_attachments: 5,
        },
        media: {
          max_image_size_mb: 5,
          max_video_size_mb: 50,
          allowed_image_types: ["jpg", "jpeg", "png", "gif"],
          allowed_video_types: ["mp4", "mov", "avi"],
        },
        notifications: {
          email_enabled: true,
          push_enabled: true,
          digest_frequency: "daily",
        },
      };

      setSystemSettings(mockSettings);

      // Uncomment when backend API is ready:
      // const response = await axiosInstance.get("/settings");
      // setSystemSettings(response.data.data || response.data || {});
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ⚙️ System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View system configuration (Read-only for managers)
        </Typography>
      </Box>

      {/* Read-only Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> As a manager, you can only view system
          settings. Contact administrator to request changes.
        </Typography>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* System Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          System Configuration
        </Typography>

        {/* File Upload Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <ImageIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>
                File Upload Settings
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                {loading ? (
                  <Skeleton height={56} />
                ) : (
                  <TextField
                    fullWidth
                    label="Max File Size (MB)"
                    value={systemSettings.max_file_size_mb || 10}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {loading ? (
                  <Skeleton height={56} />
                ) : (
                  <TextField
                    fullWidth
                    label="Max Images per Post"
                    value={systemSettings.max_images_per_post || 10}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {loading ? (
                  <Skeleton height={56} />
                ) : (
                  <TextField
                    fullWidth
                    label="Max Videos per Post"
                    value={systemSettings.max_videos_per_post || 3}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <ArticleIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>
                Content Settings
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                {loading ? (
                  <Skeleton height={56} />
                ) : (
                  <TextField
                    fullWidth
                    label="Post Edit Time Limit (minutes)"
                    value={systemSettings.post_edit_time_limit || 15}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {loading ? (
                  <Skeleton height={56} />
                ) : (
                  <TextField
                    fullWidth
                    label="Comment Max Depth"
                    value={systemSettings.comment_max_depth || 5}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {loading ? (
                  <Skeleton height={56} />
                ) : (
                  <TextField
                    fullWidth
                    label="Typing Indicator Timeout (seconds)"
                    value={systemSettings.typing_indicator_timeout || 3}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Paper>

      {/* Roles & Permissions - Hidden for Managers */}
      <Alert severity="warning">
        <Typography variant="body2">
          <strong>Roles & Permissions:</strong> This section is only accessible
          to system administrators. You do not have permission to view or modify
          roles and permissions.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ManagerSettings;
