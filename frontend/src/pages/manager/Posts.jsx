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
  Alert,
} from "@mui/material";
import {
  Image as ImageIcon,
  VideoCall as VideoIcon,
  Poll as PollIcon,
} from "@mui/icons-material";
import { fetchPosts, createPost } from "../../store/slices/postSlice";
import PostCard from "../../components/employee/PostCard";
import CreatePostDialog from "../../components/employee/CreatePostDialog";

const ManagerPosts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts, loading, pagination } = useSelector((state) => state.posts);

  const [openCreatePost, setOpenCreatePost] = useState(false);

  useEffect(() => {
    // Manager chỉ thấy posts của department mình
    if (user?.department_id) {
      dispatch(
        fetchPosts({ page: 1, limit: 10, department_id: user.department_id })
      );
    }
  }, [dispatch, user?.department_id]);

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
      // Refresh posts của department
      dispatch(
        fetchPosts({ page: 1, limit: 10, department_id: user.department_id })
      );
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      dispatch(
        fetchPosts({
          page: pagination.page + 1,
          limit: pagination.limit,
          department_id: user.department_id,
        })
      );
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
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      {/* Create Post Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center">
            <Avatar src={user?.avatar_url} alt={user?.full_name}>
              {user?.full_name?.charAt(0)}
            </Avatar>
            <TextField
              fullWidth
              placeholder={`What's on your mind, ${user?.full_name}?`}
              variant="outlined"
              onClick={handleOpenCreatePost}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 5,
                  backgroundColor: "#f0f2f5",
                  "&:hover": {
                    backgroundColor: "#e4e6eb",
                  },
                },
              }}
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<ImageIcon />}
              sx={{ flex: 1, color: "#45bd62" }}
              onClick={handleOpenCreatePost}
            >
              Photo
            </Button>
            <Button
              startIcon={<VideoIcon />}
              sx={{ flex: 1, color: "#f3425f" }}
              onClick={handleOpenCreatePost}
            >
              Video
            </Button>
            <Button
              startIcon={<PollIcon />}
              sx={{ flex: 1, color: "#f7b928" }}
              onClick={handleOpenCreatePost}
            >
              Poll
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Department Posts Info */}
      <Box sx={{ mb: 2, px: 2 }}>
        <Typography variant="body2" color="text.secondary">
          📌 Viewing posts from your department only
        </Typography>
      </Box>

      {/* Posts List */}
      {loading && posts.length === 0 ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {pagination.page < pagination.totalPages && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Load More"}
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={openCreatePost}
        onClose={handleCloseCreatePost}
        onSubmit={handleCreatePost}
      />
    </Box>
  );
};

export default ManagerPosts;
