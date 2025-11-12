import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Stack,
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Chip,
  TextField,
  Collapse,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  ThumbUpOutlined,
  ThumbUp,
  Comment as CommentIcon,
  Share as ShareIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import {
  reactToPost,
  createComment,
  fetchComments,
} from "../../store/slices/postSlice";
import ReactionPicker from "./ReactionPicker";
import PostDetailDialog from "./PostDetailDialog";

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userReaction, setUserReaction] = useState(post.user_reaction || null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReact = async (reactionType) => {
    try {
      await dispatch(reactToPost({ id: post.id, reactionType })).unwrap();
      setUserReaction(reactionType === userReaction ? null : reactionType);
    } catch (error) {
      console.error("Failed to react:", error);
    }
  };

  const handleCommentToggle = () => {
    const newShowComments = !showComments;
    setShowComments(newShowComments);

    // Fetch comments nếu chưa có và đang mở
    if (
      newShowComments &&
      (!post.comments || post.comments.length === 0) &&
      post.comment_count > 0
    ) {
      console.log("📥 Fetching comments for post:", post.id);
      dispatch(fetchComments(post.id));
    } else {
      console.log("📝 Post comments:", post.comments);
    }
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      dispatch(createComment({ postId: post.id, content: commentText }));
      setCommentText("");
    }
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
    <>
      <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
        <CardHeader
          avatar={
            <Avatar src={post.author_avatar_url} sx={{ width: 40, height: 40 }}>
              {post.author_name?.[0]}
            </Avatar>
          }
          action={
            <>
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Save post</MenuItem>
                <MenuItem onClick={handleMenuClose}>Hide post</MenuItem>
                <MenuItem onClick={handleMenuClose}>Report post</MenuItem>
              </Menu>
            </>
          }
          title={
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, fontSize: "1rem" }}
            >
              {post.author_name}
            </Typography>
          }
          subheader={
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.875rem" }}
              >
                {formatDate(post.created_at)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              {getVisibilityIcon()}
            </Stack>
          }
        />

        <CardContent sx={{ pt: 0 }}>
          {/* Post Title */}
          {post.title && (
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: 600, fontSize: "1.25rem" }}
            >
              {post.title}
            </Typography>
          )}

          {/* Post Content */}
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              whiteSpace: "pre-wrap",
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
          >
            {post.content}
          </Typography>

          {/* Post Category */}
          {post.category_name && (
            <Chip
              label={post.category_name}
              size="medium"
              sx={{ mb: 1, fontSize: "0.875rem" }}
              color="primary"
              variant="outlined"
            />
          )}

          {/* Post Attachments (Images) */}
          {post.attachments && post.attachments.length > 0 && (
            <Box
              sx={{ mt: 2, mx: -2, cursor: "pointer" }}
              onClick={() => setDetailOpen(true)}
            >
              {post.attachments.filter((a) => a.attachment_type === "image")
                .length === 1 ? (
                // Single image - maintain aspect ratio, no cropping
                <Box
                  sx={{
                    width: "100%",
                    bgcolor: "grey.100",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={`http://localhost:3000${post.attachments[0].storage_path}`}
                    alt={post.attachments[0].original_name}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "600px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
              ) : post.attachments.filter((a) => a.attachment_type === "image")
                  .length === 2 ? (
                // 2 images - side by side, equal width
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 0.25,
                    bgcolor: "grey.100",
                  }}
                >
                  {post.attachments
                    .filter((a) => a.attachment_type === "image")
                    .slice(0, 2)
                    .map((attachment) => (
                      <Box
                        key={attachment.id}
                        sx={{
                          position: "relative",
                          paddingTop: "100%",
                          bgcolor: "grey.200",
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={`http://localhost:3000${attachment.storage_path}`}
                          alt={attachment.original_name}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                </Box>
              ) : post.attachments.filter((a) => a.attachment_type === "image")
                  .length === 3 ? (
                // 3 images - 1 big left, 2 small stacked right (Facebook style)
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gridTemplateRows: "1fr 1fr",
                    gap: 0.25,
                    height: "550px",
                    bgcolor: "grey.100",
                  }}
                >
                  <Box
                    sx={{
                      gridRow: "1 / 3",
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={`http://localhost:3000${post.attachments[0].storage_path}`}
                      alt={post.attachments[0].original_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  {post.attachments
                    .filter((a) => a.attachment_type === "image")
                    .slice(1, 3)
                    .map((attachment) => (
                      <Box
                        key={attachment.id}
                        sx={{
                          position: "relative",
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={`http://localhost:3000${attachment.storage_path}`}
                          alt={attachment.original_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                </Box>
              ) : post.attachments.filter((a) => a.attachment_type === "image")
                  .length === 4 ? (
                // 4 images - 1 big left, 3 small stacked right (better aspect ratio)
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gridTemplateRows: "repeat(3, 1fr)",
                    gap: 0.25,
                    height: "600px",
                    bgcolor: "grey.100",
                  }}
                >
                  <Box
                    sx={{
                      gridRow: "1 / 4",
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={`http://localhost:3000${post.attachments[0].storage_path}`}
                      alt={post.attachments[0].original_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  {post.attachments
                    .filter((a) => a.attachment_type === "image")
                    .slice(1, 4)
                    .map((attachment) => (
                      <Box
                        key={attachment.id}
                        sx={{
                          position: "relative",
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={`http://localhost:3000${attachment.storage_path}`}
                          alt={attachment.original_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                </Box>
              ) : (
                // 5+ images - 2 big top, 3 small bottom row
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gridTemplateRows: "2fr 1fr",
                    gap: 0.25,
                    height: "600px",
                    bgcolor: "grey.100",
                  }}
                >
                  {/* First 2 images - span 2 columns and first row */}
                  <Box
                    sx={{
                      gridColumn: "1 / 3",
                      gridRow: "1",
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={`http://localhost:3000${post.attachments[0].storage_path}`}
                      alt={post.attachments[0].original_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      gridColumn: "3",
                      gridRow: "1",
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={`http://localhost:3000${post.attachments[1].storage_path}`}
                      alt={post.attachments[1].original_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>

                  {/* Bottom 3 images */}
                  {post.attachments
                    .filter((a) => a.attachment_type === "image")
                    .slice(2, 5)
                    .map((attachment, index) => (
                      <Box
                        key={attachment.id}
                        sx={{
                          position: "relative",
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={`http://localhost:3000${attachment.storage_path}`}
                          alt={attachment.original_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        {index === 2 &&
                          post.attachments.filter(
                            (a) => a.attachment_type === "image"
                          ).length > 5 && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                bgcolor: "rgba(0,0,0,0.7)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                variant="h3"
                                sx={{ color: "white", fontWeight: 700 }}
                              >
                                +
                                {post.attachments.filter(
                                  (a) => a.attachment_type === "image"
                                ).length - 5}
                              </Typography>
                            </Box>
                          )}
                      </Box>
                    ))}
                </Box>
              )}
            </Box>
          )}

          {/* Legacy support for old posts.images format */}
          {!post.attachments && post.images && post.images.length > 0 && (
            <Box
              sx={{
                mt: 2,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "background.default",
              }}
            >
              <img
                src={post.images[0]}
                alt="Post"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </Box>
          )}
        </CardContent>

        {/* Reactions Summary */}
        {totalReactions > 0 && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Stack direction="row" spacing={-0.5}>
                  {reactionCounts.like > 0 && (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white",
                      }}
                    >
                      <ThumbUp sx={{ fontSize: 12, color: "white" }} />
                    </Box>
                  )}
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.9rem" }}
                >
                  {totalReactions}{" "}
                  {totalReactions === 1 ? "reaction" : "reactions"}
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.9rem" }}
              >
                {post.comment_count || 0} comments
              </Typography>
            </Stack>
          </Box>
        )}

        <Divider />

        {/* Action Buttons */}
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
            onClick={handleCommentToggle}
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

        <Divider />

        {/* Comments Section */}
        <Collapse in={showComments}>
          <Box sx={{ p: 2 }}>
            {/* Write Comment */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
              sx={{ mb: 2 }}
            >
              <Avatar
                src={user?.profile?.avatar_url}
                sx={{ width: 32, height: 32 }}
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

            {/* Comments List */}
            {post.comments && post.comments.length > 0 && (
              <Stack spacing={2}>
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
                        sx={{ width: 32, height: 32 }}
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
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{ px: 1.5, mt: 0.5 }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 600 }}
                          >
                            Like
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 600 }}
                          >
                            Reply
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.created_at)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Collapse>
      </Card>

      {/* Post Detail Dialog */}
      <PostDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        post={post}
      />
    </>
  );
};

export default PostCard;
