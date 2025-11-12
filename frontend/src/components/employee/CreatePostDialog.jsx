import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Avatar,
  Stack,
  IconButton,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Typography,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  Image as ImageIcon,
  VideoCall as VideoIcon,
  EmojiEmotions as EmojiIcon,
  Campaign as AnnouncementIcon,
  Share as ShareIcon,
  Comment as OpinionIcon,
  Event as EventIcon,
  Chat as DiscussionIcon,
  Help as QuestionIcon,
  Group as SocialIcon,
} from "@mui/icons-material";
import api from "../../utils/axios";

const CreatePostDialog = ({ open, onClose, onSubmit }) => {
  const { user } = useSelector((state) => state.auth);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [images, setImages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch categories and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, departmentsRes] = await Promise.all([
          api.get("/categories"),
          api.get("/departments"),
        ]);

        console.log("📦 Categories Response:", categoriesRes.data);
        console.log("🏢 Departments Response:", departmentsRes.data);

        setCategories(categoriesRes.data.data || categoriesRes.data || []);
        setDepartments(departmentsRes.data.data || departmentsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      return;
    }

    setLoading(true);
    try {
      // Map frontend visibility to backend values
      const visibilityMap = {
        public: "company",
        department: "department",
        private: "private",
      };

      const postData = {
        title: title.trim() || "Untitled Post", // Backend requires title
        content: content.trim(),
        visibility: visibilityMap[visibility] || "company",
        category_id: categoryId || null,
      };

      // Add department_id if visibility is department
      if (visibility === "department" && departmentId) {
        postData.department_id = departmentId;
      }

      // If there are images, use FormData
      if (images.length > 0) {
        const formData = new FormData();
        formData.append("title", postData.title);
        formData.append("content", postData.content);
        formData.append("visibility", postData.visibility);
        if (postData.category_id) {
          formData.append("category_id", postData.category_id);
        }
        if (postData.department_id) {
          formData.append("department_id", postData.department_id);
        }

        // Append images
        images.forEach((img) => {
          formData.append("images", img.file);
        });

        await onSubmit(formData, true); // Pass true to indicate FormData
      } else {
        await onSubmit(postData);
      }

      // Reset form
      setTitle("");
      setContent("");
      setVisibility("public");
      setCategoryId("");
      setDepartmentId("");
      setImages([]);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setContent("");
      setVisibility("public");
      setCategoryId("");
      setDepartmentId("");
      setImages([]);
      setShowEmojiPicker(false);
      onClose();
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length + images.length > 10) {
      alert("You can only upload up to 10 images");
      return;
    }

    // Create preview URLs
    const newImages = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleEmojiSelect = (emoji) => {
    setContent(content + emoji);
  };

  const commonEmojis = [
    "😀",
    "😂",
    "😍",
    "🥰",
    "😊",
    "👍",
    "❤️",
    "🎉",
    "🔥",
    "✨",
    "💯",
    "🙏",
    "👏",
    "🎊",
    "🌟",
    "💪",
  ];

  const getCategoryIcon = (code) => {
    const icons = {
      announcement: <AnnouncementIcon fontSize="small" />,
      sharing: <ShareIcon fontSize="small" />,
      opinion: <OpinionIcon fontSize="small" />,
      event: <EventIcon fontSize="small" />,
      discussion: <DiscussionIcon fontSize="small" />,
      question: <QuestionIcon fontSize="small" />,
      social: <SocialIcon fontSize="small" />,
    };
    return icons[code] || <DiscussionIcon fontSize="small" />;
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
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

  const getVisibilityLabel = () => {
    switch (visibility) {
      case "public":
        return "Public";
      case "private":
        return "Private";
      case "department":
        return "Department";
      default:
        return "Public";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pb: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Create Post
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: "text.secondary",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 2 }}>
        {/* User Info */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            src={user?.profile?.avatar_url}
            sx={{ width: 40, height: 40 }}
          >
            {user?.full_name?.[0] || user?.username?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.full_name || user?.username}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                renderValue={(value) => (
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    {getVisibilityIcon()}
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.8125rem", fontWeight: 600 }}
                    >
                      {getVisibilityLabel()}
                    </Typography>
                  </Stack>
                )}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiSelect-select": {
                    py: 0.5,
                    px: 1,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 1,
                    bgcolor: "background.default",
                  },
                }}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>

        {/* Title Input */}
        <TextField
          fullWidth
          placeholder="Add a title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          size="small"
        />

        {/* Content Input */}
        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder={`What's on your mind, ${
            user?.full_name || user?.username
          }?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                border: "none",
              },
            },
          }}
        />

        {/* Category Selector */}
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              label="Category"
            >
              <MenuItem value="">
                <em>No Category</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getCategoryIcon(category.code)}
                    <Typography>{category.name}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Department Selector (show only when visibility is department) */}
        {visibility === "department" && (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Department *</InputLabel>
              <Select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                label="Department *"
                required
              >
                <MenuItem value="">
                  <em>Select Department</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Image Preview */}
        {images.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {images.map((img, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0,0,0,0.6)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(0,0,0,0.8)",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: "background.default",
              border: 1,
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {commonEmojis.map((emoji, index) => (
                <IconButton
                  key={index}
                  size="small"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  <Typography variant="h6">{emoji}</Typography>
                </IconButton>
              ))}
            </Stack>
          </Box>
        )}

        {/* Add to Post Section */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Add to your post
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <IconButton size="small" color="success" component="span">
                  <ImageIcon />
                </IconButton>
              </label>
              <IconButton
                size="small"
                color="warning"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <EmojiIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                disabled
                title="Video upload coming soon"
              >
                <VideoIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          sx={{
            borderRadius: 2,
            py: 1,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.9375rem",
          }}
        >
          {loading ? "Posting..." : "Post"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostDialog;
