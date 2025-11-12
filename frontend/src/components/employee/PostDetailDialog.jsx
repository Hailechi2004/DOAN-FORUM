import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Typography,
  Avatar,
  Stack,
  Divider,
  TextField,
  Button,
  CardActions,
} from "@mui/material";
import {
  Close as CloseIcon,
  ThumbUpOutlined,
  ThumbUp,
  Public as PublicIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  Send as SendIcon,
  ChevronLeft,
  ChevronRight,
  Comment as CommentIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { reactToPost, createComment } from "../../store/slices/postSlice";
import ReactionPicker from "./ReactionPicker";

const PostDetailDialog = ({ open, onClose, post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [commentText, setCommentText] = useState("");
  const [userReaction, setUserReaction] = useState(post?.user_reaction || null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!post) return null;

  const handleReact = async (reactionType) => {
    try {
      await dispatch(reactToPost({ id: post.id, reactionType })).unwrap();
      setUserReaction(reactionType === userReaction ? null : reactionType);
    } catch (error) {
      console.error("Failed to react:", error);
    }
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      dispatch(createComment({ postId: post.id, content: commentText }));
      setCommentText("");
    }
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case "public":
        return <PublicIcon fontSize="small" />;
      case "private":
        return <LockIcon fontSize="small" />;
      case "department":
        return <BusinessIcon fontSize="small" />;
      default:
        return <PublicIcon fontSize="small" />;
    }
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const images =
    post.attachments?.filter((a) => a.attachment_type === "image") || [];

  const reactionCounts = post.reaction_counts || {
    like: 0,
    love: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  };

  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const reactionEmojis = {
    like: "👍",
    love: "❤️",
    haha: "😄",
    wow: "😮",
    sad: "😢",
    angry: "😠",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "900px",
          borderRadius: 2,
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          zIndex: 1,
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          height: "100%",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left Side - Images */}
        {images.length > 0 && (
          <Box
            sx={{
              width: { xs: "100%", md: "65%" },
              bgcolor: "black",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Main Image */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <img
                src={`http://localhost:3000${images[selectedImageIndex].storage_path}`}
                alt={images[selectedImageIndex].original_name}
                style={{
                  maxWidth: "98%",
                  maxHeight: "95%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
              />

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePreviousImage}
                    sx={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 1)",
                      },
                      boxShadow: 2,
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>

                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 1)",
                      },
                      boxShadow: 2,
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </>
              )}
            </Box>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 1,
                  bgcolor: "rgba(0,0,0,0.6)",
                  borderRadius: 2,
                  p: 1,
                }}
              >
                {images.map((img, index) => (
                  <Box
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      border:
                        selectedImageIndex === index
                          ? "3px solid white"
                          : "3px solid transparent",
                      opacity: selectedImageIndex === index ? 1 : 0.6,
                      transition: "all 0.2s",
                      "&:hover": {
                        opacity: 1,
                      },
                    }}
                  >
                    <img
                      src={`http://localhost:3000${img.storage_path}`}
                      alt={img.original_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Right Side - Post Details & Comments */}
        <Box
          sx={{
            width: { xs: "100%", md: images.length > 0 ? "35%" : "100%" },
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Post Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                src={post.author_avatar_url}
                sx={{ width: 48, height: 48 }}
              >
                {post.author_name?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {post.author_name}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(post.created_at)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    •
                  </Typography>
                  {getVisibilityIcon()}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Post Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
            }}
          >
            {/* Title & Content */}
            {post.title && (
              <Typography
                variant="h6"
                sx={{ mb: 1, fontWeight: 600, fontSize: "1.25rem" }}
              >
                {post.title}
              </Typography>
            )}
            <Typography
              variant="body1"
              sx={{ mb: 2, whiteSpace: "pre-wrap", lineHeight: 1.6 }}
            >
              {post.content}
            </Typography>

            {/* Reactions Summary */}
            {totalReactions > 0 && (
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Stack direction="row" spacing={-0.5}>
                    {Object.entries(reactionCounts)
                      .filter(([_, count]) => count > 0)
                      .slice(0, 3)
                      .map(([type, _]) => (
                        <Box
                          key={type}
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            bgcolor: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid white",
                            fontSize: "0.75rem",
                          }}
                        >
                          {reactionEmojis[type]}
                        </Box>
                      ))}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {totalReactions}
                  </Typography>
                </Stack>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Comments Section */}
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Comments ({post.comment_count || 0})
            </Typography>

            {post.comments && post.comments.length > 0 && (
              <Stack spacing={2} sx={{ mb: 2 }}>
                {post.comments.map((comment) => {
                  // Safety check for comment data
                  if (!comment) return null;

                  return (
                    <Stack
                      key={comment.id}
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <Avatar
                        src={comment.author_avatar_url || null}
                        sx={{ width: 36, height: 36 }}
                      >
                        {comment.author_name?.[0] ||
                          comment.author_full_name?.[0] ||
                          "?"}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            bgcolor: "background.default",
                            borderRadius: 2,
                            p: 1.5,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            {comment.author_full_name ||
                              comment.author_name ||
                              "Unknown"}
                          </Typography>
                          <Typography variant="body2">
                            {comment.content}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1.5, mt: 0.5, display: "block" }}
                        >
                          {formatDate(comment.created_at)}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Box>

          {/* Action Buttons */}
          <Divider />
          <CardActions sx={{ px: 2, py: 1 }}>
            <ReactionPicker
              onSelect={handleReact}
              onDirectClick={() => handleReact("like")}
              currentReaction={userReaction}
            >
              <Button
                fullWidth
                startIcon={
                  userReaction ? (
                    <span style={{ fontSize: "1.2rem" }}>
                      {reactionEmojis[userReaction]}
                    </span>
                  ) : (
                    <ThumbUpOutlined />
                  )
                }
                sx={{
                  color: userReaction ? "primary.main" : "text.secondary",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  py: 1,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                {userReaction
                  ? userReaction.charAt(0).toUpperCase() + userReaction.slice(1)
                  : "Like"}
              </Button>
            </ReactionPicker>

            <Button
              fullWidth
              startIcon={<CommentIcon />}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                py: 1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              Comment
            </Button>

            <Button
              fullWidth
              startIcon={<ShareIcon />}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                py: 1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              Share
            </Button>
          </CardActions>

          {/* Write Comment */}
          <Box sx={{ p: 2, pt: 0 }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Avatar
                src={user?.profile?.avatar_url}
                sx={{ width: 36, height: 36 }}
              >
                {user?.full_name?.[0] || user?.username?.[0]}
              </Avatar>
              <TextField
                fullWidth
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                multiline
                maxRows={4}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "background.default",
                  },
                }}
                InputProps={{
                  endAdornment: commentText.trim() && (
                    <IconButton size="small" onClick={handleCommentSubmit}>
                      <SendIcon fontSize="small" color="primary" />
                    </IconButton>
                  ),
                }}
              />
            </Stack>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailDialog;
