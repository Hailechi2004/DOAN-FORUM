import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Typography,
  IconButton,
  Stack,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  Image as ImageIcon,
  VideoCall as VideoIcon,
  Poll as PollIcon,
  Send as SendIcon,
  ThumbUp,
  ThumbUpOutlined,
  Comment as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import {
  fetchPosts,
  createPost,
  reactToPost,
  setFilters,
} from "../../store/slices/postSlice";
import PostCard from "../../components/employee/PostCard";
import CreatePostDialog from "../../components/employee/CreatePostDialog";

const NewsFeed = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts, loading, pagination } = useSelector((state) => state.posts);

  console.log("📊 NewsFeed State:", { posts, loading, pagination, user });

  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");

  useEffect(() => {
    console.log("🔍 NewsFeed mounting...");
    console.log("👤 User:", user);
    dispatch(fetchPosts({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleOpenCreatePost = () => {
    setOpenCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    setOpenCreatePost(false);
    setNewPostContent("");
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
      dispatch(
        fetchPosts({ page: pagination.page + 1, limit: pagination.limit })
      );
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        p: 3,
      }}
    >
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

export default NewsFeed;
