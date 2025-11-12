import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Typography,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Image as ImageIcon,
  VideoCall as VideoIcon,
  Poll as PollIcon,
} from "@mui/icons-material";
import { fetchPosts, createPost } from "../../store/slices/postSlice";
import PostCard from "../../components/employee/PostCard";
import CreatePostDialog from "../../components/employee/CreatePostDialog";

const AdminPosts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts, loading, pagination } = useSelector((state) => state.posts);

  const [openCreatePost, setOpenCreatePost] = useState(false);

  useEffect(() => {
    // Admin sees all posts, no department filter
    const params = { page: 1, limit: 10 };
    dispatch(fetchPosts(params));
  }, [dispatch]);

  const handleOpenCreatePost = () => {
    setOpenCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    setOpenCreatePost(false);
  };

  const handleCreatePost = async (postData) => {
    try {
      await dispatch(createPost(postData)).unwrap();
      handleCloseCreatePost();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      const params = { page: pagination.page + 1, limit: pagination.limit };
      if (isManager && departmentId) {
        params.department_id = departmentId;
      }
      dispatch(fetchPosts(params));
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      {/* Header with Gradient */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          background:
            "linear-gradient(135deg, #e3f2fd 0%, #fff9c4 50%, #ffffff 100%)",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
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
            transform: "translate(-30%, 30%)",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ color: "#1565c0" }}
          >
            Trang chủ
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Share and explore company updates, news, and discussions
          </Typography>
        </Box>
      </Box>

      <Stack spacing={3}>
        {/* Create Post Card */}
        <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={user?.profile?.avatar_url}
                sx={{ width: 48, height: 48 }}
              >
                {user?.full_name?.[0] || user?.username?.[0]}
              </Avatar>
              <TextField
                fullWidth
                placeholder={`What's on your mind, ${
                  user?.full_name || user?.username
                }?`}
                variant="outlined"
                size="medium"
                onClick={handleOpenCreatePost}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 5,
                    bgcolor: "background.default",
                    cursor: "pointer",
                    fontSize: "1rem",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  },
                }}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack
              direction="row"
              spacing={1}
              justifyContent="space-around"
              sx={{ pt: 0.5 }}
            >
              <Button
                sx={{
                  flex: 1,
                  py: 1.2,
                  color: "success.main",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={handleOpenCreatePost}
              >
                <ImageIcon sx={{ fontSize: 24, mr: 1 }} />
                Photo/Video
              </Button>
              <Button
                sx={{
                  flex: 1,
                  py: 1.2,
                  color: "error.main",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={handleOpenCreatePost}
              >
                <VideoIcon sx={{ fontSize: 24, mr: 1 }} />
                Live Video
              </Button>
              <Button
                sx={{
                  flex: 1,
                  py: 1.2,
                  color: "warning.main",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={handleOpenCreatePost}
              >
                <PollIcon sx={{ fontSize: 24, mr: 1 }} />
                Poll
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Posts List */}
        {loading && posts.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Load More Button */}
            {pagination.page < pagination.totalPages && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </Box>
            )}
          </>
        )}
      </Stack>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={openCreatePost}
        onClose={handleCloseCreatePost}
        onSubmit={handleCreatePost}
      />
    </Box>
  );
};

export default AdminPosts;
