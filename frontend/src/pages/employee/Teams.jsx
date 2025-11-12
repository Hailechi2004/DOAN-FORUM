import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Avatar,
  Stack,
  Divider,
  AvatarGroup,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import axiosInstance from "../../utils/axios";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/teams");
      setTeams(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Không thể tải danh sách teams"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          background:
            "linear-gradient(135deg, #e3f2fd 0%, #fff9c4 50%, #ffffff 100%)",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
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
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: "#1976d2",
            }}
          >
            <GroupIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: "#1565c0" }}>
              Teams
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Danh sách các nhóm làm việc
            </Typography>
          </Box>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Tìm kiếm team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Teams Grid */}
      <Grid container spacing={3}>
        {filteredTeams.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <Card
              sx={{
                height: "100%",
                boxShadow: 2,
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        bgcolor: "#1976d2",
                        width: 50,
                        height: 50,
                      }}
                    >
                      <GroupIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ color: "#1565c0" }}
                      >
                        {team.name}
                      </Typography>
                      {team.department_name && (
                        <Chip
                          icon={<BusinessIcon fontSize="small" />}
                          label={team.department_name}
                          size="small"
                          sx={{
                            mt: 0.5,
                            bgcolor: "#ffc107",
                            color: "#000",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Divider />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      minHeight: 60,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {team.description || "Chưa có mô tả"}
                  </Typography>

                  <Divider />

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {team.member_count || 0} thành viên
                      </Typography>
                    </Box>
                    {team.members && team.members.length > 0 && (
                      <AvatarGroup
                        max={3}
                        sx={{
                          "& .MuiAvatar-root": {
                            width: 28,
                            height: 28,
                            fontSize: 14,
                          },
                        }}
                      >
                        {team.members.slice(0, 3).map((member, idx) => (
                          <Avatar
                            key={idx}
                            alt={member.full_name || member.username}
                            src={
                              member.avatar_url
                                ? `http://localhost:3000${member.avatar_url}`
                                : undefined
                            }
                          >
                            {(member.full_name || member.username)?.charAt(0)}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTeams.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? "Không tìm thấy team phù hợp" : "Chưa có team nào"}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
